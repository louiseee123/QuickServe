
import { databases, teams, storage } from '../appwrite';
import { DATABASE_ID, DOCUMENTS_COLLECTION_ID, DOCUMENT_REQUESTS_COLLECTION_ID, RECEIPTS_BUCKET_ID } from './db';
import { Permission, ID, IndexType, Role } from 'node-appwrite';

// This is a more robust setup script that handles both new and existing collections.
// It will create indexes and add missing attributes even if the collection already exists.
async function setupCollection(
    collectionId: string, 
    name: string, 
    permissions: string[], 
    attributes: { create: () => Promise<any>, name: string }[], 
    indexes: { create: () => Promise<any>, name: string }[]
) {
    try {
        // 1. Check if the collection exists.
        await databases.getCollection(DATABASE_ID, collectionId);
        console.log(`Collection '${name}' already exists. Ensuring attributes and indexes are up-to-date.`);

        // 2. Get existing attributes and check for missing ones.
        const { attributes: existingAttributes } = await databases.listAttributes(DATABASE_ID, collectionId);
        const existingAttrNames = new Set(existingAttributes.map(a => a.key));
        
        console.log(`Checking for missing attributes in '${name}'...`);
        for (const attr of attributes) {
            if (!existingAttrNames.has(attr.name)) {
                try {
                    console.log(`  - Creating missing attribute: ${attr.name}`);
                    await attr.create();
                    // Wait for attribute to be created before next step.
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e) {
                     // If the attribute already exists (409 Conflict), it's not an error.
                    if (e.code === 409) {
                        console.log(`  - INFO: Attribute '${attr.name}' was created by another process. Skipping.`);
                    } else {
                        console.error(`  - FAILED: Could not create attribute '${attr.name}'.`, e);
                        throw e;
                    }
                }
            }
        }
        console.log(`✅ Attributes for collection '${name}' are now up-to-date.`);


        // 3. Ensure all indexes exist.
        console.log(`Creating indexes for '${name}'...`);
        for (const idx of indexes) {
            try {
                await idx.create();
                console.log(`  - SUCCESS: Index '${idx.name}' was created.`);
                // Wait a moment for the index to be available.
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
                // If the index already exists (409 Conflict), it's not an error.
                if (e.code === 409) {
                    console.log(`  - INFO: Index '${idx.name}' already exists. Skipping.`);
                } else {
                    // Re-throw any other unexpected errors.
                    console.error(`  - FAILED: Could not create index '${idx.name}'.`, e);
                    throw e;
                }
            }
        }
        console.log(`✅ Indexes for collection '${name}' are now up-to-date.`);

    } catch (e) {
        // 4. If the collection doesn't exist (404 Not Found), create it from scratch.
        if (e.code === 404) {
            console.log(`Creating collection '${name}' from scratch...`);
            await databases.createCollection(DATABASE_ID, collectionId, name, permissions);
            // Wait for collection to be created before adding attributes.
            await new Promise(resolve => setTimeout(resolve, 1000)); 

            console.log(`Creating attributes for '${name}'...`);
            for (const attr of attributes) {
                console.log(`  - Attribute: ${attr.name}`);
                await attr.create();
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            console.log(`Creating indexes for '${name}'...`);
            for (const idx of indexes) {
                console.log(`  - Index: ${idx.name}`);
                await idx.create();
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            console.log(`✅ Collection '${name}' created successfully.`);
        } else {
            // Re-throw any other unexpected errors during the getCollection call.
            console.error(`❌ Error setting up collection '${name}'.`, e);
            throw e;
        }
    }
}

const setup = async () => {
    try {
        console.log('Starting database setup...');

        let adminTeam;
        try {
            adminTeam = await teams.get('admin');
            console.log('Team "admin" already exists.');
        } catch (e) {
            if (e.code === 404) {
                console.log('Creating team "admin"...');
                adminTeam = await teams.create(ID.unique(), 'admin');
                console.log('✅ Team "admin" created.');
            } else {
                throw e;
            }
        }

        try {
            await storage.getBucket(RECEIPTS_BUCKET_ID);
            console.log('Storage bucket "Receipts" already exists.');
        } catch (e) {
            if (e.code === 404) {
                console.log('Creating storage bucket "Receipts"...');
                await storage.createBucket(
                    RECEIPTS_BUCKET_ID, 
                    'Receipts', 
                    [
                        Permission.create(Role.users()),
                        Permission.read(Role.team(adminTeam.$id)),
                        Permission.read(Role.users()),
                    ],
                    false, // fileSecurity
                    undefined, // allowedFileExtensions
                    undefined, // compression
                    undefined, // encryption
                    undefined, // antivirus
                );
                console.log('✅ Storage bucket "Receipts" created.');
            } else {
                throw e;
            }
        }

        await setupCollection(
            DOCUMENTS_COLLECTION_ID,
            'Documents',
            [Permission.read(Role.any())], 
            [
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENTS_COLLECTION_ID, 'name', 255, true), name: 'name' },
                { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENTS_COLLECTION_ID, 'price', true), name: 'price' },
                { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENTS_COLLECTION_ID, 'processingTimeDays', true), name: 'processingTimeDays' },
            ],
            [
                { create: () => databases.createIndex(DATABASE_ID, DOCUMENTS_COLLECTION_ID, 'name_unique', IndexType.Unique, ['name']), name: 'name_unique' }
            ]
        );

        await setupCollection(
            DOCUMENT_REQUESTS_COLLECTION_ID,
            'Document Requests',
            [
                Permission.create(Role.users()),          
                Permission.read(Role.team(adminTeam.$id)),    
                Permission.update(Role.team(adminTeam.$id)),  
                Permission.delete(Role.team(adminTeam.$id)),  
                Permission.read(Role.users()),           
                Permission.update(Role.users()),        
            ],
            [
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'studentId', 50, true), name: 'studentId' },
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'studentName', 255, true), name: 'studentName' },
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'yearLevel', 50, true), name: 'yearLevel' },
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'course', 255, true), name: 'course' },
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'documents', 10000, true), name: 'documents' },
                { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'totalAmount', true), name: 'totalAmount' },
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'status', 50, false, 'pending_payment'), name: 'status' },
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'paymentStatus', 50, false, 'unpaid'), name: 'paymentStatus' },
                { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'queueNumber', true), name: 'queueNumber' },
                { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'userId', 50, true), name: 'userId' },
                { create: () => databases.createDatetimeAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'requestedAt', false), name: 'requestedAt' }
            ],
            [
                { create: () => databases.createIndex(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'userId_index', IndexType.Key, ['userId']), name: 'userId_index' }
            ]
        );

        console.log('✅ Database setup completed successfully!');

    } catch (error) {
        console.error('❌ Error during database setup:', error);
        process.exit(1); 
    }
};

setup();
