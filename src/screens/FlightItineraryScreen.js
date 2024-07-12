import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Animated, ImageBackground } from 'react-native';
import { Text, TextInput, Button, Menu, Provider as PaperProvider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from '../services/firebase';
import { cities } from '../services/cities'; // Adjust the path as needed
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = 'Y9tdu1sdQdRJV4zwTDqLsSxT9-yJbuud6msoTTMAu_Lg'; // Replace with your Unsplash Access Key
const DEFAULT_IMAGE_URL = 'https://plus.unsplash.com/premium_photo-1679830513869-cd3648acb1db?q=80&w=1527&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Replace with your default image URL

const FlightItineraryScreen = ({ navigation }) => {
  const [itinerary, setItinerary] = useState({
    flightNumber: '',
    date: new Date(),
    arrivalTime: new Date(), // Initialize with a valid Date object
    departureCity: '',
    arrivalCity: '',
    departureCoords: { latitude: 0, longitude: 0 },
    arrivalCoords: { latitude: 0, longitude: 0 },
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [departureMenuVisible, setDepartureMenuVisible] = useState(false);
  const [arrivalMenuVisible, setArrivalMenuVisible] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);

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
    if (!itinerary.flightNumber || !itinerary.arrivalTime || !itinerary.departureCity || !itinerary.arrivalCity) {
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

  const fetchBackgroundImage = (city) => {
    axios.get(`https://api.unsplash.com/photos/random`, {
      params: { query: city, client_id: UNSPLASH_ACCESS_KEY },
    })
    .then(response => {
      setBackgroundImage(response.data.urls.regular);
    })
    .catch(error => {
      console.error('Error fetching image from Unsplash:', error);
      setBackgroundImage(DEFAULT_IMAGE_URL); // Set default image URL on error
    });
  };

  useEffect(() => {
    if (itinerary.departureCity || itinerary.arrivalCity) {
      const city = itinerary.departureCity || itinerary.arrivalCity;
      fetchBackgroundImage(city);
    }
  }, [itinerary.departureCity, itinerary.arrivalCity]);

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

  const handleCitySelect = (city, type) => {
    const selectedCity = cities.find(c => c.label === city);
    if (type === 'departure') {
      setItinerary({
        ...itinerary,
        departureCity: city,
        departureCoords: { latitude: selectedCity.latitude, longitude: selectedCity.longitude },
      });
      setDepartureMenuVisible(false);
    } else {
      setItinerary({
        ...itinerary,
        arrivalCity: city,
        arrivalCoords: { latitude: selectedCity.latitude, longitude: selectedCity.longitude },
      });
      setArrivalMenuVisible(false);
    }
  };

  return (
    <PaperProvider>
      <ImageBackground source={{ uri: backgroundImage }} style={styles.backgroundImage}>
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
            <Text style={styles.infoText}>Selected Date: {itinerary.date.toDateString()}</Text>
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
            <Text style={styles.infoText}>Selected Time: {itinerary.arrivalTime.toLocaleTimeString()}</Text>
            <Menu
              visible={departureMenuVisible}
              onDismiss={() => setDepartureMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setDepartureMenuVisible(true)} style={styles.input}>
                  {itinerary.departureCity || 'Select Departure City'}
                </Button>
              }
            >
              {cities.map((city) => (
                <Menu.Item
                  key={city.value}
                  onPress={() => handleCitySelect(city.label, 'departure')}
                  title={city.label}
                />
              ))}
            </Menu>
            <Menu
              visible={arrivalMenuVisible}
              onDismiss={() => setArrivalMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setArrivalMenuVisible(true)} style={styles.input}>
                  {itinerary.arrivalCity || 'Select Arrival City'}
                </Button>
              }
            >
              {cities.map((city) => (
                <Menu.Item
                  key={city.value}
                  onPress={() => handleCitySelect(city.label, 'arrival')}
                  title={city.label}
                />
              ))}
            </Menu>
            <Text style={styles.infoText}>Departure City: {itinerary.departureCity}</Text>
            <Text style={styles.infoText}>Arrival City: {itinerary.arrivalCity}</Text>
            <Button mode="contained" onPress={handleShare} style={styles.button}>
              Share Itinerary
            </Button>
          </Animated.View>
        </View>
      </ImageBackground>
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
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  animatedContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 8,
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
  infoText: {
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
});

export default FlightItineraryScreen;
