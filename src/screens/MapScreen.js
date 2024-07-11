import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { firestore } from '../services/firebase';
import { Text, Button, Switch, Provider as PaperProvider } from 'react-native-paper';

const MapScreen = () => {
  const [leavingPlaces, setLeavingPlaces] = useState([]);
  const [goingPlaces, setGoingPlaces] = useState([]);
  const [showLeaving, setShowLeaving] = useState(true);
  const [showGoing, setShowGoing] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      const leavingSnapshot = await firestore.collection('rides').where('status', '==', 'leaving').get();
      const goingSnapshot = await firestore.collection('rides').where('status', '==', 'going').get();
      
      setLeavingPlaces(leavingSnapshot.docs.map(doc => doc.data()));
      setGoingPlaces(goingSnapshot.docs.map(doc => doc.data()));
    };
    
    fetchPlaces();
  }, []);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {showLeaving && leavingPlaces.map((place, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: place.location.latitude, longitude: place.location.longitude }}
              pinColor="red"
              title={place.destination}
              description={`Leaving: ${place.userName}`}
            />
          ))}
          {showGoing && goingPlaces.map((place, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: place.location.latitude, longitude: place.location.longitude }}
              pinColor="blue"
              title={place.destination}
              description={`Going: ${place.userName}`}
            />
          ))}
        </MapView>
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Show Leaving</Text>
          <Switch value={showLeaving} onValueChange={setShowLeaving} />
          <Text style={styles.filterLabel}>Show Going</Text>
          <Switch value={showGoing} onValueChange={setShowGoing} />
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    marginHorizontal: 10,
  },
});

export default MapScreen;
