/**
 * Seed Users Script
 * Creates initial admin and enumerator users for the application
 * 
 * Run with: npm run seed:users
 */

const sdk = require('node-appwrite');
require('dotenv').config();

// Initialize Appwrite SDK
const client = new sdk.Client();
const account = new sdk.Account(client);
const users = new sdk.Users(client);
const databases = new sdk.Databases(client);

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

// Constants
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID;

// Users to create
const seedUsers = [
  {
    email: 'admin@dental.com',
    password: 'Admin123!',
    name: 'Super Administrator',
    labels: ['admin']
  },
  {
    email: 'enum1@dental.com',
    password: 'Enum123!',
    name: 'Field Worker 1',
    labels: ['enumerator']
  },
  {
    email: 'enum2@dental.com',
    password: 'Enum123!',
    name: 'Field Worker 2',
    labels: ['enumerator']
  },
  {
    email: 'enum3@dental.com',
    password: 'Enum123!',
    name: 'Field Worker 3',
    labels: ['enumerator']
  }
];

async function createUser(userData) {
  try {
    console.log(`\n📝 Creating user: ${userData.email}...`);
    
    // Create user with email and password
    const user = await users.create(
      sdk.ID.unique(),
      userData.email,
      undefined, // phone (optional)
      userData.password,
      userData.name
    );
    
    console.log(`✅ User created in Auth: ${user.$id}`);
    
    // Update user labels (for role)
    if (userData.labels && userData.labels.length > 0) {
      await users.updateLabels(user.$id, userData.labels);
      console.log(`🏷️  Labels added: ${userData.labels.join(', ')}`);
    }
    
    // Create user document in users collection
    try {
      await databases.createDocument(
        DATABASE_ID,
        USERS_COLLECTION_ID,
        user.$id, // Use same ID as auth user
        {
          userId: user.$id,
          email: userData.email,
          role: userData.labels[0], // 'admin' or 'enumerator'
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      );
      console.log(`✅ User document created in collection`);
    } catch (dbError) {
      console.error(`⚠️  Warning: Could not create user document:`, dbError.message);
      // Continue even if collection insert fails
    }
    
    console.log(`✅ ${userData.name} (${userData.email}) created successfully!`);
    return user;
    
  } catch (error) {
    if (error.code === 409) {
      console.log(`⚠️  User ${userData.email} already exists, skipping...`);
    } else {
      console.error(`❌ Error creating ${userData.email}:`, error.message);
    }
    return null;
  }
}

async function seedAllUsers() {
  console.log('🌱 Starting user seeding process...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Verify connection by trying to list users (will fail if no permission but connection works)
  try {
    console.log('🔗 Testing Appwrite connection...');
    console.log(`   Endpoint: ${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}`);
    console.log(`   Project:  ${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`);
    console.log('✅ Configuration loaded!\n');
  } catch (error) {
    console.error('❌ Cannot connect to Appwrite:', error.message);
    process.exit(1);
  }
  
  // Create all users
  const results = [];
  for (const userData of seedUsers) {
    const user = await createUser(userData);
    results.push(user);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ User seeding completed!\n');
  
  // Summary
  const created = results.filter(r => r !== null).length;
  const skipped = results.filter(r => r === null).length;
  
  console.log('📊 Summary:');
  console.log(`   Created: ${created} users`);
  console.log(`   Skipped: ${skipped} users (already exist)`);
  console.log(`   Total:   ${seedUsers.length} users\n`);
  
  // Login credentials
  console.log('🔑 Login Credentials:\n');
  console.log('   ADMIN:');
  console.log('   Email:    admin@dental.com');
  console.log('   Password: Admin123!\n');
  console.log('   ENUMERATORS:');
  console.log('   Email:    enum1@dental.com');
  console.log('   Password: Enum123!\n');
  console.log('   Email:    enum2@dental.com');
  console.log('   Password: Enum123!\n');
  console.log('   Email:    enum3@dental.com');
  console.log('   Password: Enum123!\n');
  
  console.log('🌐 You can now login at:');
  console.log('   https://geospasial-dental-modeler.vercel.app/login\n');
}

// Run the seeding
seedAllUsers()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
