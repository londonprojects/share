// MatchingItinerariesComponent.js
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button as RNButton } from 'react-native';
import { Button } from 'react-native-paper';
import { airports } from '../services/airports'; // Import your airports list

const MatchingItinerariesComponent = ({ navigation }) => {
  const [visible, setVisible] = useState(false);
  const [airport, setAirport] = useState('');

  const handleNavigate = () => {
    if (airport) {
      navigation.navigate('MatchingItineraries', { airport });
    } else {
      alert('Please enter an airport name');
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        placeholder="Enter Airport"
        value={airport}
        onChangeText={setAirport}
        style={styles.input}
      />
      <RNButton title="Select Airport" onPress={() => setVisible(true)} />
      {visible && (
        <View style={styles.menu}>
          {airports.map((airport) => (
            <RNButton key={airport.value} title={airport.label} onPress={() => { setAirport(airport.value); setVisible(false); }} />
          ))}
        </View>
      )}
      <Button mode="contained" onPress={handleNavigate} style={styles.button}>
        View Matching Itineraries
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    marginVertical: 8,
  },
  button: {
    width: '90%',
    marginVertical: 8,
  },
  menu: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 2,
  },
});

export default MatchingItinerariesComponent;
