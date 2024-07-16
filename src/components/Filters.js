// components/Filters.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Switch } from 'react-native-paper';

const Filters = ({ filters, setFilters }) => {
  const { showRides, showItineraries, showItems, showExperiences, showAirbnbs } = filters;

  return (
    <View style={styles.filters}>
      <Text style={styles.filterLabel}>Filters</Text>
      <View style={styles.filterItem}>
        <Text>Rides</Text>
        <Switch value={showRides} onValueChange={value => setFilters(prev => ({ ...prev, showRides: value }))} />
      </View>
      <View style={styles.filterItem}>
        <Text>Itineraries</Text>
        <Switch value={showItineraries} onValueChange={value => setFilters(prev => ({ ...prev, showItineraries: value }))} />
      </View>
      <View style={styles.filterItem}>
        <Text>Items</Text>
        <Switch value={showItems} onValueChange={value => setFilters(prev => ({ ...prev, showItems: value }))} />
      </View>
      <View style={styles.filterItem}>
        <Text>Experiences</Text>
        <Switch value={showExperiences} onValueChange={value => setFilters(prev => ({ ...prev, showExperiences: value }))} />
      </View>
      <View style={styles.filterItem}>
        <Text>Airbnbs</Text>
        <Switch value={showAirbnbs} onValueChange={value => setFilters(prev => ({ ...prev, showAirbnbs: value }))} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default Filters;
