# Omentejovem Portfolio & CMS

> A modern NFT portfolio and content management system built with Next.js, Supabase, and TypeScript.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Overview

Omentejovem is a comprehensive NFT portfolio and content management system designed for digital artists. The platform features a public portfolio showcasing digital artworks and NFT collections, alongside a powerful admin dashboard for content management.

### 🌟 Key Features

- **🎨 NFT Portfolio**: Curated showcase of digital artworks and NFT collections
- **📱 Responsive Design**: Mobile-first approach with modern UI/UX
- **🔐 Admin Dashboard**: Complete CMS for managing artworks, series, and content
- **👥 User Management**: Admin invitation system with magic link authentication
- **🛠️ Auto-Seeding**: Automatic database population on deployment
- **🖼️ Image Optimization**: Automatic caching and optimization of artwork images
- **📝 Rich Text Editor**: Tiptap-powered editor for artwork descriptions
- **🔗 OpenSea Integration**: Sync metadata and images from OpenSea marketplace
- **🏷️ Collection Management**: Organize artworks into series and collections
- **⚡ Performance Optimized**: Built with Next.js App Router and Server Components

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Styling**: Tailwind CSS, CSS Modules
- **Rich Text**: Tiptap Editor
- **State Management**: React Query (TanStack Query)
- **Image Processing**: Next.js Image Optimization + Sharp
- **Animation**: GSAP, SplitType
- **Validation**: Zod schemas
- **Package Manager**: Yarn

### Database Schema

```sql
-- Core entities
- artworks (NFT pieces with metadata)
- series (grouped collections)
- series_artworks (N:N relationship)
- artifacts (additional content pieces)
- about_page (static content)
- user_roles (admin access management)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Supabase account and project
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/luismtns/omentejovem-project.git
   cd omentejovem-project
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Environment setup**

   ```bash
   # Copy environment variables
   cp .env.example .env.local

   # Edit .env.local with your Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database setup**

   ```bash
   # Run the setup SQL in your Supabase project
   # File: supabase-setup.sql

   # Database will be automatically seeded on first deployment
   # Or run manual seed: POST /api/admin/seed
   # See docs/SEED-SYSTEM.md for details
   ```

5. **Start development server**

   ```bash
   yarn dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the public portfolio.

   Access the admin dashboard at [http://localhost:3000/admin](http://localhost:3000/admin) (requires authentication).

## 📁 Project Structure

```
omentejovem-project/
├── src/
│   ├── app/                     # App Router pages and layouts
│   │   ├── api/                 # API routes
│   │   ├── admin/               # Admin dashboard pages
│   │   ├── portfolio/           # Public portfolio pages
│   │   ├── series/              # NFT series pages
│   │   └── artifacts/           # Artifacts showcase
│   ├── components/              # Reusable React components
│   │   ├── admin/               # Admin-specific components
│   │   ├── ArtContent/          # Artwork display components
│   │   ├── Carousels/           # Image carousel components
│   │   └── Modals/              # Modal components
│   ├── lib/                     # Utilities and configurations
│   │   ├── supabase.ts          # Supabase helper functions
│   │   ├── supabase/config.ts   # Supabase configuration
│   │   ├── api-utils.ts         # API utilities
│   │   └── utils.ts             # General utilities
│   ├── types/                   # TypeScript type definitions
│   └── hooks/                   # Custom React hooks
├── utils/supabase/              # Supabase client configurations
│   ├── client.ts                # Browser client
│   ├── server.ts                # Server client
│   └── middleware.ts            # Session middleware
├── public/                      # Static assets
├── scripts/                     # Database and deployment scripts
├── supabase/                    # Supabase configuration
├── docs/                        # Documentation
└── README.md                    # This file
```

## 🎯 Usage

### Public Portfolio

The public-facing portfolio includes:

- **Home**: Featured artworks and latest pieces
- **Portfolio**: Complete artwork gallery with filtering
- **1/1**: Unique, one-of-a-kind pieces
- **Series**: Grouped collections and themes
- **Artifacts**: Additional digital content
- **About**: Artist information and story

### Admin Dashboard

Protected admin interface featuring:

- **Artwork Management**: CRUD operations for NFT pieces
- **Series Management**: Create and manage artwork collections
- **User Management**: Invite and manage admin users via magic link
- **Rich Text Editing**: Tiptap-powered content editor
- **Image Optimization**: Automatic caching and optimization
- **OpenSea Sync**: Import metadata from OpenSea
- **Content Publishing**: Draft and publish content
- **Auto-Seeding**: Automatic database population system

### API Endpoints

```bash
# Public API
GET /api/public/artworks          # List artworks with filters
GET /api/public/series            # List series
GET /api/public/artifacts         # List artifacts
GET /api/public/about             # Get about page content

# Admin API (protected)
POST /api/admin/artworks          # Create/update artwork
POST /api/admin/series            # Create/update series
POST /api/admin/users             # Manage admin users
POST /api/admin/users/invite      # Invite new admin users
POST /api/admin/seed              # Import seed data
POST /api/cache-image             # Cache external images
```

## 🛠️ Development

### Available Scripts

```bash
# Development
yarn dev                    # Start development server
yarn build                  # Build for production
yarn start                  # Start production server

# Code Quality
yarn lint                   # Run ESLint
yarn lintfix               # Fix ESLint issues
yarn format                # Format with Prettier

# Deployment
yarn build:staging         # Build for staging environment
```

### Database Management

```bash
# Setup database schema
# Run supabase-setup.sql in your Supabase project

# Generate TypeScript types from Supabase schema
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts

# Seed database (automatic on first deployment)
# See scripts/vercel-seed.js
```

### Adding New Content Types

Follow the modular CMS approach:

1. **Define database schema** in SQL
2. **Generate TypeScript types** from Supabase
3. **Create Zod validation schemas**
4. **Build CRUD API routes**
5. **Configure admin UI descriptors**
6. **Create public display components**

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Set build settings**:

   - Framework: Next.js
   - Build Command: `yarn build`
   - Output Directory: `.next`
   - Install Command: `yarn install`

4. **Deploy** - automatic deployments on git push

### Post-Deployment Setup

1. **Database Seeding**: The postbuild script will automatically seed your database
2. **Admin Access**: Use magic link authentication with your admin email
3. **Image Optimization**: Images will be cached automatically from external sources
4. **Cache Warming**: Initial page loads will populate the cache

## 📚 Documentation

- **[Supabase Integration](docs/SUPABASE-INTEGRATION.md)**: Complete guide for Supabase setup and best practices
- **[Magic Link Auth](docs/MAGIC-LINK-AUTH.md)**: Authentication system documentation
- **[Seed System](docs/SEED-SYSTEM.md)**: Database seeding and data management
- **[AGENTS.md](AGENTS.md)**: Complete project specifications and architecture

## 🤝 Contributing

### Development Workflow

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feat/new-feature`
3. **Make your changes** following the project conventions
4. **Run tests and linting**: `yarn lint && yarn build`
5. **Commit with conventional format**: `feat: add new feature description`
6. **Push and create a Pull Request**

### PR Standards

- **Title**: `type: description` (in English)
- **Content**: Detailed description in Portuguese following project template
- **Include**: Screenshots for UI changes, migration scripts for schema changes

### Code Standards

- **TypeScript**: Strict mode enabled, proper typing required
- **Formatting**: Prettier with Tailwind CSS plugin
- **Linting**: ESLint with Next.js and accessibility rules
- **Components**: Functional components with proper prop typing
- **Styling**: Tailwind CSS classes, responsive design patterns

## 📄 License

This project is private and proprietary. All rights reserved.

## 🔗 Links

- **Production**: [Live Site URL](https://your-domain.com) (when deployed)
- **Staging**: [Staging URL](https://your-staging-domain.com) (when available)
- **Supabase Dashboard**: [Your Supabase Project](https://app.supabase.com)

## 📞 Support

For questions, issues, or contributions, please:

1. **Check existing issues** in the repository
2. **Create a new issue** with detailed description
3. **Contact the maintainer**: [luismtns](https://github.com/luismtns)

---

<div align="center">
  <strong>Built with ❤️ for digital art and NFT communities</strong>
</div>
