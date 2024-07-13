// SuperSearch.js
import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Button, Text, TextInput, Avatar, useTheme } from 'react-native-paper';

const categories = ['Rides', 'Airbnbs', 'Items', 'Experiences'];

const SuperSearch = ({ visible, onClose, onSearch }) => {
  const [searchCriteria, setSearchCriteria] = useState({
    category: '',
    priceRange: '',
    location: '',
    keywords: '',
  });

  const handleSearch = () => {
    onSearch(searchCriteria);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <Text style={styles.heading}>Where to?</Text>
        <TextInput
          label="Search destinations"
          value={searchCriteria.location}
          onChangeText={(text) => setSearchCriteria({ ...searchCriteria, location: text })}
          style={styles.input}
        />
        <View style={styles.categoryContainer}>
          {categories.map((category) => (
            <TouchableOpacity key={category} onPress={() => setSearchCriteria({ ...searchCriteria, category })}>
              <View style={styles.category}>
                <Text>{category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          label="Price Range"
          value={searchCriteria.priceRange}
          onChangeText={(text) => setSearchCriteria({ ...searchCriteria, priceRange: text })}
          style={styles.input}
        />
        <TextInput
          label="Keywords"
          value={searchCriteria.keywords}
          onChangeText={(text) => setSearchCriteria({ ...searchCriteria, keywords: text })}
          style={styles.input}
        />
        <Button mode="contained" onPress={handleSearch} style={styles.button}>
          Search
        </Button>
        <Button onPress={onClose} style={styles.button}>
          Close
        </Button>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 16,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  category: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
  },
  button: {
    marginBottom: 16,
  },
});

export default SuperSearch;
