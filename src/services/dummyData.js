// services/dummyData.js
import { firestore } from './firebase';

export const addDummyData = async () => {
  const dummyUsers = [
    {
      displayName: 'John Doe',
      email: 'john@example.com',
      photoURL: 'https://via.placeholder.com/150',
      lastPosted: new Date(),
    },
    {
      displayName: 'Jane Smith',
      email: 'jane@example.com',
      photoURL: 'https://via.placeholder.com/150',
      lastPosted: new Date(),
    },
    {
      displayName: 'Alice Johnson',
      email: 'alice@example.com',
      photoURL: 'https://via.placeholder.com/150',
      lastPosted: new Date(),
    },
  ];

  try {
    const batch = firestore.batch();
    dummyUsers.forEach(user => {
      const docRef = firestore.collection('users').doc();
      batch.set(docRef, user);
    });
    await batch.commit();
    console.log('Dummy users added successfully');
  } catch (error) {
    console.error('Error adding dummy users:', error);
  }
};
