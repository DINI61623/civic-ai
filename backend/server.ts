import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  FALLBACK_STATES,
  FALLBACK_DEPARTMENTS,
  FALLBACK_EXAMS,
  FALLBACK_SCHEMES,
  FALLBACK_SCHOLARSHIPS,
  FALLBACK_EDUCATION
} from './src/lib/fallbackData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// MongoDB connection helper
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'civic_ai';
let db: Db | null = null;
const useMockDb = !mongoUri;

if (!useMockDb) {
  MongoClient.connect(mongoUri!)
    .then(client => {
      db = client.db(dbName);
      console.log('Connected to MongoDB database:', dbName);
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB:', err);
    });
} else {
  console.log('MONGODB_URI is not set. Express server is running in MOCK mode using local datasets.');
}

// In-memory bookmarks for mock mode
const mockSavedItems: any[] = [];

// Auth middleware to authenticate requests from frontend
app.use(async (req: any, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const mockUserHeader = req.headers['x-mock-user'];

  if (mockUserHeader) {
    try {
      req.user = JSON.parse(mockUserHeader as string);
      return next();
    } catch (e) {}
  }

  // Supabase real token validation if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (token && supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = user;
      }
    } catch (e) {
      console.error('Token verification error:', e);
    }
  }

  next();
});

// Helper for clean data output
function clean(doc: any) {
  if (!doc) return null;
  const { _id, ...data } = doc;
  return { ...data, id: String(data.id ?? _id) };
}

// Helper to escape regex search query
function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /api/data
app.get('/api/data', async (req: any, res) => {
  try {
    const resource = req.query.resource as string;
    const user = req.user;

    if (useMockDb) {
      return handleMockGet(req, res, user);
    }

    if (!db) {
      return res.status(500).json({ error: 'Database not initialized' });
    }

    if (resource === 'saved-items') {
      if (!user) return res.json({ data: [] });
      const docs = await db.collection('saved_items').find({ user_id: user.id }).sort({ created_at: -1 }).toArray();
      return res.json({ data: docs.map(clean) });
    }

    if (resource === 'saved-status') {
      if (!user) return res.json({ saved: false });
      const saved = await db.collection('saved_items').findOne({
        user_id: user.id,
        item_type: req.query.itemType as string,
        item_id: req.query.itemId as string,
      });
      return res.json({ saved: Boolean(saved) });
    }

    if (resource === 'statistics') {
      const [examsCount, schemesCount, scholarshipsCount, usersCount] = await Promise.all([
        db.collection('exams').countDocuments(),
        db.collection('schemes').countDocuments(),
        db.collection('scholarships').countDocuments(),
        db.collection('profiles').countDocuments(),
      ]);
      return res.json({ examsCount, schemesCount, scholarshipsCount, usersCount });
    }

    if (resource === 'search') {
      const q = (req.query.q as string)?.trim();
      if (!q || q.length < 2) return res.json({ exams: [], schemes: [], scholarships: [], education: [] });
      const regex = new RegExp(escapeRegex(q), 'i');
      const find = (name: string, bodyField: string) => db!.collection(name)
        .find({ $or: [{ title: regex }, { [bodyField]: regex }] })
        .project({ _id: 0, id: 1, title: 1, states: 1 }).limit(3).toArray();
      const [exams, schemes, scholarships, education] = await Promise.all([
        find('exams', 'description'), find('schemes', 'description'),
        find('scholarships', 'description'), find('education', 'details'),
      ]);
      return res.json({ exams, schemes, scholarships, education });
    }

    const publicCollections = ['exams', 'schemes', 'scholarships', 'education', 'states', 'departments'];
    if (!publicCollections.includes(resource)) {
      return res.status(400).json({ error: 'Invalid resource' });
    }

    const collection = db.collection(resource);
    const id = req.query.id as string;
    if (id) {
      const doc = await collection.findOne({ id });
      return doc ? res.json(clean(doc)) : res.status(404).json({ error: 'Not found' });
    }

    const filter: any = {};
    const q = (req.query.q as string)?.trim();
    const field = req.query.field as string;
    const value = req.query.value as string;
    const state = req.query.state as string;

    if (q) {
      const regex = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ title: regex }, { description: regex }, { details: regex }];
    }
    if (field && value) filter[field] = new RegExp(escapeRegex(value), 'i');
    if (state && state !== 'All India') filter['states.name'] = { $in: ['All India', state] };

    const page = Math.max(0, Number(req.query.page) || 0);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const sortField = (req.query.sort as string) || 'last_updated';
    const sortDirection = req.query.direction === 'asc' ? 1 : -1;

    const [docs, count] = await Promise.all([
      collection.find(filter).sort({ [sortField]: sortDirection }).skip(page * limit).limit(limit).toArray(),
      collection.countDocuments(filter),
    ]);
    return res.json({ data: docs.map(clean), count });

  } catch (error: any) {
    console.error('Express GET /api/data error:', error);
    return res.status(500).json({ error: error.message || 'Database request failed' });
  }
});

// POST /api/data
app.post('/api/data', async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    const { itemType, itemId } = req.body;
    if (!itemType || !itemId) return res.status(400).json({ error: 'itemType and itemId are required' });

    if (useMockDb) {
      const existingIndex = mockSavedItems.findIndex(
        item => item.user_id === user.id && item.item_type === itemType && item.item_id === itemId
      );
      if (existingIndex === -1) {
        mockSavedItems.push({
          id: crypto.randomUUID(),
          user_id: user.id,
          item_type: itemType,
          item_id: itemId,
          created_at: new Date()
        });
      }
      return res.status(201).json({ ok: true });
    }

    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    await db.collection('saved_items').updateOne(
      { user_id: user.id, item_type: itemType, item_id: itemId },
      { $setOnInsert: { id: crypto.randomUUID(), user_id: user.id, item_type: itemType, item_id: itemId, created_at: new Date() } },
      { upsert: true }
    );
    return res.status(201).json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unable to save item' });
  }
});

// DELETE /api/data
app.delete('/api/data', async (req: any, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (useMockDb) {
      const id = req.query.id as string;
      if (id) {
        const index = mockSavedItems.findIndex(item => item.user_id === user.id && item.id === id);
        if (index !== -1) mockSavedItems.splice(index, 1);
      } else {
        const itemType = req.query.itemType as string;
        const itemId = req.query.itemId as string;
        const index = mockSavedItems.findIndex(
          item => item.user_id === user.id && item.item_type === itemType && item.item_id === itemId
        );
        if (index !== -1) mockSavedItems.splice(index, 1);
      }
      return res.json({ ok: true });
    }

    if (!db) return res.status(500).json({ error: 'Database not initialized' });

    const filter: any = { user_id: user.id };
    if (req.query.id) filter.id = req.query.id as string;
    else {
      filter.item_type = (req.query.itemType as string) || '';
      filter.item_id = (req.query.itemId as string) || '';
    }
    await db.collection('saved_items').deleteOne(filter);
    return res.json({ ok: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Unable to remove item' });
  }
});

function handleMockGet(req: any, res: any, user: any) {
  const resource = req.query.resource as string;

  if (resource === 'saved-items') {
    if (!user) return res.json({ data: [] });
    return res.json({ data: mockSavedItems.filter(item => item.user_id === user.id) });
  }

  if (resource === 'saved-status') {
    if (!user) return res.json({ saved: false });
    const saved = mockSavedItems.some(
      item => item.user_id === user.id && 
              item.item_type === req.query.itemType && 
              item.item_id === req.query.itemId
    );
    return res.json({ saved });
  }

  if (resource === 'statistics') {
    return res.json({
      examsCount: FALLBACK_EXAMS.length,
      schemesCount: FALLBACK_SCHEMES.length,
      scholarshipsCount: FALLBACK_SCHOLARSHIPS.length,
      usersCount: 150
    });
  }

  if (resource === 'search') {
    const q = (req.query.q as string)?.trim();
    if (!q || q.length < 2) return res.json({ exams: [], schemes: [], scholarships: [], education: [] });
    const qLower = q.toLowerCase();
    
    const filterFn = (items: any[]) => items
      .filter(item => item.title?.toLowerCase().includes(qLower) || item.description?.toLowerCase().includes(qLower))
      .slice(0, 3);
      
    return res.json({
      exams: filterFn(FALLBACK_EXAMS),
      schemes: filterFn(FALLBACK_SCHEMES),
      scholarships: filterFn(FALLBACK_SCHOLARSHIPS),
      education: FALLBACK_EDUCATION.filter((item: any) => item.name?.toLowerCase().includes(qLower) || item.details?.toLowerCase().includes(qLower)).slice(0, 3)
    });
  }

  let fallbackList: any[] = [];
  if (resource === 'states') fallbackList = FALLBACK_STATES;
  else if (resource === 'departments') fallbackList = FALLBACK_DEPARTMENTS;
  else if (resource === 'exams') fallbackList = FALLBACK_EXAMS;
  else if (resource === 'schemes') fallbackList = FALLBACK_SCHEMES;
  else if (resource === 'scholarships') fallbackList = FALLBACK_SCHOLARSHIPS;
  else if (resource === 'education') fallbackList = FALLBACK_EDUCATION;
  else return res.status(400).json({ error: 'Invalid resource' });

  const id = req.query.id as string;
  if (id) {
    const doc = fallbackList.find(item => item.id === id);
    return doc ? res.json(doc) : res.status(404).json({ error: 'Not found' });
  }

  let data = [...fallbackList];
  const q = (req.query.q as string)?.trim();
  const field = req.query.field as string;
  const value = req.query.value as string;
  const state = req.query.state as string;

  if (q) {
    const qLower = q.toLowerCase();
    data = data.filter(item => 
      (item.title || item.name || '')?.toLowerCase().includes(qLower) || 
      (item.description || item.details || '')?.toLowerCase().includes(qLower)
    );
  }

  if (field && value) {
    const valLower = value.toLowerCase();
    data = data.filter(item => String(item[field] || '')?.toLowerCase() === valLower);
  }

  if (state && state !== 'All India') {
    data = data.filter(item => !item.states?.name || item.states.name === 'All India' || item.states.name === state);
  }

  const page = Math.max(0, Number(req.query.page) || 0);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  
  const paginatedData = data.slice(page * limit, (page + 1) * limit);
  return res.json({ data: paginatedData, count: data.length });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
