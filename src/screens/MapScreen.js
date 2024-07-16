// screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, PermissionsAndroid, Alert, Modal } from 'react-native';
import MapView from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { firestore } from '../services/firebase';
import { Provider as PaperProvider } from 'react-native-paper';
import MapMarkers from '../components/MapMarkers';
import Filters from '../components/Filters';
import ModalContent from '../components/ModalContent';

const MapScreen = () => {
  const [rides, setRides] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [items, setItems] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [airbnbs, setAirbnbs] = useState([]);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [filters, setFilters] = useState({
    showRides: true,
    showItineraries: true,
    showItems: true,
    showExperiences: true,
    showAirbnbs: true,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    };

    const getCurrentLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Location permission is required to show your location.");
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setInitialRegion({
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        },
        error => {
          console.error('Error getting location:', error);
          if (error.code === 3) {
            setTimeout(getCurrentLocation, 10000); // Retry after 10 seconds if timeout
          } else {
            Alert.alert("Error", "Failed to get your location. Please try again.");
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    const fetchPlaces = async () => {
      try {
        const ridesSnapshot = await firestore.collection('rides').get();
        const itinerariesSnapshot = await firestore.collection('flightItineraries').get();
        const itemsSnapshot = await firestore.collection('items').get();
        const experiencesSnapshot = await firestore.collection('experiences').get();
        const airbnbsSnapshot = await firestore.collection('airbnbs').get();

        const ridesData = ridesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const itinerariesData = itinerariesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const itemsData = itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const experiencesData = experiencesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const airbnbsData = airbnbsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        setRides(ridesData);
        setItineraries(itinerariesData);
        setItems(itemsData);
        setExperiences(experiencesData);
        setAirbnbs(airbnbsData);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    };

    getCurrentLocation();
    fetchPlaces();
  }, []);

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setModalVisible(true);
  };

  const contactUser = (userId) => {
    Alert.alert("Contact", "Feature to contact the user is under development.");
    // Implement actual contact logic here
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMarker(null);
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
          {filters.showRides && <MapMarkers data={rides} type="ride" handleMarkerPress={handleMarkerPress} />}
          {filters.showItineraries && <MapMarkers data={itineraries} type="itinerary" handleMarkerPress={handleMarkerPress} />}
          {filters.showItems && <MapMarkers data={items} type="item" handleMarkerPress={handleMarkerPress} />}
          {filters.showExperiences && <MapMarkers data={experiences} type="experience" handleMarkerPress={handleMarkerPress} />}
          {filters.showAirbnbs && <MapMarkers data={airbnbs} type="airbnb" handleMarkerPress={handleMarkerPress} />}
        </MapView>
        <Filters filters={filters} setFilters={setFilters} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalView}>
            <ModalContent marker={selectedMarker} contactUser={contactUser} closeModal={closeModal} />
          </View>
        </Modal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default MapScreen;
