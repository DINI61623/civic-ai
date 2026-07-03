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

  // First, find the user in auth.users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching users:', authError.message);
    process.exit(1);
  }

  const user = users.find(u => u.email === email);

  if (!user) {
    console.log(`❌ Failed. Could not find an account with email ${email}. Please sign up first.`);
    process.exit(1);
  }

  // Upsert the profile for this user
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id, 
      email: user.email, 
      full_name: user.user_metadata?.full_name || 'Admin',
      role: 'admin' 
    });

  if (upsertError) {
    console.error('Error updating profile:', upsertError.message);
  } else {
    console.log(`✅ Success! ${email} is now an admin. You can now access /admin`);
  }
}

const emailArgs = process.argv.slice(2);
promoteAdmin(emailArgs[0]);
