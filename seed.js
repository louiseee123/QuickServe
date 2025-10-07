"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("./server/firebase");
const documents_seed_1 = require("./server/src/db/documents.seed");
async function seed() {
    console.log('Seeding Firestore database...');
    await (0, documents_seed_1.seedDocuments)(firebase_1.db);
    console.log('Seeding complete!');
    process.exit(0);
}
seed().catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
});
