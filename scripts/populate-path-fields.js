require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function extractPathFromUrl(url) {
  if (!url) return null;
  
  // Remove the base URL to get just the path
  const urlObj = new URL(url);
  const path = urlObj.pathname;
  
  // Remove the '/storage/v1/object/public/media/' prefix
  const mediaPrefix = '/storage/v1/object/public/media/';
  if (path.startsWith(mediaPrefix)) {
    return path.substring(mediaPrefix.length);
  }
  
  return null;
}

async function populatePathFields() {
  console.log('🔧 Populando campos image_path e raw_image_path...');
  
  // Buscar todos os artworks que têm image_url mas não têm image_path
  const { data: artworks, error } = await supabase
    .from('artworks')
    .select('id, slug, image_url, raw_image_url, image_path, raw_image_path')
    .or('image_path.is.null,raw_image_path.is.null');

  if (error) {
    console.error('❌ Erro ao buscar artworks:', error);
    return;
  }

  console.log(`📊 Encontrados ${artworks.length} artworks para processar`);

  let updateCount = 0;

  for (const artwork of artworks) {
    const updates = {};
    let needsUpdate = false;

    // Populate image_path if missing but image_url exists
    if (!artwork.image_path && artwork.image_url) {
      const imagePath = extractPathFromUrl(artwork.image_url);
      if (imagePath) {
        updates.image_path = imagePath;
        needsUpdate = true;
        console.log(`🔧 ${artwork.slug}: image_path = ${imagePath}`);
      }
    }

    // Populate raw_image_path if missing but raw_image_url exists
    if (!artwork.raw_image_path && artwork.raw_image_url) {
      const rawImagePath = extractPathFromUrl(artwork.raw_image_url);
      if (rawImagePath) {
        updates.raw_image_path = rawImagePath;
        needsUpdate = true;
        console.log(`🔧 ${artwork.slug}: raw_image_path = ${rawImagePath}`);
      }
    }

    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('artworks')
        .update(updates)
        .eq('id', artwork.id);

      if (updateError) {
        console.error(`❌ Erro ao atualizar ${artwork.slug}:`, updateError);
      } else {
        updateCount++;
        console.log(`✅ ${artwork.slug} atualizado`);
      }
    }
  }

  console.log('\n📊 Resumo:');
  console.log(`   ✅ Artworks atualizados: ${updateCount}`);
  console.log(`   📁 Total processado: ${artworks.length}`);
}

async function main() {
  console.log('🚀 Iniciando população dos campos de path...');
  await populatePathFields();
  console.log('🎉 Processo concluído!');
}

main().catch(console.error);
