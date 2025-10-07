
import { Firestore } from 'firebase-admin/firestore';
import { COLLECTIONS } from '../constants';

interface Document {
  name: string;
  price: number;
}

const documents: Document[] = [
  {
    name: 'Transcript of Records',
    price: 150,
  },
  {
    name: 'Certificate of Good Moral Character',
    price: 75,
  },
  {
    name: 'Diploma',
    price: 250,
  },
  {
    name: 'Certificate of Enrollment',
    price: 50,
  },
  {
    name: 'Honorable Dismissal',
    price: 100,
  },
];

export const seedDocuments = async (db: Firestore) => {
  console.log('Seeding documents...');
  const documentsCollection = db.collection(COLLECTIONS.DOCUMENTS);

  for (const doc of documents) {
    const snapshot = await documentsCollection.where('name', '==', doc.name).get();
    if (snapshot.empty) {
      await documentsCollection.add(doc);
      console.log(`Added document: ${doc.name}`);
    } else {
      console.log(`Document already exists: ${doc.name}`);
    }
  }

  console.log('Documents seeding complete.');
};
