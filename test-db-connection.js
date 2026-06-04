import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnection() {
  try {
    // Test 1: Check if we can query the profiles table
    console.log('\n1. Testing profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Profiles query failed:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('Found', profiles.length, 'profiles');
      if (profiles.length > 0) {
        console.log('Sample:', profiles[0]);
      }
    }

    // Test 2: Check for the admin user
    console.log('\n2. Checking for admin user (jobopeningskenya@gmail.com)...');
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role, full_name')
      .eq('email', 'jobopeningskenya@gmail.com')
      .single();
    
    if (adminError) {
      if (adminError.code === 'PGRST116') {
        console.log('⚠️  Admin user not found in profiles table');
      } else {
        console.error('❌ Admin query failed:', adminError.message);
      }
    } else {
      console.log('✅ Admin user found:', adminProfile);
    }

    // Test 3: Check auth users
    console.log('\n3. Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth users query failed:', authError.message);
    } else {
      console.log('✅ Auth users accessible');
      console.log('Total auth users:', authUsers.users.length);
      
      const adminAuth = authUsers.users.find(u => u.email === 'jobopeningskenya@gmail.com');
      if (adminAuth) {
        console.log('✅ Admin user found in auth.users:', {
          id: adminAuth.id,
          email: adminAuth.email,
          confirmed: adminAuth.email_confirmed_at !== null
        });
      } else {
        console.log('⚠️  Admin user not found in auth.users');
      }
    }

    // Test 4: Check jobs table
    console.log('\n4. Testing jobs table...');
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, status')
      .limit(3);
    
    if (jobsError) {
      console.error('❌ Jobs query failed:', jobsError.message);
    } else {
      console.log('✅ Jobs table accessible');
      console.log('Found', jobs.length, 'jobs');
    }

    console.log('\n=== Connection Test Complete ===');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();
