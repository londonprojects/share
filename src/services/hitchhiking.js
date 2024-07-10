import { firestore, auth } from './firebase';
import Geolocation from '@react-native-community/geolocation';
import { sendNotification } from './notifications';

export const listenForHitchhikingRequests = () => {
  const user = auth.currentUser;
  if (!user) return;

  firestore.collection('users').doc(user.uid).onSnapshot((doc) => {
    if (doc.exists && doc.data().isHitchhiker) {
      firestore.collection('hitchhiking_requests').onSnapshot(async (snapshot) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const userLocation = new firestore.GeoPoint(position.coords.latitude, position.coords.longitude);

            snapshot.forEach((doc) => {
              const request = doc.data();
              const requestLocation = request.currentLocation; // Assume this is also a GeoPoint
              if (isNearby(userLocation, requestLocation)) {
                sendNotification("Hitchhike Request", `${request.userName} needs a ride to ${request.destination}`);
              }
            });
          },
          (error) => {
            console.log(error);
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      });
    }
  });
};

const isNearby = (userLocation, requestLocation) => {
  const distance = getDistance(userLocation, requestLocation);
  return distance < 10; // Distance in kilometers
};

const getDistance = (loc1, loc2) => {
  const lat1 = loc1.latitude;
  const lon1 = loc1.longitude;
  const lat2 = loc2.latitude;
  const lon2 = loc2.longitude;
  // Haversine formula to calculate distance
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI/180);
};
