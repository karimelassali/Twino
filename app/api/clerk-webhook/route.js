import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

// This API route handles Clerk webhook events
// It syncs user data from Clerk to Supabase
export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    return new Response('Missing webhook secret', { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  let evt;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error verifying webhook', { status: 400 });
  }

  // Get the event type
  const eventType = evt.type;
  
  // Initialize Supabase client
  const supabase = createClient();

  // Handle user created/updated events
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;
    
    // Get primary email
    const primaryEmail = email_addresses.find(email => email.id === evt.data.primary_email_address_id)?.email_address;
    
    // Upsert user data to your Supabase users table
    const { error } = await supabase
      .from('users')
      .upsert({
        id: id,
        email: primaryEmail,
        first_name: first_name,
        last_name: last_name,
        username: username,
        avatar_url: image_url,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    
    if (error) {
      console.error('Error upserting user to Supabase:', error);
      return new Response('Error syncing user data', { status: 500 });
    }
  }
  
  // Handle user deleted event
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    // You might want to handle user deletion differently based on your needs
    // For example, you might want to soft delete instead of hard delete
    const { error } = await supabase
      .from('users')
      .update({ 
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking user as deleted in Supabase:', error);
      return new Response('Error handling user deletion', { status: 500 });
    }
  }

  return new Response('Webhook received', { status: 200 });
}
