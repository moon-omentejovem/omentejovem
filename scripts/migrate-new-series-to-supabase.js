require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Mapeamento dos arquivos para os slugs dos artworks
const FILE_TO_SLUG_MAPPING = {
  '1_Sitting_at_the_Edge.jpg': 'sitting-at-the-edge',
  '2_Two_Voices,_One_Circle.jpg': 'two-voices-one-circle',
  '3_The_Ground_Was_My_Teacher.jpg': 'ground-was-my-teacher', // Já foi corrigido
  '4_I_Had_Dreams_About_You.jpg': 'i-had-dreams-about-you',
  '5_Mapping_the_Unseen.jpg': 'mapping-the-unseen',
  '6_Playing_Chess_with_Love.jpg': 'playing-chess-with-love',
  '7_All_Time_High_Discovery.jpg': 'all-time-high-discovery',
  '8_I_Am_Where_You_Arent.jpg': 'i-am-where-you-arent',
  '9_Before_Birth.jpg': 'before-birth',
  '10_He_Left_as_a_Dot.jpg': 'he-left-as-a-dot'
}

function generateFilename(slug) {
  const timestamp = Date.now()
  return `${timestamp}-${slug}`
}

async function uploadFileToSupabase(localFilePath, bucketPath) {
  try {
    const fileBuffer = fs.readFileSync(localFilePath)

    const { data, error } = await supabase.storage
      .from('media')
      .upload(bucketPath, fileBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '31536000',
        upsert: true
      })

    if (error) {
      console.error(`❌ Erro ao fazer upload de ${bucketPath}:`, error)
      return null
    }

    console.log(`✅ Upload realizado: ${bucketPath}`)
    return data.path
  } catch (error) {
    console.error(`❌ Erro ao processar arquivo ${localFilePath}:`, error)
    return null
  }
}

async function updateArtworkPaths(slug, imagePath, rawImagePath) {
  try {
    const { error } = await supabase
      .from('artworks')
      .update({
        image_path: imagePath,
        raw_image_path: rawImagePath
      })
      .eq('slug', slug)

    if (error) {
      console.error(`❌ Erro ao atualizar artwork ${slug}:`, error)
      return false
    }

    console.log(`✅ Artwork ${slug} atualizado com novos paths`)
    return true
  } catch (error) {
    console.error(`❌ Erro ao atualizar artwork ${slug}:`, error)
    return false
  }
}

async function main() {
  console.log('🚀 Iniciando migração dos arquivos new_series para Supabase...')

  const newSeriesDir = path.join(process.cwd(), 'public', 'new_series')

  if (!fs.existsSync(newSeriesDir)) {
    console.error('❌ Diretório public/new_series não encontrado')
    process.exit(1)
  }

  const files = fs
    .readdirSync(newSeriesDir)
    .filter((file) => file.endsWith('.jpg'))
  console.log(`📁 Encontrados ${files.length} arquivos para migrar`)

  let successCount = 0
  let errorCount = 0

  for (const file of files) {
    const slug = FILE_TO_SLUG_MAPPING[file]

    if (!slug) {
      console.log(
        `⚠️  Arquivo ${file} não possui mapeamento para slug, pulando...`
      )
      continue
    }

    console.log(`\n🔄 Processando: ${file} -> ${slug}`)

    const localFilePath = path.join(newSeriesDir, file)
    const filename = generateFilename(slug)

    // Upload da imagem original (raw)
    const rawImagePath = `artworks/raw/${filename}.jpg`
    const uploadedRawPath = await uploadFileToSupabase(
      localFilePath,
      rawImagePath
    )

    if (!uploadedRawPath) {
      console.error(`❌ Falha no upload de ${file}`)
      errorCount++
      continue
    }

    // Para este caso, vamos usar a mesma imagem como otimizada por enquanto
    // Em produção, você poderia processar a imagem para WebP aqui
    const optimizedImagePath = `artworks/optimized/${filename}.jpg`
    const uploadedOptimizedPath = await uploadFileToSupabase(
      localFilePath,
      optimizedImagePath
    )

    if (!uploadedOptimizedPath) {
      console.error(`❌ Falha no upload da versão otimizada de ${file}`)
      errorCount++
      continue
    }

    // Atualizar o artwork no banco
    const updateSuccess = await updateArtworkPaths(
      slug,
      uploadedOptimizedPath,
      uploadedRawPath
    )

    if (updateSuccess) {
      successCount++
      console.log(`✅ ${file} migrado com sucesso!`)
    } else {
      errorCount++
    }
  }

  console.log('\n📊 Resumo da migração:')
  console.log(`   ✅ Sucessos: ${successCount}`)
  console.log(`   ❌ Erros: ${errorCount}`)
  console.log(`   📁 Total processado: ${successCount + errorCount}`)

  if (errorCount === 0) {
    console.log('\n🎉 Migração concluída com sucesso!')
    console.log(
      '💡 Você pode agora executar o script de verificação novamente.'
    )
  } else {
    console.log(
      '\n⚠️  Migração concluída com alguns erros. Verifique os logs acima.'
    )
  }
}

main().catch(console.error)
