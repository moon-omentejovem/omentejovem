import { createClient } from '@/utils/supabase/server'

async function checkAndCreateAdmin() {
  try {
    console.log('🔍 Checking admin status...\n')

    const supabase = await createClient()

    // List all users with their roles
    const { data: userRoles, error: roleError } = await supabase
      .from('user_roles')
      .select('*')

    if (roleError) {
      console.error('❌ Error fetching user roles:', roleError)
      return
    }

    // Get auth users
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    console.log('📊 User Status Report:')
    console.log('====================')

    if (authUsers.users.length === 0) {
      console.log('ℹ️  No users found in the system')
      console.log('\n💡 To create an admin:')
      console.log('1. Go to http://localhost:3001/admin')
      console.log('2. Enter an email address')
      console.log('3. Check your email for the magic link')
      console.log(
        '4. After logging in, run this script again to grant admin access'
      )
      return
    }

    authUsers.users.forEach((user) => {
      const role = userRoles.find((r) => r.user_id === user.id)
      console.log(`\n👤 User: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Role: ${role?.role || '❌ No role assigned'}`)
      console.log(
        `   Created: ${new Date(user.created_at || '').toLocaleString()}`
      )

      if (role?.role === 'admin') {
        console.log('   Status: ✅ Admin access granted')
      } else {
        console.log('   Status: ⚠️  No admin access')
      }
    })

    // Check for admin users
    const adminCount = userRoles.filter((r) => r.role === 'admin').length

    console.log('\n📈 Summary:')
    console.log(`   Total users: ${authUsers.users.length}`)
    console.log(`   Admin users: ${adminCount}`)

    if (adminCount === 0) {
      console.log('\n⚠️  No admin users found!')

      // If there's only one user, offer to make them admin
      if (authUsers.users.length === 1) {
        const user = authUsers.users[0]
        console.log(`\n🔧 Making ${user.email} an admin...`)

        const { data: newRole, error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'admin'
          })
          .select()
          .single()

        if (insertError) {
          console.error('❌ Error creating admin role:', insertError)
        } else {
          console.log('✅ Admin role created successfully!')
          console.log(`   ${user.email} now has admin access`)
        }
      } else if (authUsers.users.length > 1) {
        console.log('\n💡 Multiple users found. To grant admin access:')
        console.log(
          'POST to /api/admin/create-admin with {"email": "user@example.com"}'
        )
      }
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the check
checkAndCreateAdmin()
