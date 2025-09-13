![Omentejovem Logo](/logo.png)

# Omentejovem

> Digital artist portfolio and NFT collection showcase built with Next.js 14 and Supabase.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=flat-square&logo=supabase)](https://supabase.com/)

[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/omentejovem-staging?style=flat-square)](https://omentejovem-staging.vercel.app/)

<!-- CI/CD Badges - Ready to implement -->
<!--
[![CI](https://img.shields.io/github/actions/workflow/status/luismtns/omentejovem/ci.yml?style=flat-square&logo=github&label=CI)](https://github.com/luismtns/omentejovem/actions)
[![Test Coverage](https://img.shields.io/codecov/c/github/luismtns/omentejovem?style=flat-square&logo=codecov)](https://codecov.io/gh/luismtns/omentejovem)
[![Lighthouse Score](https://img.shields.io/badge/Lighthouse-100-brightgreen?style=flat-square&logo=lighthouse)](https://pagespeed.web.dev/)
[![Security Scan](https://img.shields.io/snyk/vulnerabilities/github/luismtns/omentejovem?style=flat-square&logo=snyk)](https://snyk.io/)
-->

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

## Recommended CI/CD Setup

For optimal development workflow, consider implementing these GitHub Actions:

<details>
<summary>📋 Click to view recommended CI workflows</summary>

### 1. Basic CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn lint
      - run: yarn build
```

### 2. Lighthouse CI (`.github/workflows/lighthouse.yml`)

```yaml
name: Lighthouse CI
on: [push]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.js'
```

### 3. Security Audit (`.github/workflows/security.yml`)

```yaml
name: Security Audit
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: yarn audit --audit-level moderate
```

### 4. Dependency Updates (`.github/dependabot.yml`)

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'
    schedule:
      interval: 'weekly'
```

</details>

## Documentation

- **[Supabase Integration](docs/SUPABASE-INTEGRATION.md)**: Database setup and configuration
- **[Seed System](docs/SEED-SYSTEM.md)**: Data seeding and migration
- **[Backend Patterns](docs/BACKEND_ORIENTED_FRONTEND.md)**: Service architecture patterns
- **[AI Context](.agents/AI_CONTEXT_MASTER.md)**: Technical documentation for AI agents

## License

This project is private and proprietary.
