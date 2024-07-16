// components/MapSection.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, View, PermissionsAndroid, Platform, Alert, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { mapMarkers } from './MapMarkers'; // Adjust the import path if necessary

const DEFAULT_REGION = {
  latitude: 54.5260,
  longitude: 15.2551,
  latitudeDelta: 20,
  longitudeDelta: 20,
};

const MapSection = () => {
  const [initialRegion, setInitialRegion] = useState(null);
  const [markers, setMarkers] = useState([]);

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
        setInitialRegion(DEFAULT_REGION); // Set default region if permission is denied
        setMarkers(mapMarkers); // Set markers from mapMarkers file
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
          setMarkers(mapMarkers); // Set markers from mapMarkers file
        },
        error => {
          console.error('Error getting location:', error);
          Alert.alert("Error", "Failed to get your location. Showing Europe by default.");
          setInitialRegion(DEFAULT_REGION); // Set default region if geolocation fails
          setMarkers(mapMarkers); // Set markers from mapMarkers file
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    getCurrentLocation();
  }, []);

  return (
    <View style={styles.container}>
      {initialRegion ? (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
        >
          {markers && markers.map((marker, index) => (
            marker.location && marker.location.latitude && marker.location.longitude ? (
              <Marker
                key={index}
                coordinate={{ latitude: marker.location.latitude, longitude: marker.location.longitude }}
                title={marker.title || 'Marker'}
                description={marker.description || 'Description'}
              />
            ) : null
          ))}
        </MapView>
      ) : (
        <View style={styles.loadingContainer}>
          <Text>Loading map...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width - 32,
    height: 150,
    marginBottom: 16,
    alignSelf: 'center',
    borderRadius: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapSection;
