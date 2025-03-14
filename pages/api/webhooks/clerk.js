import { Webhook } from 'svix';
import { buffer } from 'micro';
import supabase from '../../../lib/supabase';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Get the request body
  const payload = await buffer(req);
  const headerPayload = req.headers;

  // Verify the webhook
  const wh = new Webhook(webhookSecret);
  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': headerPayload['svix-id'],
      'svix-timestamp': headerPayload['svix-timestamp'],
      'svix-signature': headerPayload['svix-signature'],
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return res.status(400).json({ message: 'Invalid webhook' });
  }

  const eventType = evt.type;

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;

    try {
      const { data, error } = await supabase.rpc('handle_clerk_user_sync', {
        clerk_user_id: id,
        email: primaryEmail,
        first_name: first_name,
        last_name: last_name
      });

      if (error) throw error;

      return res.status(200).json({ message: 'User synced successfully', userId: data });
    } catch (error) {
      console.error('Error syncing user:', error);
      return res.status(500).json({ message: 'Error syncing user' });
    }
  }

  return res.status(200).json({ message: 'Webhook processed' });
} 