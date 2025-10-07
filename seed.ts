
import { db } from './server/firebase';
import { seedDocuments } from './server/src/db/documents.seed';

async function seed() {
  console.log('Seeding Firestore database...');
  await seedDocuments(db);
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
