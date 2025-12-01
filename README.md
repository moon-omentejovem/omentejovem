![Omentejovem Logo](/logo.png)

# Omentejovem

> Digital artist portfolio and NFT collection showcase built with Next.js 14 and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)](https://supabase.com/)

[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/omentejovem-staging?style=flat-square)](https://www.omentejovem.com/)

<!-- [![CI](https://img.shields.io/github/actions/workflow/status/luismtns/omentejovem/ci.yml?branch=main&style=flat-square&logo=github&label=CI)](https://github.com/luismtns/omentejovem/actions/workflows/ci.yml) -->

A modern portfolio platform showcasing digital artworks and NFT collections with an integrated content management system for admins.

## Features

- 🎨 **Portfolio showcase** with artwork filtering and series organization
- 🔐 **Admin dashboard** for content management
- 📱 **Responsive design** optimized for all devices
- 🖼️ **Image optimization** with automatic caching
- 📝 **Rich text editor** for artwork descriptions
- 🔗 **NFT marketplace integration** with OpenSea sync
- ⚡ **Performance optimized** with Next.js App Router

## Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- Supabase account

### Installation

1. Clone and install dependencies:

```bash
git clone <repository-url>
cd omentejovem
yarn install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
# Add your Supabase credentials to .env.local
```

3. Set up database:

```bash
# Run supabase-setup.sql in your Supabase project
# Database auto-seeds on first deployment
```

4. Start development:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the portfolio.
Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS
- **Rich Text**: Tiptap Editor
- **State Management**: React Query
- **Image Processing**: Next.js Image + Sharp
- **Package Manager**: Yarn

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── admin/             # Admin dashboard
│   ├── portfolio/         # Public portfolio
│   ├── series/            # NFT series pages
│   └── api/               # API routes
├── components/            # React components
├── hooks/                 # Custom hooks
├── lib/                   # Utilities
├── types/                 # TypeScript types
└── utils/supabase/        # Supabase clients
```

## Available Scripts

```bash
yarn dev          # Development server
yarn build        # Production build
yarn start        # Start production server
yarn lint         # Run ESLint
yarn lintfix      # Fix ESLint issues
```

## Documentation

- **[Supabase Integration](docs/SUPABASE-INTEGRATION.md)**: Database setup and configuration
- **[Seed System](docs/SEED-SYSTEM.md)**: Automatic seeding after deploy
- **[Supabase Migration Guide](supabase/README.md)**: How to clone data to a new Supabase project
- **[Supabase CLI Workflow](docs/SUPABASE-MIGRATIONS.md)**: CLI commands for schema changes
- **[AI Context](.agents/AI_CONTEXT_MASTER.md)**: Technical documentation for AI agents

## License

This project is private and proprietary.

---

Quick SEO notes

- Environment: set NEXT_PUBLIC_SITE_URL to your site base URL (default: https://www.omentejovem.com).
- Submit your sitemap to Google Search Console: https://www.omentejovem.com/sitemap.xml
- Test locally:

```powershell
# Start dev server
yarn dev
# Visit http://localhost:3000/robots.txt and http://localhost:3000/sitemap.xml
```

- Test in production (Vercel): visit https://www.omentejovem.com/robots.txt and https://www.omentejovem.com/sitemap.xml
