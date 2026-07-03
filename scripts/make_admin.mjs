import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function promoteAdmin(email) {
  if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
  }

  console.log(`Attempting to promote ${email} to admin...`);

  // Update the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('email', email)
    .select();

  if (error) {
    console.error('Error:', error.message);
  } else if (data && data.length > 0) {
    console.log(`✅ Success! ${email} is now an admin.`);
  } else {
    console.log(`❌ Failed. Could not find a profile with email ${email}. Make sure the user has signed up first.`);
  }
}

const emailArgs = process.argv.slice(2);
promoteAdmin(emailArgs[0]);
