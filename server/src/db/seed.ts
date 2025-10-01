
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const documentsData = [
  {
    name: 'TOR',
    price: 150.00,
  },
  {
    name: 'Certification',
    price: 75.00,
  },
  {
    name: 'Good Moral',
    price: 50.00,
  },
  {
    name: 'Others',
    price: 100.00,
  },
  {
    name: 'Test Document',
    price: 0.00,
  },
];

async function seed() {
  console.log('Seeding Firestore database with documents...');
  const documentsCollection = collection(db, 'documents');

  // Clear existing documents to prevent duplicates
  const existingDocsSnapshot = await getDocs(documentsCollection);
  for (const document of existingDocsSnapshot.docs) {
    await deleteDoc(doc(db, 'documents', document.id));
  }
  console.log('Cleared existing documents.');

  // Insert new documents
  for (const document of documentsData) {
    await addDoc(documentsCollection, document);
  }
  console.log('Seeding complete! The following documents have been added:');
  console.table(documentsData);

  process.exit(0);
}

seed().catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
});
