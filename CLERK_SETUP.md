# Clerk Authentication Setup for Twino

This document guides you through the Clerk authentication setup and integration with your Supabase database.

## 1. Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for an account
2. Create a new application in the Clerk dashboard
3. Configure your application settings (authentication methods, appearance, etc.)

## 2. Get Your API Keys

In your Clerk dashboard:

1. Go to "API Keys" from the sidebar
2. Copy the following keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

## 3. Configure Webhook

To sync user data to your Supabase database:

1. In Clerk dashboard, go to "Webhooks"
2. Create a new webhook endpoint with URL: `https://your-domain.com/api/clerk-webhook`
3. Subscribe to the following events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
4. Copy the "Signing Secret" - this is your `CLERK_WEBHOOK_SECRET`

## 4. Update Environment Variables

Add the following variables to your `.env.local` file:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***
CLERK_SECRET_KEY=sk_***
CLERK_WEBHOOK_SECRET=whsec_***
```

## 5. Create Supabase Users Table

Execute the SQL in `supabase/users_table.sql` in your Supabase dashboard SQL editor to create the users table.

## 6. Test Your Setup

1. Start your development server: `npm run dev`
2. Visit your website and sign up with Clerk
3. Check your Supabase database to confirm user data is being synced

## How It Works

- **Authentication**: Clerk handles all authentication (signup, login, session management)
- **Middleware**: Protects routes, ensuring only authenticated users can access certain pages
- **Data Sync**: Webhook syncs user data from Clerk to your Supabase database
- **User Info**: Displays user information in the navbar when signed in

## Protected Routes

All routes are protected except:
- Homepage `/`
- API routes for public access: `/api/asker`, `/api/generate-title`

To modify protected routes, update the `publicRoutes` array in the `middleware.js` file.
