# Schema de Banco de Dados - Omentejovem

> **Contexto de database para agentes de IA**
>
> Schema Supabase completo, RLS policies e padrões de queries.

---

## 🗃️ Tabelas Principais

### artworks (NFTs)

```sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description JSONB,                    -- Tiptap JSON format
  token_id TEXT,
  mint_date DATE,
  mint_link TEXT,                       -- URL canônica do NFT
  type TEXT CHECK (type IN ('single', 'edition')),
  editions_total INTEGER,
  image_url TEXT,                       -- URL original/otimizada
  image_cached_path TEXT,               -- Path no Supabase Storage
  is_featured BOOLEAN DEFAULT false,
  is_one_of_one BOOLEAN DEFAULT false,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_artworks_slug ON artworks(slug);
CREATE INDEX idx_artworks_featured ON artworks(is_featured) WHERE is_featured = true;
CREATE INDEX idx_artworks_type ON artworks(type);
CREATE INDEX idx_artworks_posted_at ON artworks(posted_at DESC);
```

### series (Coleções)

```sql
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_series_slug ON series(slug);
```

### series_artworks (Relacionamento N:N)

```sql
CREATE TABLE series_artworks (
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, artwork_id)
);

-- Indexes
CREATE INDEX idx_series_artworks_series ON series_artworks(series_id);
CREATE INDEX idx_series_artworks_artwork ON series_artworks(artwork_id);
```

### artifacts (Conteúdo Adicional)

```sql
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  highlight_video_url TEXT,
  link_url TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### about_page (Singleton)

```sql
CREATE TABLE about_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content JSONB,                        -- Tiptap JSON format
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### user_roles (Permissões)

```sql
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'editor')),
  PRIMARY KEY (user_id)
);
```

---

## 🔐 Row Level Security (RLS)

### Políticas de Leitura Pública

```sql
-- Artworks
CREATE POLICY "read_artworks_public" ON artworks
  FOR SELECT USING (true);

-- Series
CREATE POLICY "read_series_public" ON series
  FOR SELECT USING (true);

-- Series Artworks
CREATE POLICY "read_series_artworks_public" ON series_artworks
  FOR SELECT USING (true);

-- Artifacts
CREATE POLICY "read_artifacts_public" ON artifacts
  FOR SELECT USING (true);

-- About Page
CREATE POLICY "read_about_page_public" ON about_page
  FOR SELECT USING (true);
```

### Políticas de Escrita Admin

```sql
-- Função helper para verificar admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de escrita para admins
CREATE POLICY "write_artworks_admin" ON artworks
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "write_series_admin" ON series
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "write_series_artworks_admin" ON series_artworks
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "write_artifacts_admin" ON artifacts
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "write_about_page_admin" ON about_page
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "write_user_roles_admin" ON user_roles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());
```

---

## 📊 Queries Comuns

### Artworks

```sql
-- Todos artworks com séries
SELECT
  a.*,
  COALESCE(
    json_agg(
      json_build_object(
        'id', s.id,
        'slug', s.slug,
        'name', s.name
      )
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) as series
FROM artworks a
LEFT JOIN series_artworks sa ON a.id = sa.artwork_id
LEFT JOIN series s ON sa.series_id = s.id
GROUP BY a.id
ORDER BY a.posted_at DESC;

-- Artworks por tipo
SELECT * FROM artworks
WHERE type = 'single' AND is_featured = true
ORDER BY posted_at DESC;

-- Artworks por série
SELECT a.*
FROM artworks a
JOIN series_artworks sa ON a.id = sa.artwork_id
JOIN series s ON sa.series_id = s.id
WHERE s.slug = 'the-cycle'
ORDER BY a.posted_at DESC;
```

### Series

```sql
-- Séries com contagem de artworks
SELECT
  s.*,
  COUNT(sa.artwork_id) as artwork_count
FROM series s
LEFT JOIN series_artworks sa ON s.id = sa.series_id
GROUP BY s.id
ORDER BY s.name;

-- Série específica com artworks
SELECT
  s.*,
  json_agg(
    json_build_object(
      'id', a.id,
      'slug', a.slug,
      'title', a.title,
      'image_url', a.image_url
    )
  ) as artworks
FROM series s
LEFT JOIN series_artworks sa ON s.id = sa.series_id
LEFT JOIN artworks a ON sa.artwork_id = a.id
WHERE s.slug = $1
GROUP BY s.id;
```

### Slugs para Static Generation

```sql
-- Todos slugs de artworks
SELECT slug FROM artworks ORDER BY slug;

-- Todos slugs de séries
SELECT slug FROM series ORDER BY slug;

-- Slugs de artworks por série
SELECT a.slug
FROM artworks a
JOIN series_artworks sa ON a.id = sa.artwork_id
JOIN series s ON sa.series_id = s.id
WHERE s.slug = $1
ORDER BY a.posted_at DESC;
```

---

## 🔄 Patterns de Query nos Services

### Service Query Pattern

```typescript
// Padrão usado nos Services
export class ArtworkService extends BaseService {
  static getArtworks = cache(async (filters: ArtworkFilters = {}) => {
    return this.executeQuery(async (supabase) => {
      let query = supabase.from('artworks').select(`
          *,
          series_artworks(
            series(
              id,
              slug,
              name
            )
          )
        `)

      if (filters.featured) {
        query = query.eq('is_featured', true)
      }

      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query.order('posted_at', {
        ascending: false
      })
      if (error) throw error

      return data.map(processArtwork)
    })
  })
}
```

### Transformação para ProcessedArtwork

```typescript
function processArtwork(raw: any): ProcessedArtwork {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    description: raw.description,
    tokenId: raw.token_id,
    mintDate: raw.mint_date,
    mintLink: raw.mint_link,
    type: raw.type,
    editionsTotal: raw.editions_total,
    image: {
      original: raw.image_url,
      cached: raw.image_cached_path,
      optimized: raw.image_cached_path || raw.image_url
    },
    isFeatured: raw.is_featured,
    isOneOfOne: raw.is_one_of_one,
    postedAt: raw.posted_at,
    series:
      raw.series_artworks?.map((sa: any) => ({
        id: sa.series.id,
        slug: sa.series.slug,
        name: sa.series.name
      })) || []
  }
}
```

---

## 📈 Performance Considerations

### Indexes Importantes

```sql
-- Para queries de homepage (featured artworks)
CREATE INDEX idx_artworks_featured_posted ON artworks(is_featured, posted_at DESC)
WHERE is_featured = true;

-- Para queries de portfolio (todos artworks ordenados)
CREATE INDEX idx_artworks_posted_at_desc ON artworks(posted_at DESC);

-- Para queries de 1/1s
CREATE INDEX idx_artworks_one_of_one ON artworks(is_one_of_one, posted_at DESC)
WHERE is_one_of_one = true;

-- Para joins com series
CREATE INDEX idx_series_artworks_series_artwork ON series_artworks(series_id, artwork_id);
```

### Query Optimization

```sql
-- ✅ Eficiente - usa index
SELECT * FROM artworks
WHERE is_featured = true
ORDER BY posted_at DESC
LIMIT 6;

-- ✅ Eficiente - join otimizado
SELECT a.*, s.name as series_name
FROM artworks a
JOIN series_artworks sa ON a.id = sa.artwork_id
JOIN series s ON sa.series_id = s.id
WHERE s.slug = 'the-cycle'
ORDER BY a.posted_at DESC;

-- ❌ Ineficiente - sem WHERE clause apropriado
SELECT * FROM artworks ORDER BY title;
```

---

## 🚨 Constraints e Validações

### Check Constraints

```sql
-- Tipo de artwork
ALTER TABLE artworks
ADD CONSTRAINT check_artwork_type
CHECK (type IN ('single', 'edition'));

-- Role de usuário
ALTER TABLE user_roles
ADD CONSTRAINT check_user_role
CHECK (role IN ('admin', 'editor'));

-- Editions total deve ser positivo
ALTER TABLE artworks
ADD CONSTRAINT check_editions_positive
CHECK (editions_total IS NULL OR editions_total > 0);
```

### Unique Constraints

```sql
-- Slugs únicos
ALTER TABLE artworks ADD CONSTRAINT unique_artwork_slug UNIQUE (slug);
ALTER TABLE series ADD CONSTRAINT unique_series_slug UNIQUE (slug);

-- Um role por usuário
ALTER TABLE user_roles ADD CONSTRAINT unique_user_role UNIQUE (user_id);
```

---

## 🔧 Functions e Triggers

### Auto-update timestamps

```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para auto-update
CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Slug generation helper

```sql
-- Função para gerar slug
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;
```

---

**Schema Version**: Produção (Setembro 2025)
**RLS**: Habilitado para todas as tabelas
**Performance**: Otimizado com indexes apropriados
