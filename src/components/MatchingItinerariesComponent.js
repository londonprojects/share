import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { Button, Modal, Portal, Text, Provider as PaperProvider, List } from 'react-native-paper';
import { airports } from '../services/airports'; // Import your airports list

const MatchingItinerariesComponent = ({ navigation }) => {
  const [visible, setVisible] = useState(false);
  const [airport, setAirport] = useState('');
  const [filteredAirports, setFilteredAirports] = useState(airports);

  const handleNavigate = () => {
    if (airport) {
      navigation.navigate('MatchingItineraries', { airport });
    } else {
      alert('Please enter an airport name');
    }
  };

  const handleSearch = (text) => {
    const filtered = airports.filter((a) =>
      a.label.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredAirports(filtered);
  };

  return (
    <PaperProvider>
      <View style={styles.inputContainer}>
        <Text style={styles.title}>Find Matching Itineraries</Text>
        <TextInput
          placeholder="Enter Airport"
          value={airport}
          onChangeText={setAirport}
          style={styles.input}
        />
        <Button mode="outlined" onPress={() => setVisible(true)} style={styles.selectButton}>
          Select Airport
        </Button>
        <Portal>
          <Modal visible={visible} onDismiss={() => setVisible(false)} contentContainerStyle={styles.modalContainer}>
            <TextInput
              placeholder="Search Airports"
              onChangeText={handleSearch}
              style={styles.modalInput}
            />
            <FlatList
              data={filteredAirports}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setAirport(item.value);
                    setVisible(false);
                  }}
                >
                  <List.Item title={item.label} />
                </TouchableOpacity>
              )}
              style={styles.list}
            />
            <Button onPress={() => setVisible(false)} style={styles.closeButton}>
              Close
            </Button>
          </Modal>
        </Portal>
        <Button mode="contained" onPress={handleNavigate} style={styles.button}>
          View Matching Itineraries
        </Button>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '90%',
    padding: 10,
    marginVertical: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  selectButton: {
    marginVertical: 8,
  },
  button: {
    width: '90%',
    marginVertical: 8,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
    elevation: 4,
  },
  modalInput: {
    marginBottom: 16,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
  },
  list: {
    maxHeight: 200, // Ensure the list is scrollable within the modal
  },
  closeButton: {
    marginTop: 16,
  },
});

export default MatchingItinerariesComponent;
