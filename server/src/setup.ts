import { databases } from '../appwrite';
import { DATABASE_ID, DOCUMENTS_COLLECTION_ID, DOCUMENT_REQUESTS_COLLECTION_ID, COUNTERS_COLLECTION_ID, USERS_COLLECTION_ID } from './db';
import { Permission, ID, IndexType } from 'node-appwrite';

// --- Helper Functions ---

// Waits for a resource to be ready by polling.
async function waitForResource(check: () => Promise<any>, resourceName: string) {
  const MAX_RETRIES = 15;
  const RETRY_DELAY = 1000; // 1 second

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await check();
      console.log(`✅ Resource '${resourceName}' is ready.`);
      return;
    } catch (error) {
      if (error.code === 404) {
        console.log(`... Waiting for resource '${resourceName}' to be created (attempt ${i + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        // If it's another error, re-throw it immediately
        throw error;
      }
    }
  }
  throw new Error(`Timeout waiting for resource '${resourceName}' to become available.`);
}

// Creates a collection and its attributes sequentially.
async function createCollection(collectionId: string, name: string, attributes: { create: () => Promise<any>, name: string }[], indexes: { create: () => Promise<any>, name: string }[]) {
  try {
    await databases.getCollection(DATABASE_ID, collectionId);
    console.log(`Collection '${name}' already exists. Skipping.`);
  } catch (e) {
    if (e.code === 404) {
      console.log(`Creating collection '${name}'...`);
      // Using modern, more secure permissions. Admin actions will be handled by a backend API key.
      await databases.createCollection(DATABASE_ID, collectionId, name, [
        Permission.read('users'),
        Permission.create('users'),
        Permission.update('users'),
        Permission.delete('users'),
      ]);
      await waitForResource(() => databases.getCollection(DATABASE_ID, collectionId), `Collection: ${name}`);

      console.log(`Creating attributes for '${name}'...`);
      for (const attr of attributes) {
        console.log(`  - Attribute: ${attr.name}`);
        await attr.create();
        // Appwrite can be slow to register an attribute, let's wait for it.
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

// --- Main Setup Logic ---

const setup = async () => {
  try {
    console.log('Starting database setup...');
    await waitForResource(() => databases.get(DATABASE_ID), `Database: ${DATABASE_ID}`);

    // -- Users Collection --
    await createCollection(
      USERS_COLLECTION_ID,
      'Users',
      [
        { create: () => databases.createStringAttribute(DATABASE_ID, USERS_COLLECTION_ID, 'name', 255, true), name: 'name' },
        { create: () => databases.createStringAttribute(DATABASE_ID, USERS_COLLECTION_ID, 'email', 255, true), name: 'email' },
      ],
      [
        { create: () => databases.createIndex(DATABASE_ID, USERS_COLLECTION_ID, 'email_unique', IndexType.Unique, ['email']), name: 'email_unique' }
      ]
    );

    // -- Documents Collection --
    await createCollection(
      DOCUMENTS_COLLECTION_ID,
      'Documents',
      [
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENTS_COLLECTION_ID, 'name', 255, true), name: 'name' },
        { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENTS_COLLECTION_ID, 'price', true), name: 'price' },
        { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENTS_COLLECTION_ID, 'processingTimeDays', true), name: 'processingTimeDays' },
      ],
      [
        { create: () => databases.createIndex(DATABASE_ID, DOCUMENTS_COLLECTION_ID, 'name_unique', IndexType.Unique, ['name']), name: 'name_unique' }
      ]
    );

    // -- Document Requests Collection --
    await createCollection(
      DOCUMENT_REQUESTS_COLLECTION_ID,
      'Document Requests',
      [
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'studentId', 50, true), name: 'studentId' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'studentName', 255, true), name: 'studentName' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'yearLevel', 50, true), name: 'yearLevel' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'course', 255, true), name: 'course' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'email', 255, true), name: 'email' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'purpose', 1000, true), name: 'purpose' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'documents', 10000, true), name: 'documents' },
        { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'totalAmount', true), name: 'totalAmount' },
        { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'estimatedCompletionDays', true), name: 'estimatedCompletionDays' },
        // Status and paymentStatus are NOT required, but have a default value.
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'status', 50, false, 'pending_payment'), name: 'status' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'paymentStatus', 50, false, 'unpaid'), name: 'paymentStatus' },
        { create: () => databases.createIntegerAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'queueNumber', true), name: 'queueNumber' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'rejectionReason', 1000, false), name: 'rejectionReason' },
        { create: () => databases.createDatetimeAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'requestedAt', false), name: 'requestedAt' },
        { create: () => databases.createDatetimeAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'processingStartedAt', false), name: 'processingStartedAt' },
        { create: () => databases.createDatetimeAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'completedAt', false), name: 'completedAt' },
        { create: () => databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'userId', 50, false), name: 'userId' },
      ],
      [
        { create: () => databases.createIndex(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'queue_number_idx', IndexType.Key, ['queueNumber']), name: 'queue_number_idx' }
      ]
    );

    // -- Counters Collection --
    await createCollection(
      COUNTERS_COLLECTION_ID,
      'Counters',
      [
        { create: () => databases.createIntegerAttribute(DATABASE_ID, COUNTERS_COLLECTION_ID, 'lastQueueNumber', true), name: 'lastQueueNumber' },
      ],
      []
    );

    console.log('✅ Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Error during database setup:', error);
    process.exit(1); // Exit with an error code
  }
};

// Execute the setup
setup();
