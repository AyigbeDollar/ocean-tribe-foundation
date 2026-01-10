# Ocean Tribe Foundation - Deployment Guide

## 🌊 Project Overview

Ocean Tribe Foundation is a Ghana-based NGO website dedicated to ocean restoration, waste management, and recycling. This is a full-stack React application built with Vite, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database and authentication)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Production Build

### Build Command
```bash
npm run build
```

The production build will be created in the `dist/` directory, optimized with:
- Code splitting for better performance
- Minified JavaScript and CSS
- Optimized asset loading

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Your site will be live at `your-project.vercel.app`

### Option 2: Netlify
1. Install Netlify CLI: `npm i -g netlify-cli`
2. Run: `netlify deploy --prod`
3. Follow the prompts
4. Your site will be live at `your-project.netlify.app`

### Option 3: GitHub Pages
1. Update `vite.config.ts` with `base: '/your-repo-name/'`
2. Build: `npm run build`
3. Deploy `dist/` folder to GitHub Pages

### Option 4: Traditional Hosting
1. Run `npm run build`
2. Upload the `dist/` folder to your web server
3. Configure your server to serve `index.html` for all routes (SPA routing)

## 🔧 Environment Configuration

### Supabase Setup
The application uses Supabase for:
- User authentication
- Database (PostgreSQL)
- File storage (for gallery images)

**Current Configuration:**
- Supabase URL: `https://cevukbhcdneirtffoxnp.supabase.co`
- API Key: Configured in `src/integrations/supabase/client.ts`

**To use your own Supabase instance:**
1. Create a new Supabase project
2. Update `src/integrations/supabase/client.ts` with your credentials
3. Run database migrations from `supabase/migrations/`

## 📋 Pre-Launch Checklist

### ✅ Functionality
- [ ] User authentication (sign up, sign in, sign out)
- [ ] Event creation and management
- [ ] Community management
- [ ] Gallery image upload and display
- [ ] Admin dashboard functionality
- [ ] User dashboard
- [ ] Contact page

### ✅ Testing
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Test authentication flow
- [ ] Test admin features
- [ ] Test image uploads
- [ ] Test all forms

### ✅ Performance
- [ ] Run production build
- [ ] Check bundle size
- [ ] Test page load times
- [ ] Optimize images
- [ ] Enable compression

### ✅ SEO
- [ ] Meta tags configured (already in `index.html`)
- [ ] Open Graph tags
- [ ] Sitemap (if needed)
- [ ] robots.txt (already configured)

### ✅ Security
- [ ] Supabase RLS policies enabled
- [ ] API keys secured (not exposed in client code)
- [ ] HTTPS enabled
- [ ] CORS configured properly

## 🗄️ Database Setup

### Required Supabase Tables
- `profiles` - User profiles
- `communities` - Community information
- `events` - Event information
- `gallery` - Image gallery
- `user_roles` - Admin roles
- `user_communities` - User-community relationships
- `user_events` - User-event relationships

### Database Functions
- `is_admin(user_id)` - Check if user is admin
- `get_events_safe()` - Get events with permissions
- `get_gallery_safe()` - Get gallery with permissions
- `user_owns_event(event_id)` - Check event ownership
- `user_owns_gallery_item(gallery_id)` - Check gallery ownership

All migrations are in `supabase/migrations/` directory.

## 🔐 Admin Setup

To create the first admin user:

1. Sign up for an account
2. Open browser console (F12)
3. Run: `await makeAdmin()`
4. Refresh the page
5. You should now have admin access

## 📱 Features

### Public Features
- Homepage with hero section and gallery carousel
- Browse events
- Browse communities
- Contact page

### User Features (Requires Login)
- Personal dashboard
- Join events
- Join communities
- View personal impact statistics

### Admin Features
- Admin dashboard
- Create/edit/delete events
- Create/edit/delete communities
- Manage gallery
- User management
- View analytics

## 🐛 Troubleshooting

### Authentication Issues
- Check Supabase connection
- Verify email confirmation is enabled
- Check browser console for errors
- Verify Supabase credentials

### Build Issues
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check Node.js version (requires 18+)

### Deployment Issues
- Ensure all environment variables are set
- Check that `dist/` folder is being served correctly
- Verify SPA routing is configured (all routes serve `index.html`)

## 📞 Support

For issues or questions:
- Email: oceantribefoundation@gmail.com
- Website: https://oceantribefoundation.org

## 📄 License

This project is proprietary software for Ocean Tribe Foundation.

---

**Built with ❤️ for Ocean Conservation**


