import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '../..')

console.log('🔍 TESTE DE VARIÁVEIS DE AMBIENTE')
console.log('=================================')
console.log(`Arquivo atual: ${__filename}`)
console.log(`Diretório atual: ${__dirname}`)
console.log(`Raiz do projeto: ${projectRoot}`)
console.log(`Arquivo .env esperado: ${path.join(projectRoot, '.env')}`)

// Verificar se arquivo .env existe
import { existsSync } from 'fs'
const envPath = path.join(projectRoot, '.env')
console.log(`Arquivo .env existe? ${existsSync(envPath)}`)

// Carregar .env
dotenv.config({ path: envPath })

console.log('\n📋 VARIÁVEIS CARREGADAS:')
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING'}`)
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'OK' : 'MISSING'}`)

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log(`Key length: ${process.env.SUPABASE_SERVICE_ROLE_KEY.length} characters`)
}
