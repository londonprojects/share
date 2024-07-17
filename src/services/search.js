// services/search.js

import { firestore } from './firebase';

const collections = ['rides', 'airbnbs', 'items', 'experiences'];

export const searchFirestore = async (query) => {
  let results = [];
  for (const collection of collections) {
    const snapshot = await firestore
      .collection(collection)
      .where('keywords', 'array-contains', query)
      .get();
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data(), collection });
    });
  }
  console.log('Search results:', results); // Debug log
  return results;
};
