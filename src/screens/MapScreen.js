import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { firestore } from '../services/firebase';
import { Text, Switch, Provider as PaperProvider } from 'react-native-paper';

const MapScreen = () => {
  const [rides, setRides] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [items, setItems] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [airbnbs, setAirbnbs] = useState([]);

  useEffect(() => {
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

        console.log("Fetched rides data:", ridesData);
        console.log("Fetched itineraries data:", itinerariesData);
        console.log("Fetched items data:", itemsData);
        console.log("Fetched experiences data:", experiencesData);
        console.log("Fetched airbnbs data:", airbnbsData);

        setRides(ridesData);
        setItineraries(itinerariesData);
        setItems(itemsData);
        setExperiences(experiencesData);
        setAirbnbs(airbnbsData);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
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
          {rides.map((place, index) => (
            place.location && place.location.latitude && place.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: place.location.latitude, longitude: place.location.longitude }}
                pinColor="red"
                title={place.destination}
                description={`Leaving: ${place.userName}`}
              />
            ) : null
          ))}
          {itineraries.map((itinerary, index) => (
            <>
              {itinerary.departureCoords && itinerary.departureCoords.latitude && itinerary.departureCoords.longitude && (
                <Marker
                  key={`departure-${index}`}
                  coordinate={{ latitude: itinerary.departureCoords.latitude, longitude: itinerary.departureCoords.longitude }}
                  pinColor="green"
                  title={itinerary.departureCity}
                  description={`Departure: ${itinerary.userName}`}
                />
              )}
              {itinerary.arrivalCoords && itinerary.arrivalCoords.latitude && itinerary.arrivalCoords.longitude && (
                <Marker
                  key={`arrival-${index}`}
                  coordinate={{ latitude: itinerary.arrivalCoords.latitude, longitude: itinerary.arrivalCoords.longitude }}
                  pinColor="blue"
                  title={itinerary.arrivalCity}
                  description={`Arrival: ${itinerary.userName}`}
                />
              )}
            </>
          ))}
          {items.map((item, index) => (
            item.location && item.location.latitude && item.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: item.location.latitude, longitude: item.location.longitude }}
                pinColor="yellow"
                title={item.name}
                description={`Item: ${item.userName}`}
              />
            ) : null
          ))}
          {experiences.map((experience, index) => (
            experience.location && experience.location.latitude && experience.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: experience.location.latitude, longitude: experience.location.longitude }}
                pinColor="purple"
                title={experience.name}
                description={`Experience: ${experience.userName}`}
              />
            ) : null
          ))}
          {airbnbs.map((airbnb, index) => (
            airbnb.location && airbnb.location.latitude && airbnb.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: airbnb.location.latitude, longitude: airbnb.location.longitude }}
                pinColor="orange"
                title={airbnb.location}
                description={`Airbnb: ${airbnb.userName}`}
              />
            ) : null
          ))}
        </MapView>
        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Filters</Text>
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
