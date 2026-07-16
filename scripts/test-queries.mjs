import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Read .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQueries() {
  // 1. Let's list some IDs from each table
  const tables = ['exams', 'schemes', 'scholarships', 'education'];
  for (const table of tables) {
    console.log(`\n--- Fetching records for table: ${table} ---`);
    const { data, error } = await supabase.from(table).select('id, title');
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      continue;
    }
    console.log(`Found ${data.length} records. Here they are:`);
    console.log(data);

    if (data.length > 0) {
      const sampleId = data[0].id;
      console.log(`Testing query for single record with ID: ${sampleId}`);

      let query;
      if (table === 'exams') {
        query = supabase.from('exams').select('*, states(name), departments(name)').eq('id', sampleId).single();
      } else if (table === 'schemes') {
        query = supabase.from('schemes').select('*, states(name), departments(name)').eq('id', sampleId).single();
      } else if (table === 'scholarships') {
        query = supabase.from('scholarships').select('*, states(name)').eq('id', sampleId).single();
      } else if (table === 'education') {
        query = supabase.from('education').select('*, states(name)').eq('id', sampleId).single();
      }

      const res = await query;
      if (res.error) {
        console.error(`❌ Query error for ${table}:`, res.error);
      } else {
        console.log(`✅ Query success for ${table}:`, Object.keys(res.data));
        console.log('Returned data state field:', res.data.states);
        if (table === 'exams' || table === 'schemes') {
          console.log('Returned data department field:', res.data.departments);
        }
      }
    }
  }
}

testQueries();
