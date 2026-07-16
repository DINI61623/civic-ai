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

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['states', 'departments', 'exams', 'schemes', 'scholarships', 'education'];
  
  console.log('Checking Supabase tables...\n');
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table '${table}': ERROR - ${error.message}`);
      console.log(error);
    } else {
      console.log(`✅ Table '${table}': EXISTS (${data.length} rows sample)`);
      if (data.length > 0) {
        console.log('Sample keys:', Object.keys(data[0]));
      }
    }
  }
}

checkTables();
