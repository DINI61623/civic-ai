"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongodb_1 = require("mongodb");
const supabase_js_1 = require("@supabase/supabase-js");
const crypto_1 = __importDefault(require("crypto"));
const fallbackData_1 = require("./src/lib/fallbackData");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
// MongoDB connection helper
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'civic_ai';
let db = null;
const useMockDb = !mongoUri;
if (!useMockDb) {
    mongodb_1.MongoClient.connect(mongoUri)
        .then(client => {
        db = client.db(dbName);
        console.log('Connected to MongoDB database:', dbName);
    })
        .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });
}
else {
    console.log('MONGODB_URI is not set. Express server is running in MOCK mode using local datasets.');
}
// In-memory bookmarks for mock mode
const mockSavedItems = [];
// Auth middleware to authenticate requests from frontend
app.use(async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const mockUserHeader = req.headers['x-mock-user'];
    if (process.env.NODE_ENV !== 'production' && mockUserHeader) {
        try {
            req.user = JSON.parse(mockUserHeader);
            return next();
        }
        catch (e) { }
    }
    // Supabase real token validation if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (token && supabaseUrl && supabaseAnonKey) {
        try {
            const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (!error && user) {
                req.user = user;
            }
        }
        catch (e) {
            console.error('Token verification error:', e);
        }
    }
    next();
});
// Helper for clean data output
function clean(doc) {
    if (!doc)
        return null;
    const { _id, ...data } = doc;
    return { ...data, id: String(data.id ?? _id) };
}
// Helper to escape regex search query
function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// GET /api/data
app.get('/api/data', async (req, res) => {
    try {
        const resource = req.query.resource;
        const user = req.user;
        if (useMockDb) {
            return handleMockGet(req, res, user);
        }
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }
        if (resource === 'saved-items') {
            if (!user)
                return res.json({ data: [] });
            const docs = await db.collection('saved_items').find({ user_id: user.id }).sort({ created_at: -1 }).toArray();
            return res.json({ data: docs.map(clean) });
        }
        if (resource === 'saved-status') {
            if (!user)
                return res.json({ saved: false });
            const saved = await db.collection('saved_items').findOne({
                user_id: user.id,
                item_type: req.query.itemType,
                item_id: req.query.itemId,
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
            const q = req.query.q?.trim();
            if (!q || q.length < 2)
                return res.json({ exams: [], schemes: [], scholarships: [], education: [] });
            const regex = new RegExp(escapeRegex(q), 'i');
            const find = (name, bodyField) => db.collection(name)
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
        const id = req.query.id;
        if (id) {
            const doc = await collection.findOne({ id });
            return doc ? res.json(clean(doc)) : res.status(404).json({ error: 'Not found' });
        }
        const filter = {};
        const q = req.query.q?.trim();
        const field = req.query.field;
        const value = req.query.value;
        const state = req.query.state;
        if (q) {
            const regex = new RegExp(escapeRegex(q), 'i');
            filter.$or = [{ title: regex }, { description: regex }, { details: regex }];
        }
        if (field && value)
            filter[field] = new RegExp(escapeRegex(value), 'i');
        if (state && state !== 'All India')
            filter['states.name'] = { $in: ['All India', state] };
        const page = Math.max(0, Number(req.query.page) || 0);
        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const sortField = req.query.sort || 'last_updated';
        const sortDirection = req.query.direction === 'asc' ? 1 : -1;
        const [docs, count] = await Promise.all([
            collection.find(filter).sort({ [sortField]: sortDirection }).skip(page * limit).limit(limit).toArray(),
            collection.countDocuments(filter),
        ]);
        return res.json({ data: docs.map(clean), count });
    }
    catch (error) {
        console.error('Express GET /api/data error:', error);
        return res.status(500).json({ error: error.message || 'Database request failed' });
    }
});
// POST /api/data
app.post('/api/data', async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { itemType, itemId } = req.body;
        if (!itemType || !itemId)
            return res.status(400).json({ error: 'itemType and itemId are required' });
        if (useMockDb) {
            const existingIndex = mockSavedItems.findIndex(item => item.user_id === user.id && item.item_type === itemType && item.item_id === itemId);
            if (existingIndex === -1) {
                mockSavedItems.push({
                    id: crypto_1.default.randomUUID(),
                    user_id: user.id,
                    item_type: itemType,
                    item_id: itemId,
                    created_at: new Date()
                });
            }
            return res.status(201).json({ ok: true });
        }
        if (!db)
            return res.status(500).json({ error: 'Database not initialized' });
        await db.collection('saved_items').updateOne({ user_id: user.id, item_type: itemType, item_id: itemId }, { $setOnInsert: { id: crypto_1.default.randomUUID(), user_id: user.id, item_type: itemType, item_id: itemId, created_at: new Date() } }, { upsert: true });
        return res.status(201).json({ ok: true });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Unable to save item' });
    }
});
// DELETE /api/data
app.delete('/api/data', async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (useMockDb) {
            const id = req.query.id;
            if (id) {
                const index = mockSavedItems.findIndex(item => item.user_id === user.id && item.id === id);
                if (index !== -1)
                    mockSavedItems.splice(index, 1);
            }
            else {
                const itemType = req.query.itemType;
                const itemId = req.query.itemId;
                const index = mockSavedItems.findIndex(item => item.user_id === user.id && item.item_type === itemType && item.item_id === itemId);
                if (index !== -1)
                    mockSavedItems.splice(index, 1);
            }
            return res.json({ ok: true });
        }
        if (!db)
            return res.status(500).json({ error: 'Database not initialized' });
        const filter = { user_id: user.id };
        if (req.query.id)
            filter.id = req.query.id;
        else {
            filter.item_type = req.query.itemType || '';
            filter.item_id = req.query.itemId || '';
        }
        await db.collection('saved_items').deleteOne(filter);
        return res.json({ ok: true });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Unable to remove item' });
    }
});
function handleMockGet(req, res, user) {
    const resource = req.query.resource;
    if (resource === 'saved-items') {
        if (!user)
            return res.json({ data: [] });
        return res.json({ data: mockSavedItems.filter(item => item.user_id === user.id) });
    }
    if (resource === 'saved-status') {
        if (!user)
            return res.json({ saved: false });
        const saved = mockSavedItems.some(item => item.user_id === user.id &&
            item.item_type === req.query.itemType &&
            item.item_id === req.query.itemId);
        return res.json({ saved });
    }
    if (resource === 'statistics') {
        return res.json({
            examsCount: fallbackData_1.FALLBACK_EXAMS.length,
            schemesCount: fallbackData_1.FALLBACK_SCHEMES.length,
            scholarshipsCount: fallbackData_1.FALLBACK_SCHOLARSHIPS.length,
            usersCount: 150
        });
    }
    if (resource === 'search') {
        const q = req.query.q?.trim();
        if (!q || q.length < 2)
            return res.json({ exams: [], schemes: [], scholarships: [], education: [] });
        const qLower = q.toLowerCase();
        const filterFn = (items) => items
            .filter(item => item.title?.toLowerCase().includes(qLower) || item.description?.toLowerCase().includes(qLower))
            .slice(0, 3);
        return res.json({
            exams: filterFn(fallbackData_1.FALLBACK_EXAMS),
            schemes: filterFn(fallbackData_1.FALLBACK_SCHEMES),
            scholarships: filterFn(fallbackData_1.FALLBACK_SCHOLARSHIPS),
            education: fallbackData_1.FALLBACK_EDUCATION.filter((item) => item.name?.toLowerCase().includes(qLower) || item.details?.toLowerCase().includes(qLower)).slice(0, 3)
        });
    }
    let fallbackList = [];
    if (resource === 'states')
        fallbackList = fallbackData_1.FALLBACK_STATES;
    else if (resource === 'departments')
        fallbackList = fallbackData_1.FALLBACK_DEPARTMENTS;
    else if (resource === 'exams')
        fallbackList = fallbackData_1.FALLBACK_EXAMS;
    else if (resource === 'schemes')
        fallbackList = fallbackData_1.FALLBACK_SCHEMES;
    else if (resource === 'scholarships')
        fallbackList = fallbackData_1.FALLBACK_SCHOLARSHIPS;
    else if (resource === 'education')
        fallbackList = fallbackData_1.FALLBACK_EDUCATION;
    else
        return res.status(400).json({ error: 'Invalid resource' });
    const id = req.query.id;
    if (id) {
        const doc = fallbackList.find(item => item.id === id);
        return doc ? res.json(doc) : res.status(404).json({ error: 'Not found' });
    }
    let data = [...fallbackList];
    const q = req.query.q?.trim();
    const field = req.query.field;
    const value = req.query.value;
    const state = req.query.state;
    if (q) {
        const qLower = q.toLowerCase();
        data = data.filter(item => (item.title || item.name || '')?.toLowerCase().includes(qLower) ||
            (item.description || item.details || '')?.toLowerCase().includes(qLower));
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
