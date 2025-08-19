### 📄 `05_GUIDES.md`

# Guides

## Content Structure (No Database)

```markdown
/content
/collections
\- main.yml # metadata for a collection
\- experiments.yml
/artworks
\- 2021-memories.mdx # one file per artwork
\- 2023-neo-wave.mdx
/public
/images
/2021-memories/cover.jpg
/2023-neo-wave/shot-01.jpg
```

---

## Example: Artwork (`/content/artworks/2023-neo-wave.mdx`)

```yaml
---
title: 'Neo Wave'
year: 2023
collection: 'experiments'
edition: '1/10'
status: 'published' # or draft
images:
  - '/images/2023-neo-wave/cover.jpg'
  - '/images/2023-neo-wave/detail-1.jpg'
external:
  - label: 'OpenSea'
    url: 'https://opensea.io/...'
---
Short description of the artwork can go here. It supports **Markdown** for rich text.
```

---

## Example: Collection (`/content/collections/experiments.yml`)

```yaml
slug: 'experiments'
title: 'Experiments'
order: 2
cover: '/images/collections/experiments.jpg'
```

---

## Editing Flow

1. Add or edit a file in `/content/artworks` or `/content/collections`.
2. Place images in `/public/images/...`.
3. Commit + push → Vercel automatically rebuilds and publishes.

---

## Deployment (Vercel)

1. Connect repository to Vercel.
2. Default build command:

   ```bash
   npm install && npm run build
   ```

3. Default start command:

   ```bash
   npm start
   ```

4. Required environment variables:

   - `NEXT_PUBLIC_SITE_URL` → the base site URL.

---

## Best Practices

- Use **slugified file names** (lowercase, hyphen-separated).
- Always fill `alt` text for accessibility.
- Keep images optimized (<500 KB when possible).
- Validate frontmatter with `yarn lint:content` (custom script).
- Run `yarn lint && yarn typecheck` before pushing.
