import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Animated } from 'react-native';
import { Text, TextInput, Button, Menu, Provider as PaperProvider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from '../services/firebase';
import { cities } from '../services/cities'; // Adjust the path as needed

const FlightItineraryScreen = ({ navigation }) => {
  const [itinerary, setItinerary] = useState({
    flightNumber: '',
    date: new Date(),
    arrivalTime: '',
    city: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || itinerary.date;
    setShowDatePicker(false);
    setItinerary({ ...itinerary, date: currentDate });
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || itinerary.arrivalTime;
    setShowTimePicker(false);
    setItinerary({ ...itinerary, arrivalTime: currentTime });
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

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial value for opacity: 0
  const slideAnim = useRef(new Animated.Value(50)).current; // Initial value for translationY: 50

  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }
    ).start();

    Animated.timing(
      slideAnim,
      {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }
    ).start();
  }, [fadeAnim, slideAnim]);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Animated.View style={{ ...styles.animatedContainer, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
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
          <Button mode="contained" onPress={() => setShowTimePicker(true)} style={styles.button}>
            Select Arrival Time
          </Button>
          {showTimePicker && (
            <DateTimePicker
              value={itinerary.arrivalTime}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button mode="outlined" onPress={() => setMenuVisible(true)} style={styles.input}>
                {itinerary.city || 'Select City'}
              </Button>
            }
          >
            {cities.map((city) => (
              <Menu.Item
                key={city.value}
                onPress={() => {
                  setItinerary({ ...itinerary, city: city.label });
                  setMenuVisible(false);
                }}
                title={city.label}
              />
            ))}
          </Menu>
          <Button mode="contained" onPress={handleShare} style={styles.button}>
            Share Itinerary
          </Button>
        </Animated.View>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
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
