const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function migrateAboutPage() {
  console.log('🚀 Iniciando migração da página About...')
  
  try {
    // Verificar estrutura atual
    console.log('🔍 Verificando estrutura atual...')
    const { data: current, error: currentError } = await supabase
      .from('about_page')
      .select('*')
      .limit(1)
    
    if (currentError) {
      throw currentError
    }
    
    console.log('📊 Campos atuais:', Object.keys(current[0] || {}))
    
    // Verificar se os campos já existem
    const hasNewFields = current[0] && ('socials' in current[0] || 'exhibitions' in current[0] || 'press' in current[0])
    
    if (hasNewFields) {
      console.log('✅ Campos já existem! Pulando migração de schema...')
    } else {
      console.log('⚠️ Campos não encontrados. Você precisa executar o SQL manualmente no dashboard:')
      console.log('')
      console.log('-- Execute este SQL no dashboard do Supabase:')
      console.log('ALTER TABLE about_page ADD COLUMN IF NOT EXISTS socials JSONB DEFAULT \'[]\'::jsonb;')
      console.log('ALTER TABLE about_page ADD COLUMN IF NOT EXISTS exhibitions JSONB DEFAULT \'[]\'::jsonb;')  
      console.log('ALTER TABLE about_page ADD COLUMN IF NOT EXISTS press JSONB DEFAULT \'[]\'::jsonb;')
      console.log('')
      console.log('Após executar o SQL, rode este script novamente.')
      return
    }
    
    // Criar ou atualizar registro com dados iniciais
    console.log('📝 Criando/atualizando registro inicial...')
    
    const initialData = {
      content: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Luis Torrens is a multidisciplinary artist working at the intersection of technology, nature, and human experience. His work explores themes of identity, connection, and the evolving relationship between organic and digital realms.'
              }
            ]
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Through his NFT collections and digital artworks, Luis creates immersive narratives that question our place in an increasingly connected world. His practice spans digital painting, generative art, and interactive installations.'
              }
            ]
          }
        ]
      },
      socials: [
        {
          platform: 'Twitter/X',
          handle: '@luistorrens',
          url: 'https://twitter.com/luistorrens'
        },
        {
          platform: 'Instagram',
          handle: '@omentejovem',
          url: 'https://instagram.com/omentejovem'
        },
        {
          platform: 'Foundation',
          handle: 'luistorrens',
          url: 'https://foundation.app/@luistorrens'
        }
      ],
      exhibitions: [
        {
          title: 'Digital Narratives',
          venue: 'Virtual Gallery Space',
          location: 'Online',
          year: '2024',
          type: 'group',
          description: 'Exploring digital storytelling through NFT artworks'
        },
        {
          title: 'Connections',
          venue: 'Contemporary Art Center',
          location: 'São Paulo, Brazil',
          year: '2023',
          type: 'solo',
          description: 'A solo exhibition examining human connections in digital spaces'
        }
      ],
      press: [
        {
          title: 'The Rise of Digital Art in Brazil',
          publication: 'Art & Technology Magazine',
          date: '2024-03-15',
          url: '#',
          type: 'feature'
        },
        {
          title: 'NFT Artists to Watch: Luis Torrens',
          publication: 'Crypto Art Review',
          date: '2023-11-20',
          url: '#',
          type: 'interview'
        }
      ]
    }
    
    // Verificar se já existe um registro
    const { data: existing } = await supabase
      .from('about_page')
      .select('id')
      .single()
    
    if (existing) {
      // Atualizar registro existente
      const { error: updateError } = await supabase
        .from('about_page')
        .update(initialData)
        .eq('id', existing.id)
      
      if (updateError) throw updateError
      console.log('✅ Registro existente atualizado com sucesso!')
    } else {
      // Criar novo registro
      const { error: insertError } = await supabase
        .from('about_page')
        .insert(initialData)
      
      if (insertError) throw insertError
      console.log('✅ Novo registro criado com sucesso!')
    }
    
    console.log('🎉 Migração da página About concluída!')
    
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    process.exit(1)
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  migrateAboutPage()
    .then(() => {
      console.log('✅ Script concluído com sucesso')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Script falhou:', error)
      process.exit(1)
    })
}

module.exports = { migrateAboutPage }
