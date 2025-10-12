
import { databases, teams } from '../appwrite';
import { DATABASE_ID, DOCUMENTS_COLLECTION_ID, DOCUMENT_REQUESTS_COLLECTION_ID, COUNTERS_COLLECTION_ID, USERS_COLLECTION_ID } from './db';
import { Permission, ID, IndexType, Role } from 'node-appwrite';


async function setupCollection(collectionId: string, name: string, permissions: string[], attributes: { create: () => Promise<any>, name: string }[], indexes: { create: () => Promise<any>, name: string }[]) {
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
    console.log(`Collection '${name}' already exists. Updating permissions...`);
    await databases.updateCollection(DATABASE_ID, collectionId, name, permissions);
    console.log(`✅ Permissions for collection '${name}' updated.`);
  } catch (e) {
    if (e.code === 404) {
      console.log(`Creating collection '${name}'...`);
      await databases.createCollection(DATABASE_ID, collectionId, name, permissions);
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

    } else {
      throw e;
    }
  }
}

const setup = async () => {
  try {
    console.log('Starting database setup...');

    // --- Create Admin Team ---
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
        { create: ()_=> databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'userId', 50, true), name: 'userId' },
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
