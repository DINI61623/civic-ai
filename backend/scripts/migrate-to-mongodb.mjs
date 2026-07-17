import { createClient } from '@supabase/supabase-js';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { MONGODB_URI, MONGODB_DB = 'civic_ai', NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!MONGODB_URI || !NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Set MONGODB_URI, NEXT_PUBLIC_SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const mongo = new MongoClient(MONGODB_URI);
const tableNames = ['states', 'departments', 'exams', 'schemes', 'scholarships', 'education', 'profiles', 'saved_items'];

async function readTable(table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase.from(table).select('*').range(from, from + 999);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

async function migrate() {
  await mongo.connect();
  const db = mongo.db(MONGODB_DB);
  const data = Object.fromEntries(await Promise.all(tableNames.map(async table => [table, await readTable(table)])));
  const states = new Map(data.states.map(row => [row.id, row]));
  const departments = new Map(data.departments.map(row => [row.id, row]));

  for (const table of tableNames) {
    const rows = data[table].map(row => {
      if (!['exams', 'schemes', 'scholarships', 'education'].includes(table)) return row;
      return {
        ...row,
        states: row.state_id ? { name: states.get(row.state_id)?.name ?? 'All India' } : null,
        ...(row.department_id ? { departments: { name: departments.get(row.department_id)?.name ?? '' } } : {}),
      };
    });
    const collection = db.collection(table);
    if (rows.length) {
      await collection.bulkWrite(rows.map(row => ({
        replaceOne: { filter: { id: row.id }, replacement: row, upsert: true },
      })));
    }
    await collection.createIndex({ id: 1 }, { unique: true });
    console.log(`${table}: migrated ${rows.length} records`);
  }

  await db.collection('saved_items').createIndex({ user_id: 1, item_type: 1, item_id: 1 }, { unique: true });
  for (const table of ['exams', 'schemes', 'scholarships', 'education']) {
    await db.collection(table).createIndex({ title: 'text', description: 'text', details: 'text' });
    await db.collection(table).createIndex({ 'states.name': 1 });
  }
  console.log(`Migration complete. MongoDB database: ${MONGODB_DB}`);
}

migrate().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => mongo.close());

