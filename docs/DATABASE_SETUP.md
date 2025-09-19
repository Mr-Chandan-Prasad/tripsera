# Database Setup Guide for Tripsera

This guide will help you set up a real SQL database for your Tripsera travel website using Supabase.

## Prerequisites

1. A Supabase account (free at [supabase.com](https://supabase.com))
2. Node.js and npm/pnpm installed
3. Your project dependencies installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `tripsera-database` (or any name you prefer)
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 1-2 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 3: Configure Your Environment

1. Create a `.env.local` file in your project root directory
2. Add the following variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase credentials.

## Step 4: Run Database Migration

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/migrations/20250709171353_fancy_disk.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the migration
5. This will create all the necessary tables and set up the database schema

## Step 5: Install Dependencies and Run

1. Install the new Supabase dependency:
```bash
npm install
# or
pnpm install
```

2. Start your development server:
```bash
npm run dev
# or
pnpm dev
```

## Step 6: Verify Setup

1. Open your browser and go to your application
2. Check the browser console for any database connection messages
3. The app should automatically populate with sample data if the database is empty
4. Try creating a booking to test the database functionality

## Database Schema

Your database includes the following tables:

- **destinations** - Travel destinations with pricing
- **services** - Travel services offered
- **bookings** - Customer bookings
- **gallery** - Image gallery
- **testimonials** - Customer testimonials
- **advertisements** - Homepage advertisements
- **offers** - Special offers and packages
- **inquiries** - Customer inquiries
- **site_settings** - Website configuration

## Features

✅ **Real SQL Database** - All data is now stored in a PostgreSQL database
✅ **Automatic Fallback** - If database connection fails, the app falls back to localStorage
✅ **Sample Data** - Pre-populated with sample destinations, services, and content
✅ **File Uploads** - Images are stored in Supabase Storage
✅ **Row Level Security** - Database security policies are configured
✅ **Type Safety** - Full TypeScript support with proper database types

## Troubleshooting

### Database Connection Issues
- Check your `.env.local` file has the correct credentials
- Ensure your Supabase project is active
- Check the browser console for error messages

### Migration Issues
- Make sure you're running the migration in the correct Supabase project
- Check that all tables were created successfully in the Table Editor

### Sample Data Not Loading
- Check the browser console for initialization messages
- Verify the database tables exist and are accessible
- The app will fallback to localStorage if database operations fail

## Security Notes

- The anon key is safe to use in frontend applications
- Row Level Security (RLS) is enabled on all tables
- Public read access is configured for appropriate tables
- Admin operations require authentication

## Next Steps

1. **Customize Data**: Replace sample data with your actual content
2. **Add Authentication**: Set up user authentication for admin features
3. **Configure Storage**: Set up file storage buckets for images
4. **Monitor Usage**: Check your Supabase dashboard for usage statistics

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Verify your Supabase project settings
3. Ensure all environment variables are correctly set
4. The app includes fallback mechanisms to localStorage for offline functionality

Your Tripsera application is now powered by a real SQL database! 🎉
