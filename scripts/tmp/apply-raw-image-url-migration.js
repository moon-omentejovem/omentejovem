/**
 * Apply migration to add raw_image_url field to artworks table
 * Temporary script to execute the migration SQL
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function applyMigration() {
  console.log('🔧 Applying migration: add-raw-image-url-field.sql')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // Step 1: Add raw_image_url column
    console.log('📝 Adding raw_image_url column...')
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE artworks ADD COLUMN IF NOT EXISTS raw_image_url TEXT;'
    })

    if (alterError) {
      console.error('❌ Error adding column:', alterError)
      return
    }

    console.log('✅ Column added successfully')

    // Step 2: Update existing records
    console.log('📝 Populating raw_image_url from existing image_url...')
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE artworks
            SET raw_image_url = image_url
            WHERE raw_image_url IS NULL;`
    })

    if (updateError) {
      console.error('❌ Error updating records:', updateError)
      return
    }

    console.log('✅ Records updated successfully')

    // Step 3: Add comment
    console.log('📝 Adding column comment...')
    const { error: commentError } = await supabase.rpc('exec_sql', {
      sql: "COMMENT ON COLUMN artworks.raw_image_url IS 'Original high-resolution image URL stored in Supabase Storage for modal display';"
    })

    if (commentError) {
      console.log(
        '⚠️ Warning: Could not add comment (this is optional):',
        commentError.message
      )
    } else {
      console.log('✅ Comment added successfully')
    }

    // Step 4: Verify the migration
    console.log('🔍 Verifying migration...')
    const { data, error } = await supabase
      .from('artworks')
      .select('id, title, image_url, raw_image_url')
      .limit(3)

    if (error) {
      console.error('❌ Error verifying migration:', error)
      return
    }

    console.log('✅ Migration verified! Sample data:')
    data.forEach((artwork) => {
      console.log(`   • ${artwork.title}:`)
      console.log(`     - image_url: ${artwork.image_url}`)
      console.log(`     - raw_image_url: ${artwork.raw_image_url}`)
    })

    console.log('🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Alternative approach using direct SQL if RPC doesn't work
async function applyMigrationDirect() {
  console.log('🔧 Applying migration using direct approach...')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    // First, check if column already exists
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'artworks')
      .eq('column_name', 'raw_image_url')

    if (columns && columns.length > 0) {
      console.log('✅ Column raw_image_url already exists')
    } else {
      console.log(
        '❌ Column does not exist. Please add it manually in Supabase dashboard:'
      )
      console.log('   1. Go to Table Editor > artworks')
      console.log('   2. Add new column: raw_image_url (TEXT, nullable)')
      console.log('   3. Then run this script again')
      return
    }

    // Update existing records to populate raw_image_url
    console.log('📝 Populating raw_image_url from image_url...')

    const { data: artworks, error: fetchError } = await supabase
      .from('artworks')
      .select('id, image_url, raw_image_url')

    if (fetchError) {
      console.error('❌ Error fetching artworks:', fetchError)
      return
    }

    console.log(`📊 Found ${artworks.length} artworks to update`)

    let updated = 0
    for (const artwork of artworks) {
      if (!artwork.raw_image_url && artwork.image_url) {
        const { error: updateError } = await supabase
          .from('artworks')
          .update({ raw_image_url: artwork.image_url })
          .eq('id', artwork.id)

        if (updateError) {
          console.error(`❌ Error updating artwork ${artwork.id}:`, updateError)
        } else {
          updated++
        }
      }
    }

    console.log(`✅ Updated ${updated} artworks`)
    console.log('🎉 Migration completed!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Try both approaches
async function main() {
  await applyMigrationDirect()
}

main().catch(console.error)
