import Geolocation from '@react-native-community/geolocation';
import { firestore, auth } from './firebase';
import { GeoPoint } from 'firebase/firestore';

export const updateUserLocation = () => {
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const user = auth.currentUser;
      if (user) {
        firestore.collection('users').doc(user.uid).update({
          location: new GeoPoint(latitude, longitude),
        });
      }
    },
    (error) => {
      console.log(error);
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
  );
};
