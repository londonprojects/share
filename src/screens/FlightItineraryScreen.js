import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from '../services/firebase';

const FlightItineraryScreen = ({ navigation }) => {
  const [itinerary, setItinerary] = useState({
    flightNumber: '',
    date: new Date(),
    arrivalTime: '',
    city: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || itinerary.date;
    setShowDatePicker(false);
    setItinerary({ ...itinerary, date: currentDate });
  };

  const handleShare = () => {
    if (!itinerary.flightNumber || !itinerary.arrivalTime || !itinerary.city) {
      Alert.alert("Missing Information", "Please fill in all the fields.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      const itineraryWithUser = {
        ...itinerary,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        dateListed: new Date(),
      };

      firestore.collection('flightItineraries').add(itineraryWithUser)
        .then(() => {
          Alert.alert("Success", "Itinerary shared successfully!");
          navigation.navigate('Home');
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    } else {
      Alert.alert("Error", "User not logged in.");
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Share Your Flight Itinerary</Text>
      <TextInput
        label="Flight Number"
        value={itinerary.flightNumber}
        onChangeText={(text) => setItinerary({ ...itinerary, flightNumber: text })}
        style={styles.input}
      />
      <Button mode="contained" onPress={() => setShowDatePicker(true)} style={styles.button}>
        Select Date
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={itinerary.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <TextInput
        label="Arrival Time"
        value={itinerary.arrivalTime}
        onChangeText={(text) => setItinerary({ ...itinerary, arrivalTime: text })}
        style={styles.input}
      />
      <TextInput
        label="City"
        value={itinerary.city}
        onChangeText={(text) => setItinerary({ ...itinerary, city: text })}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleShare} style={styles.button}>
        Share Itinerary
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    width: '80%',
    marginBottom: 16,
  },
  button: {
    width: '80%',
    marginBottom: 16,
  },
});

export default FlightItineraryScreen;
