// screens/MapScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, PermissionsAndroid, Alert, Modal, TouchableOpacity } from 'react-native';
import MapView from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import { firestore } from '../services/firebase';
import { Provider as PaperProvider, Text, Avatar, Button, IconButton, useTheme } from 'react-native-paper';
import MapMarkers from '../components/MapMarkers';
import Filters from '../components/Filters';
import { GOOGLE_MAPS_API_KEY } from '@env'; // Import the API key from the .env file

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
  const [selectedRoute, setSelectedRoute] = useState(null);
  const { colors } = useTheme();

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

    if (marker.type === 'ride' && marker.startLocation && marker.endLocation) {
      setSelectedRoute({
        start: marker.startLocation,
        end: marker.endLocation,
      });
    }
  };

  const contactUser = (userId) => {
    Alert.alert("Contact", "Feature to contact the user is under development.");
    // Implement actual contact logic here
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMarker(null);
    setSelectedRoute(null);
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

          {selectedRoute && (
            <MapViewDirections
              origin={selectedRoute.start}
              destination={selectedRoute.end}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={3}
              strokeColor="hotpink"
              onReady={(result) => {
                console.log(`Distance: ${result.distance} km`);
                console.log(`Duration: ${result.duration} min.`);
              }}
              onError={(errorMessage) => {
                console.error('Error in MapViewDirections:', errorMessage);
              }}
            />
          )}
        </MapView>
        <Filters filters={filters} setFilters={setFilters} />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              {selectedMarker && (
                <>
                  <View style={styles.modalHeader}>
                    <Avatar.Image size={50} source={{ uri: selectedMarker.userPhoto }} />
                    <Text style={styles.userName}>{selectedMarker.userName}</Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedMarker.title || selectedMarker.name}</Text>
                  <Text style={styles.modalDetails}>From: {selectedMarker.startLocation?.address || 'N/A'}</Text>
                  <Text style={styles.modalDetails}>To: {selectedMarker.endLocation?.address || 'N/A'}</Text>
                  <Text style={styles.modalDetails}>Price: ${selectedMarker.price}</Text>
                  <Text style={styles.modalDetails}>Spaces: {selectedMarker.numSpaces}</Text>
                  <Text style={styles.modalDetails}>Date: {selectedMarker.date ? new Date(selectedMarker.date.seconds * 1000).toDateString() : 'N/A'}</Text>
                  {selectedMarker.description && <Text style={styles.modalDetails}>Description: {selectedMarker.description}</Text>}
                  <View style={styles.modalButtons}>
                    <Button mode="contained" onPress={() => contactUser(selectedMarker.userId)}>Contact</Button>
                    <Button mode="outlined" onPress={closeModal}>Close</Button>
                  </View>
                </>
              )}
            </View>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalDetails: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
});

export default MapScreen;
