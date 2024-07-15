import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, PermissionsAndroid, Alert, Modal, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { firestore, auth } from '../services/firebase';
import { Text, Switch, Provider as PaperProvider, Button, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const [showRides, setShowRides] = useState(true);
  const [showItineraries, setShowItineraries] = useState(true);
  const [showItems, setShowItems] = useState(true);
  const [showExperiences, setShowExperiences] = useState(true);
  const [showAirbnbs, setShowAirbnbs] = useState(true);
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

        const ridesData = ridesSnapshot.docs.map(doc => doc.data());
        const itinerariesData = itinerariesSnapshot.docs.map(doc => doc.data());
        const itemsData = itemsSnapshot.docs.map(doc => doc.data());
        const experiencesData = experiencesSnapshot.docs.map(doc => doc.data());
        const airbnbsData = airbnbsSnapshot.docs.map(doc => doc.data());

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

  const contactUser = (userId) => {
    Alert.alert("Contact", "Feature to contact the user is under development.");
    // Implement actual contact logic here
  };

  const renderMarkerIcon = (type, isDeparture) => {
    let color;
    switch (type) {
      case 'ride':
        color = "red";
        break;
      case 'itinerary':
        color = isDeparture ? "red" : "green";
        break;
      case 'item':
        color = "yellow";
        break;
      case 'experience':
        color = "purple";
        break;
      case 'airbnb':
        color = "orange";
        break;
      default:
        color = "black";
    }
    return <Icon name={type === 'itinerary' ? "airplane" : type} size={30} color={color} />;
  };

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker);
    setModalVisible(true);
  };

  const renderModalContent = () => {
    if (!selectedMarker) return null;
    const { userName, userPhoto, description, type, destination, departureCity, arrivalCity } = selectedMarker;
    return (
      <ScrollView contentContainerStyle={styles.modalContent}>
        <Avatar.Image size={80} source={{ uri: userPhoto || 'https://via.placeholder.com/150' }} />
        <Text style={styles.modalTitle}>{userName}</Text>
        <Text>{description}</Text>
        {type === 'ride' && <Text>Destination: {destination}</Text>}
        {type === 'itinerary' && (
          <>
            <Text>Departure: {departureCity}</Text>
            <Text>Arrival: {arrivalCity}</Text>
          </>
        )}
        <Button mode="contained" onPress={() => contactUser(selectedMarker.userId)}>
          Contact
        </Button>
        <Button mode="outlined" onPress={() => setModalVisible(false)}>
          Close
        </Button>
      </ScrollView>
    );
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
          {showRides && rides.map((place, index) => (
            place.location && place.location.latitude && place.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: place.location.latitude, longitude: place.location.longitude }}
                title={place.destination}
                description={`Leaving: ${place.userName}`}
                onPress={() => handleMarkerPress({ ...place, type: 'ride' })}
              >
                {renderMarkerIcon('ride')}
              </Marker>
            ) : null
          ))}
          {showItineraries && itineraries.map((itinerary, index) => (
            <>
              {itinerary.departureCoords && itinerary.departureCoords.latitude && itinerary.departureCoords.longitude && (
                <Marker
                  key={`departure-${index}`}
                  coordinate={{ latitude: itinerary.departureCoords.latitude, longitude: itinerary.departureCoords.longitude }}
                  title={itinerary.departureCity}
                  description={`Departure: ${itinerary.userName}`}
                  onPress={() => handleMarkerPress({ ...itinerary, type: 'itinerary', isDeparture: true })}
                >
                  {renderMarkerIcon('itinerary', true)}
                </Marker>
              )}
              {itinerary.arrivalCoords && itinerary.arrivalCoords.latitude && itinerary.arrivalCoords.longitude && (
                <Marker
                  key={`arrival-${index}`}
                  coordinate={{ latitude: itinerary.arrivalCoords.latitude, longitude: itinerary.arrivalCoords.longitude }}
                  title={itinerary.arrivalCity}
                  description={`Arrival: ${itinerary.userName}`}
                  onPress={() => handleMarkerPress({ ...itinerary, type: 'itinerary', isDeparture: false })}
                >
                  {renderMarkerIcon('itinerary', false)}
                </Marker>
              )}
            </>
          ))}
          {showItems && items.map((item, index) => (
            item.location && item.location.latitude && item.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: item.location.latitude, longitude: item.location.longitude }}
                title={item.name}
                description={`Item: ${item.userName}`}
                onPress={() => handleMarkerPress({ ...item, type: 'item' })}
              >
                {renderMarkerIcon('item')}
              </Marker>
            ) : null
          ))}
          {showExperiences && experiences.map((experience, index) => (
            experience.location && experience.location.latitude && experience.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: experience.location.latitude, longitude: experience.location.longitude }}
                title={experience.name}
                description={`Experience: ${experience.userName}`}
                onPress={() => handleMarkerPress({ ...experience, type: 'experience' })}
              >
                {renderMarkerIcon('experience')}
              </Marker>
            ) : null
          ))}
          {showAirbnbs && airbnbs.map((airbnb, index) => (
            airbnb.location && airbnb.location.latitude && airbnb.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: airbnb.location.latitude, longitude: airbnb.location.longitude }}
                title={airbnb.location}
                description={`Airbnb: ${airbnb.userName}`}
                onPress={() => handleMarkerPress({ ...airbnb, type: 'airbnb' })}
              >
                {renderMarkerIcon('airbnb')}
              </Marker>
            ) : null
          ))}
        </MapView>
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Filters</Text>
          <View style={styles.filterItem}>
            <Text>Rides</Text>
            <Switch value={showRides} onValueChange={setShowRides} />
          </View>
          <View style={styles.filterItem}>
            <Text>Itineraries</Text>
            <Switch value={showItineraries} onValueChange={setShowItineraries} />
          </View>
          <View style={styles.filterItem}>
            <Text>Items</Text>
            <Switch value={showItems} onValueChange={setShowItems} />
          </View>
          <View style={styles.filterItem}>
            <Text>Experiences</Text>
            <Switch value={showExperiences} onValueChange={setShowExperiences} />
          </View>
          <View style={styles.filterItem}>
            <Text>Airbnbs</Text>
            <Switch value={showAirbnbs} onValueChange={setShowAirbnbs} />
          </View>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.modalView}>
            {renderModalContent()}
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
  filters: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 3,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default MapScreen;
