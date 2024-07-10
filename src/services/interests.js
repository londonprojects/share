import { firestore, auth } from './firebase';

export const markInterestInListing = async (listingId, ownerId) => {
  const user = auth.currentUser;
  if (user) {
    const interestData = {
      listingId: listingId,
      ownerId: ownerId,
      interestedUserId: user.uid,
      timestamp: new Date(),
    };

    try {
      await firestore.collection('interests').add(interestData);
      alert('Interest marked successfully');
    } catch (error) {
      alert('Error marking interest: ' + error.message);
    }
  } else {
    alert('User not logged in');
  }
};
