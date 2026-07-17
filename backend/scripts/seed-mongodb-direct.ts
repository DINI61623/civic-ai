import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import {
  FALLBACK_STATES,
  FALLBACK_DEPARTMENTS,
  FALLBACK_EXAMS,
  FALLBACK_SCHEMES,
  FALLBACK_SCHOLARSHIPS,
  FALLBACK_EDUCATION
} from '../src/lib/fallbackData';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoUri = (process.env.MONGODB_URI || '').trim();
const dbName = process.env.MONGODB_DB || 'civic_ai';

if (!mongoUri) {
  console.error('Error: MONGODB_URI is not set in backend/.env file.');
  process.exit(1);
}

async function run() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    console.log('Connected successfully to MongoDB database:', dbName);
    const db = client.db(dbName);

    // Map states and departments for quick lookup to construct enriched objects
    const statesMap = new Map(FALLBACK_STATES.map(s => [s.id, s]));
    const deptsMap = new Map(FALLBACK_DEPARTMENTS.map(d => [d.id, d]));
    const stateNameToId = new Map(FALLBACK_STATES.map(s => [s.name, s.id]));

    const seedData = [
      {
        collectionName: 'states',
        data: FALLBACK_STATES
      },
      {
        collectionName: 'departments',
        data: FALLBACK_DEPARTMENTS
      },
      {
        collectionName: 'exams',
        data: FALLBACK_EXAMS.map(exam => ({
          ...exam,
          states: exam.state_id ? { name: statesMap.get(exam.state_id)?.name ?? 'All India' } : null,
          departments: exam.department_id ? { name: deptsMap.get(exam.department_id)?.name ?? '' } : null
        }))
      },
      {
        collectionName: 'schemes',
        data: FALLBACK_SCHEMES.map(scheme => ({
          ...scheme,
          states: scheme.state_id ? { name: statesMap.get(scheme.state_id)?.name ?? 'All India' } : null,
          departments: scheme.department_id ? { name: deptsMap.get(scheme.department_id)?.name ?? '' } : null
        }))
      },
      {
        collectionName: 'scholarships',
        data: FALLBACK_SCHOLARSHIPS.map(scholarship => ({
          ...scholarship,
          states: scholarship.state_id ? { name: statesMap.get(scholarship.state_id)?.name ?? 'All India' } : null
        }))
      },
      {
        collectionName: 'education',
        data: FALLBACK_EDUCATION.map(edu => {
          const stateName = edu.state || 'All India';
          const stateId = stateNameToId.get(stateName) || null;
          return {
            id: edu.id,
            title: edu.name,
            type: edu.type,
            details: edu.details,
            state_id: stateId,
            official_website: edu.website,
            admission_criteria: edu.admission_criteria,
            programs: edu.programs,
            facilities: edu.facilities,
            states: { name: stateName }
          };
        })
      }
    ];

    for (const item of seedData) {
      const collection = db.collection(item.collectionName);
      console.log(`Seeding collection "${item.collectionName}" with ${item.data.length} records...`);

      if (item.data.length > 0) {
        // Use bulkWrite replaceOne with upsert to prevent duplicates if run multiple times
        const operations = item.data.map((doc: any) => ({
          replaceOne: {
            filter: { id: doc.id },
            replacement: doc,
            upsert: true
          }
        }));
        const result = await collection.bulkWrite(operations);
        console.log(`Collection "${item.collectionName}" seeded:`, {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount
        });
      }

      // Create index on id field
      await collection.createIndex({ id: 1 }, { unique: true });
    }

    // Create custom indexes for saved_items and search
    console.log('Creating additional indices...');
    await db.collection('saved_items').createIndex(
      { user_id: 1, item_type: 1, item_id: 1 },
      { unique: true }
    );

    for (const coll of ['exams', 'schemes', 'scholarships', 'education']) {
      await db.collection(coll).createIndex(
        { title: 'text', description: 'text', details: 'text' }
      );
      await db.collection(coll).createIndex({ 'states.name': 1 });
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

run();
