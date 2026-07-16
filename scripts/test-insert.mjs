import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  const { data, error } = await supabase.from('states').insert([{ name: 'Test State' }]).select();
  if (error) {
    console.error('❌ Insert failed:', error);
  } else {
    console.log('✅ Insert succeeded:', data);
    // clean it up
    await supabase.from('states').delete().eq('id', data[0].id);
  }
}

testInsert();
