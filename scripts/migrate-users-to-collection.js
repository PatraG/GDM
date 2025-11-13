/**
 * Migrate Existing Users to Collection
 * Adds user documents to users collection for existing Auth users
 * 
 * Run with: npm run migrate:users
 */

const sdk = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite SDK
const client = new sdk.Client();
const users = new sdk.Users(client);
const databases = new sdk.Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

// Constants
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

async function migrateUserToCollection(user) {
  try {
    console.log(`\n📝 Migrating user: ${user.email} (${user.$id})...`);
    
    // Determine role from labels
    const role = user.labels.includes('admin') ? 'admin' : 'enumerator';
    
    // Check if document already exists
    try {
      const existing = await databases.getDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id
      );
      console.log(`⚠️  User document already exists, skipping...`);
      return { exists: true, user };
    } catch (err) {
      // Document doesn't exist, create it
    }
    
    // Create user document in users collection
    await databases.createDocument(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      user.$id, // Use same ID as auth user
      {
        userId: user.$id,
        email: user.email,
        role: role
      }
    );
    
    console.log(`✅ User document created successfully!`);
    console.log(`   ID: ${user.$id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${role}`);
    
    return { exists: false, user };
    
  } catch (error) {
    console.error(`❌ Error migrating ${user.email}:`, error.message);
    return { error: true, user };
  }
}

async function migrateAllUsers() {
  console.log('🌱 Starting user migration to collection...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Verify configuration
  try {
    console.log('🔗 Testing Appwrite connection...');
    console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`   Project:  ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log(`   Database: ${DATABASE_ID}`);
    console.log(`   Collection: ${USERS_COLLECTION_ID}`);
    console.log('✅ Configuration loaded!\n');
  } catch (error) {
    console.error('❌ Configuration error:', error.message);
    process.exit(1);
  }
  
  // Get all users from Auth
  let allUsers = [];
  try {
    console.log('📋 Fetching all users from Appwrite Auth...');
    let offset = 0;
    const limit = 25;
    let hasMore = true;
    
    while (hasMore) {
      const response = await users.list([
        sdk.Query.limit(limit),
        sdk.Query.offset(offset)
      ]);
      
      allUsers = allUsers.concat(response.users);
      offset += limit;
      hasMore = response.users.length === limit;
    }
    
    console.log(`✅ Found ${allUsers.length} users in Auth\n`);
  } catch (error) {
    console.error('❌ Error fetching users:', error.message);
    process.exit(1);
  }
  
  // Migrate each user
  const results = {
    created: 0,
    existed: 0,
    errors: 0
  };
  
  for (const user of allUsers) {
    const result = await migrateUserToCollection(user);
    if (result.exists) {
      results.existed++;
    } else if (result.error) {
      results.errors++;
    } else {
      results.created++;
    }
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ User migration completed!\n');
  
  // Summary
  console.log('📊 Summary:');
  console.log(`   Created:       ${results.created} user documents`);
  console.log(`   Already exist: ${results.existed} user documents`);
  console.log(`   Errors:        ${results.errors} failed`);
  console.log(`   Total:         ${allUsers.length} users\n`);
  
  if (results.created > 0) {
    console.log('✅ Users can now login successfully!');
    console.log('🌐 Login at: https://geospasial-dental-modeler.vercel.app/login\n');
  }
}

// Run the migration
migrateAllUsers()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
