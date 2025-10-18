# Judo Academy - Deployment Guide

## Overview
This guide provides complete instructions for deploying the Judo Academy website with Supabase backend, from initial setup to production deployment.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development](#local-development)
4. [GitHub Repository Setup](#github-repository-setup)
5. [Vercel Deployment](#vercel-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Production Checklist](#production-checklist)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Accounts
- [ ] GitHub account
- [ ] Vercel account (free tier available)
- [ ] Supabase account (free tier available)

### Development Tools
- [ ] Node.js 16+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Modern web browser

### Knowledge Requirements
- Basic understanding of HTML, CSS, JavaScript
- Familiarity with Git and GitHub
- Basic knowledge of database concepts

## Supabase Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter project details:
   - **Name**: `judo-academy`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose closest to your target audience
4. Click "Create New Project"
5. Wait for project initialization (2-3 minutes)

### Step 2: Get Project Configuration
1. Once project is created, go to "Settings" → "API"
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Key** (starts with `eyJ`)
   - **Service Role Key** (for admin operations)

### Step 3: Set Up Database Schema
1. Go to "SQL Editor" in Supabase dashboard
2. Copy the entire content from `supabase-schema.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute all queries
5. Verify tables are created in "Table Editor"

### Step 4: Configure Storage Buckets
1. Go to "Storage" section
2. Create three buckets:
   - **content-files**: For uploaded content (public)
   - **user-avatars**: For user profile pictures (public)
   - **thumbnails**: For content thumbnails (public)
3. Set policies for each bucket (see Storage Policies section)

### Step 5: Configure Authentication
1. Go to "Authentication" → "Providers"
2. Enable Email provider (should be enabled by default)
3. Configure email templates if needed
4. Set up redirect URLs for your domain

### Step 6: Set Up Storage Policies
Create these policies in the SQL Editor:

```sql
-- Content files policy
CREATE POLICY "Public content files are accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'content-files');

CREATE POLICY "Authenticated users can upload content" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'content-files' AND auth.role() = 'authenticated');

-- User avatars policy
CREATE POLICY "Public user avatars are accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'user-avatars' AND auth.uid() = (storage.foldername(name))[1]::uuid);

-- Thumbnails policy
CREATE POLICY "Public thumbnails are accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');
```

## Local Development

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/judo-academy.git
cd judo-academy
```

### Step 2: Create Environment File
Create a `.env.local` file in the root directory:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application Configuration
VITE_APP_NAME="Academia de Judo"
VITE_APP_DESCRIPTION="Traditional Judo Academy with modern technology"
VITE_APP_URL=http://localhost:5173

# Optional: Analytics and Monitoring
VITE_GA_ID=
VITE_SENTRY_DSN=
```

### Step 3: Install Dependencies
```bash
npm install
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Test All Functionality
1. Test user registration and login
2. Test admin dashboard access
3. Test content upload and management
4. Test user portal functionality
5. Test responsive design

## GitHub Repository Setup

### Step 1: Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: Judo Academy website"
```

### Step 2: Create GitHub Repository
1. Go to GitHub and create new repository
2. Name it `judo-academy`
3. Keep it public for Vercel integration
4. Don't initialize with README (we have our own)

### Step 3: Push to GitHub
```bash
git remote add origin https://github.com/yourusername/judo-academy.git
git branch -M main
git push -u origin main
```

### Step 4: Create .gitignore
Create `.gitignore` file:
```gitignore
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Temporary files
*.tmp
*.temp
```

## Vercel Deployment

### Step 1: Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import Git Repository
4. Select your `judo-academy` repository

### Step 2: Configure Project
1. **Framework Preset**: Vite
2. **Root Directory**: `./`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 3: Set Environment Variables
Add these environment variables in Vercel:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_NAME="Academia de Judo"
VITE_APP_DESCRIPTION="Traditional Judo Academy with modern technology"
VITE_APP_URL=https://your-domain.vercel.app
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Access your live website
4. Test all functionality in production

### Step 5: Configure Custom Domain (Optional)
1. Go to project settings in Vercel
2. Add custom domain
3. Configure DNS settings as instructed
4. Wait for SSL certificate (automatic)

## Environment Configuration

### Production Environment Variables
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Application Configuration
VITE_APP_NAME="Academia de Judo"
VITE_APP_DESCRIPTION="Traditional Judo Academy with modern technology"
VITE_APP_URL=https://your-domain.com

# Security Configuration
VITE_SESSION_TIMEOUT=3600
VITE_MAX_LOGIN_ATTEMPTS=5

# Analytics (Optional)
VITE_GA_ID=G-XXXXXXXXXX
VITE_GTM_ID=GTM-XXXXXXX

# Monitoring (Optional)
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Development vs Production
- **Development**: Use `.env.local` (not tracked by Git)
- **Production**: Set environment variables in Vercel dashboard
- **Staging**: Create separate branch and Vercel project

## Production Checklist

### Security
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Configure proper authentication policies
- [ ] Set up rate limiting for API calls
- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Configure CORS settings
- [ ] Set up content security policy

### Performance
- [ ] Optimize images and assets
- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Minimize JavaScript bundle size
- [ ] Enable lazy loading for images

### Monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure analytics (Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring
- [ ] Set up backup monitoring

### SEO
- [ ] Configure meta tags
- [ ] Set up sitemap.xml
- [ ] Configure robots.txt
- [ ] Set up structured data
- [ ] Optimize for Core Web Vitals

### Legal
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Configure cookie consent
- [ ] Add GDPR compliance features

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Failed
**Symptoms**: Cannot connect to database, authentication fails
**Solutions**:
- Verify environment variables are correct
- Check Supabase project status
- Ensure RLS policies are properly configured
- Test connection with Supabase client

#### 2. Build Failures
**Symptoms**: Vercel build fails
**Solutions**:
- Check Node.js version compatibility
- Verify all dependencies are installed
- Check for syntax errors in code
- Review build logs in Vercel dashboard

#### 3. Authentication Issues
**Symptoms**: Users cannot login/register
**Solutions**:
- Verify Supabase auth settings
- Check email provider configuration
- Ensure redirect URLs are configured
- Test with different email providers

#### 4. File Upload Issues
**Symptoms**: Cannot upload files to storage
**Solutions**:
- Check storage bucket policies
- Verify file size limits
- Check file type restrictions
- Test bucket permissions

#### 5. Performance Issues
**Symptoms**: Slow loading times
**Solutions**:
- Optimize images and assets
- Enable compression
- Check for large JavaScript bundles
- Monitor database query performance

### Debug Mode
Enable debug mode by adding to environment variables:
```env
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### Getting Help
1. Check Supabase documentation
2. Review Vercel deployment logs
3. Test locally with production environment
4. Use browser developer tools
5. Check GitHub issues for similar problems

## Maintenance

### Regular Tasks
- [ ] Monitor application performance
- [ ] Update dependencies monthly
- [ ] Review security policies
- [ ] Backup database regularly
- [ ] Monitor storage usage
- [ ] Review user feedback

### Updates
- Keep dependencies updated
- Monitor for security patches
- Update content regularly
- Review and update policies

## Support

For technical support:
1. Check this documentation
2. Review code comments
3. Test in development environment
4. Contact development team
5. Create GitHub issue for bugs

## Conclusion

This deployment guide provides comprehensive instructions for setting up the Judo Academy website with Supabase backend. Follow each step carefully and test thoroughly before going live.

Remember to:
- Keep backups of all data
- Monitor application performance
- Update regularly for security
- Provide user support
- Maintain documentation

The combination of Supabase for backend services and Vercel for frontend deployment provides a robust, scalable solution for the Judo Academy website.