import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['states', 'departments', 'exams', 'schemes', 'scholarships', 'education'];
  
  console.log('Checking Supabase tables...\n');
  
  for (const table of tables) {
    const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table '${table}': ERROR - ${error.message}`);
    } else {
      console.log(`✅ Table '${table}': EXISTS (${count} rows)`);
    }
  }
}

checkTables();
