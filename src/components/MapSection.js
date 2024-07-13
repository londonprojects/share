// components/MapSection.js
import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import MapView from 'react-native-maps';

const MapSection = () => {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {/* Add markers here if necessary */}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width - 32,
    height: 150,
    marginBottom: 16,
    alignSelf: 'center',
    borderRadius: 15,
  },
});

export default MapSection;
