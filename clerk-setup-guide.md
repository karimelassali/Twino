# Clerk Authentication Setup for Twino

This guide will help you complete the setup of Clerk authentication in your Twino application.

## 1. Sign Up for Clerk

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Choose your authentication methods (email, social providers, etc.)

## 2. Get API Keys

After creating your Clerk application:

1. Go to your Clerk Dashboard
2. Navigate to "API Keys" in the left sidebar
3. Copy the following keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

## 3. Add Environment Variables

Create or update your `.env.local` file with the following variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...your-publishable-key...
CLERK_SECRET_KEY=sk_test_...your-secret-key...
```

## 4. Set Up Clerk Webhook (Optional - For Syncing Data with Supabase)

If you want to sync Clerk user data to your Supabase database:

1. In your Clerk Dashboard, go to "Webhooks"
2. Create a new webhook with URL: `https://your-deployed-url/api/clerk-webhook`
3. Select the following events:
   - `user.created`
   - `user.updated` 
   - `user.deleted`
4. Copy the "Signing Secret" and add it to your `.env.local` file:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...your-webhook-secret...
   ```

## 5. Create Supabase Users Table

Execute the SQL in the `supabase/users_table.sql` file in your Supabase SQL Editor to create the users table.

## 6. Environment-Specific Configuration (Optional)

For production deployment, add these environment variables to your hosting provider (Vercel, etc.):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
```

## 7. How Authentication Works

- **Public Pages**: Your homepage is public
- **Protected Pages**: The chat page requires authentication
- **User Interface**: The navbar will display login/signup buttons when logged out, and the user's profile when logged in
- **User Data**: When a user signs up/in with Clerk, their data is synced to your Supabase database

## 8. Testing Your Setup

1. Start your development server with `npm run dev`
2. Try signing up and logging in
3. Check that you can access protected pages when logged in
4. Verify user data is being stored in your Supabase database

## 9. Next Steps

- Customize the Clerk appearance to match your app's design
- Add additional authentication methods if needed
- Create user profiles or additional user-specific features
