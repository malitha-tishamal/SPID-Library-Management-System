import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vulwqnplihaekhsybrls.supabase.co';
const supabaseKey = 'sb_publishable_Y-XLLNThRldE3StnGz-OfA_Lo6Kky5L'; // Or we can retrieve from .env.local

async function run() {
  const client = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('email', 'malitha@spid.gov.lk');
  
  if (error) {
    console.error('Error fetching profile:', error);
  } else {
    console.log('Profile search result:', data);
  }
}

run();
