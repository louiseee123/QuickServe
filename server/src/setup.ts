
import { databases, teams, storage } from '../appwrite';
import { DATABASE_ID, DOCUMENTS_COLLECTION_ID, DOCUMENT_REQUESTS_COLLECTION_ID, RECEIPTS_BUCKET_ID } from './db';
import { Permission, ID, IndexType, Role } from 'node-appwrite';

const setup = async () => {
    try {
        console.log('Starting database setup...');

        // --- BRUTE-FORCE ATTRIBUTE CREATION ---
        console.log('Force-checking critical attributes in Document Requests collection...');
        try {
            await databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'receiptFileId', 50, false);
            console.log("  - SUCCESS: Created attribute 'receiptFileId'.");
        } catch (e) {
            if (e.code === 409) { // 409 is the error code for "already exists"
                console.log("  - INFO: Attribute 'receiptFileId' already exists.");
            } else {
                console.error("  - FAILED: Could not create attribute 'receiptFileId'.", e);
                throw e; // Rethrow if it's a different error
            }
        }

        try {
            await databases.createStringAttribute(DATABASE_ID, DOCUMENT_REQUESTS_COLLECTION_ID, 'rejectionReason', 500, false);
            console.log("  - SUCCESS: Created attribute 'rejectionReason'.");
        } catch (e) {
            if (e.code === 409) {
                console.log("  - INFO: Attribute 'rejectionReason' already exists.");
            } else {
                console.error("  - FAILED: Could not create attribute 'rejectionReason'.", e);
                throw e;
            }
        }
        console.log('✅ Critical attributes checked.');
        // --- END BRUTE-FORCE --- 

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
                    true, // fileSecurity
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

        // The rest of the setup script can proceed now
        // This part is less critical for the immediate fix, but we'll leave it
        // to ensure collections are created if they don't exist at all.

    } catch (error) {
        console.error('❌ Error during database setup:', error);
        process.exit(1); 
    }
};

setup();
