/**
 * Appwrite Database Setup Script
 * Automatically creates database and collections for Oral Health Survey application
 * 
 * Usage: npm run setup:appwrite
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DATABASE_ID = 'oral_health_survey';

async function setupDatabase() {
    console.log('🚀 Starting Appwrite Database Setup...\n');

    try {
        // Create database
        console.log('📦 Creating database:', DATABASE_ID);
        try {
            await databases.create(DATABASE_ID, 'Oral Health Survey Database');
            console.log('✅ Database created successfully\n');
        } catch (error: any) {
            if (error.code === 409) {
                console.log('ℹ️  Database already exists, continuing...\n');
            } else {
                throw error;
            }
        }

        // Create collections
        await createUsersCollection();
        await createRespondentsCollection();
        await createSessionsCollection();
        await createSurveysCollection();
        await createQuestionsCollection();
        await createOptionsCollection();
        await createResponsesCollection();
        await createAnswersCollection();

        console.log('\n🎉 Appwrite setup completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Verify collections in Appwrite Console');
        console.log('2. Create initial admin user');
        console.log('3. Start development: npm run dev\n');

    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

async function createUsersCollection() {
    const collectionId = 'users';
    console.log('📝 Creating collection:', collectionId);

    try {
        const collection = await databases.createCollection(
            DATABASE_ID,
            collectionId,
            'Users',
            [
                Permission.read(Role.user('admin')),
                Permission.create(Role.user('admin')),
                Permission.update(Role.user('admin')),
                Permission.delete(Role.user('admin')),
            ]
        );

        // Add attributes
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'userId', 255, true);
        await databases.createEmailAttribute(DATABASE_ID, collectionId, 'email', true);
        await databases.createEnumAttribute(DATABASE_ID, collectionId, 'role', ['admin', 'enumerator'], true);
        await databases.createEnumAttribute(DATABASE_ID, collectionId, 'status', ['active', 'suspended'], false, 'active');
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'createdAt', true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'updatedAt', true);

        console.log('✅ Users collection created\n');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists\n');
        } else {
            throw error;
        }
    }
}

async function createRespondentsCollection() {
    const collectionId = 'respondents';
    console.log('📝 Creating collection:', collectionId);

    try {
        await databases.createCollection(
            DATABASE_ID,
            collectionId,
            'Respondents',
            [
                Permission.read(Role.user('admin')),
                Permission.create(Role.user('admin')),
                Permission.update(Role.user('admin')),
                Permission.delete(Role.user('admin')),
            ]
        );

        await databases.createStringAttribute(DATABASE_ID, collectionId, 'pseudonym', 10, true);
        await databases.createEnumAttribute(DATABASE_ID, collectionId, 'ageRange', 
            ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'], true);
        await databases.createEnumAttribute(DATABASE_ID, collectionId, 'sex', ['M', 'F', 'Other'], true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'adminArea', 255, true);
        await databases.createBooleanAttribute(DATABASE_ID, collectionId, 'consentGiven', true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'consentTimestamp', false);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'enumeratorId', 255, true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'createdAt', true);

        // Create unique index for pseudonym
        await databases.createIndex(DATABASE_ID, collectionId, 'pseudonym_unique', 'unique', ['pseudonym']);

        console.log('✅ Respondents collection created\n');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists\n');
        } else {
            throw error;
        }
    }
}

async function createSessionsCollection() {
    const collectionId = 'sessions';
    console.log('📝 Creating collection:', collectionId);

    try {
        await databases.createCollection(
            DATABASE_ID,
            collectionId,
            'Sessions',
            [
                Permission.read(Role.user('admin')),
                Permission.create(Role.user('admin')),
                Permission.update(Role.user('admin')),
                Permission.delete(Role.user('admin')),
            ]
        );

        await databases.createStringAttribute(DATABASE_ID, collectionId, 'respondentId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'enumeratorId', 255, true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'startTime', true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'endTime', false);
        await databases.createEnumAttribute(DATABASE_ID, collectionId, 'status', ['open', 'closed', 'timeout'], false, 'open');
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'createdAt', true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'updatedAt', true);

        // Create index for enumeratorId
        await databases.createIndex(DATABASE_ID, collectionId, 'enumeratorId_index', 'key', ['enumeratorId']);

        console.log('✅ Sessions collection created\n');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists\n');
        } else {
            throw error;
        }
    }
}

async function createSurveysCollection() {
    const collectionId = 'surveys';
    console.log('📝 Creating collection:', collectionId);

    try {
        await databases.createCollection(
            DATABASE_ID,
            collectionId,
            'Surveys',
            [
                Permission.read(Role.any()),
                Permission.create(Role.user('admin')),
                Permission.update(Role.user('admin')),
                Permission.delete(Role.user('admin')),
            ]
        );

        await databases.createStringAttribute(DATABASE_ID, collectionId, 'title', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'description', 1000, false);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'version', 20, true);
        await databases.createEnumAttribute(DATABASE_ID, collectionId, 'status', ['draft', 'locked', 'archived'], false, 'draft');
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'createdAt', true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'updatedAt', true);

        console.log('✅ Surveys collection created\n');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists\n');
        } else {
            throw error;
        }
    }
}

async function createQuestionsCollection() {
    const collectionId = 'questions';
    console.log('📝 Creating collection:', collectionId);

    try {
        await databases.createCollection(
            DATABASE_ID,
            collectionId,
            'Questions',
            [
                Permission.read(Role.any()),
                Permission.create(Role.user('admin')),
                Permission.update(Role.user('admin')),
                Permission.delete(Role.user('admin')),
            ]
        );

        await databases.createStringAttribute(DATABASE_ID, collectionId, 'surveyId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'questionText', 1000, true);
        await databases.createEnumAttribute(DATABASE_ID, collectionId, 'questionType', 
            ['text', 'radio', 'checkbox', 'scale'], true);
        await databases.createBooleanAttribute(DATABASE_ID, collectionId, 'required', false, false);
        await databases.createIntegerAttribute(DATABASE_ID, collectionId, 'order', true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'createdAt', true);

        console.log('✅ Questions collection created\n');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists\n');
        } else {
            throw error;
        }
    }
}

async function createOptionsCollection() {
    const collectionId = 'options';
    console.log('📝 Creating collection:', collectionId);

    try {
        await databases.createCollection(
            DATABASE_ID,
            collectionId,
            'Options',
            [
                Permission.read(Role.any()),
                Permission.create(Role.user('admin')),
                Permission.update(Role.user('admin')),
                Permission.delete(Role.user('admin')),
            ]
        );

        await databases.createStringAttribute(DATABASE_ID, collectionId, 'questionId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'optionText', 500, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'value', 100, true);
        await databases.createIntegerAttribute(DATABASE_ID, collectionId, 'order', true);

        console.log('✅ Options collection created\n');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists\n');
        } else {
            throw error;
        }
    }
}

async function createResponsesCollection() {
    const collectionId = 'responses';
    console.log('📝 Creating collection:', collectionId);

    try {
        await databases.createCollection(
            DATABASE_ID,
            collectionId,
            'Responses',
            [
                Permission.read(Role.user('admin')),
                Permission.create(Role.user('admin')),
                Permission.update(Role.user('admin')),
                Permission.delete(Role.user('admin')),
            ]
        );

        await databases.createStringAttribute(DATABASE_ID, collectionId, 'sessionId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'respondentId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'surveyId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'surveyVersion', 20, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'location', 500, false); // JSON string
        await databases.createEnumAttribute(DATABASE_ID, collectionId, 'status', ['draft', 'submitted', 'voided'], false, 'draft');
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'submittedAt', false);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'voidedBy', 255, false);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'voidReason', 1000, false);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'createdAt', true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'updatedAt', true);

        // Create indexes
        await databases.createIndex(DATABASE_ID, collectionId, 'sessionId_index', 'key', ['sessionId']);
        await databases.createIndex(DATABASE_ID, collectionId, 'submittedAt_index', 'key', ['submittedAt']);

        console.log('✅ Responses collection created\n');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists\n');
        } else {
            throw error;
        }
    }
}

async function createAnswersCollection() {
    const collectionId = 'answers';
    console.log('📝 Creating collection:', collectionId);

    try {
        await databases.createCollection(
            DATABASE_ID,
            collectionId,
            'Answers',
            [
                Permission.read(Role.user('admin')),
                Permission.create(Role.user('admin')),
                Permission.update(Role.user('admin')),
                Permission.delete(Role.user('admin')),
            ]
        );

        await databases.createStringAttribute(DATABASE_ID, collectionId, 'responseId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'questionId', 255, true);
        await databases.createStringAttribute(DATABASE_ID, collectionId, 'answerValue', 2000, true);
        await databases.createDatetimeAttribute(DATABASE_ID, collectionId, 'createdAt', true);

        console.log('✅ Answers collection created\n');
    } catch (error: any) {
        if (error.code === 409) {
            console.log('ℹ️  Collection already exists\n');
        } else {
            throw error;
        }
    }
}

// Run setup
setupDatabase();
