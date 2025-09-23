#!/usr/bin/env node
/**
 * 🚀 Deploy Simplified Image Management System
 *
 * This script guides through the complete deployment of the new
 * slug-based image management system
 */

const fs = require('fs')
const path = require('path')

const STEPS = {
  1: 'Backup current database',
  2: 'Validate environment setup', 
  3: 'Test slug generation and structure',
  4: 'Apply initial database migration',
  5: 'Migrate existing images to slug-based paths',
  6: 'Test new upload system in admin',
  7: 'Apply cleanup migration (remove old columns)',
  8: 'Final validation'
}

function showIntroduction() {
  console.log('🖼️  SIMPLIFIED IMAGE MANAGEMENT SYSTEM DEPLOYMENT')
  console.log('==================================================\n')
  
  console.log('This script will guide you through deploying the new simplified')
  console.log('image management system that uses slug-based paths instead of')
  console.log('storing multiple path/URL fields in the database.\n')

  console.log('📋 Deployment Steps:')
  Object.entries(STEPS).forEach(([num, step]) => {
    console.log(`   ${num}. ${step}`)
  })
  
  console.log('\n⚠️  IMPORTANT: Make sure you have:')
  console.log('   - Supabase CLI installed and linked')
  console.log('   - Valid .env.local with Supabase credentials')
  console.log('   - Admin access to your Supabase project')
  console.log('   - Backup of your current database')
}

function checkEnvironment() {
  console.log('\n📋 STEP 2: Validating Environment Setup')
  console.log('======================================\n')

  const envFile = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envFile)) {
    console.log('❌ .env.local file not found')
    console.log('\n💡 Create .env.local with the following variables:')
    console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
    console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key')
    console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
    return false
  }

  console.log('✅ .env.local file found')

  // Check if required scripts exist
  const requiredScripts = [
    'scripts/test-image-system.js',
    'scripts/migrate-to-slug-based-images.js'
  ]

  const missingScripts = requiredScripts.filter(script => !fs.existsSync(script))
  
  if (missingScripts.length > 0) {
    console.log('❌ Missing required scripts:')
    missingScripts.forEach(script => console.log(`   - ${script}`))
    return false
  }

  console.log('✅ All required scripts present')

  // Check if migrations exist
  const requiredMigrations = [
    'supabase/migrations/20250924000000_simplify_image_management.sql',
    'supabase/migrations/20250924000001_cleanup_image_columns.sql'
  ]

  const missingMigrations = requiredMigrations.filter(migration => !fs.existsSync(migration))
  
  if (missingMigrations.length > 0) {
    console.log('❌ Missing required migrations:')
    missingMigrations.forEach(migration => console.log(`   - ${migration}`))
    return false
  }

  console.log('✅ All required migrations present')
  return true
}

function showManualSteps() {
  console.log('\n🛠️  MANUAL STEPS TO COMPLETE DEPLOYMENT')
  console.log('=====================================\n')

  console.log('📋 STEP 1: Database Backup')
  console.log('Run this command to backup your database:')
  console.log('   supabase db dump > database-backup-$(date +%Y%m%d).sql\n')

  console.log('📋 STEP 3: Test System')
  console.log('Validate current state and generate missing slugs:')
  console.log('   node scripts/test-image-system.js')
  console.log('   node scripts/test-image-system.js --generate-slugs  # if needed\n')

  console.log('📋 STEP 4: Apply Initial Migration')
  console.log('Apply the migration that adds slug-based functions:')
  console.log('   supabase db push\n')

  console.log('📋 STEP 5: Migrate Images')
  console.log('Move existing images to slug-based paths:')
  console.log('   node scripts/migrate-to-slug-based-images.js\n')

  console.log('📋 STEP 6: Test Upload')
  console.log('Test the new upload system:')
  console.log('   1. Go to admin panel (/admin)')
  console.log('   2. Try uploading a new image')
  console.log('   3. Verify it uploads and displays correctly')
  console.log('   4. Check that the file is stored with slug-based name\n')

  console.log('📋 STEP 7: Cleanup (Optional)')
  console.log('After confirming everything works, remove old columns:')
  console.log('   # Apply the cleanup migration manually:')
  console.log('   # supabase sql --file supabase/migrations/20250924000001_cleanup_image_columns.sql\n')

  console.log('📋 STEP 8: Final Validation')
  console.log('Verify everything is working:')
  console.log('   node scripts/test-image-system.js')
  console.log('   # Test all major functionality in the app\n')
}

function showPostDeploymentNotes() {
  console.log('📝 POST-DEPLOYMENT NOTES')
  console.log('========================\n')

  console.log('🎯 How the New System Works:')
  console.log('   - Images are stored as: {slug}.webp and {slug}-raw.jpg')
  console.log('   - Paths are generated dynamically from slug')
  console.log('   - No need to store paths in database')
  console.log('   - URLs are generated: getImageUrlFromSlug(slug, type, format)\n')

  console.log('🔧 Development:')
  console.log('   - Use ImageUploadService.uploadImageBySlug() for new uploads')
  console.log('   - Use getImageUrlFromSlug() to generate URLs')
  console.log('   - Old methods still work during transition period\n')

  console.log('📚 Documentation:')
  console.log('   - Complete guide: docs/SIMPLIFIED_IMAGE_MANAGEMENT.md')
  console.log('   - API reference in individual service files')
  console.log('   - Test suite: scripts/test-image-system.js\n')

  console.log('⚠️  Rollback (if needed):')
  console.log('   - Keep the backup you created in Step 1')
  console.log('   - Old path columns are preserved until cleanup migration')
  console.log('   - Images in old paths are NOT deleted by migration script\n')
}

function main() {
  showIntroduction()
  
  const envOk = checkEnvironment()
  
  if (!envOk) {
    console.log('\n❌ Environment validation failed. Please fix the issues above before proceeding.')
    return
  }

  console.log('\n✅ Environment validation passed!')
  
  showManualSteps()
  showPostDeploymentNotes()

  console.log('🚀 READY TO DEPLOY!')
  console.log('==================\n')
  console.log('Follow the manual steps above to complete the deployment.')
  console.log('Each step builds on the previous one, so complete them in order.')
  console.log('\nGood luck! 🎉')
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { main }