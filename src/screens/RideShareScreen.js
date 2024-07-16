import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform, Image, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, Avatar, Checkbox } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { firestore, auth } from '../services/firebase'; // Adjust the path as needed
import { GOOGLE_API_KEY, UNSPLASH_ACCESS_KEY } from '@env'; // Import the environment variable

const RideShareScreen = ({ navigation }) => {
  const [rideDetails, setRideDetails] = useState({
    destination: '',
    startDate: new Date(),
    endDate: new Date(),
    price: 0,
    numSpaces: 1,
    timeLimited: false,
    location: { latitude: null, longitude: null },
    description: '',
    startPoint: '',
    isTaxi: false,
    imageUrl: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params: {
            address: 'test',
            key: GOOGLE_API_KEY, // Use the environment variable
          },
        });

        if (response.data.status === 'REQUEST_DENIED') {
          console.error('Geocoding API error: REQUEST_DENIED - Check your API key.');
        } else {
          console.log('Geocoding API key is working.');
        }
      } catch (error) {
        console.error('Geocoding API request failed:', error);
      }
    };

    checkApiKey();
  }, []);

  const handleDateChange = ({ startDate, endDate }) => {
    setRideDetails({ ...rideDetails, startDate, endDate });
    setShowDatePicker(false);
  };

  const getCoordinates = async (address) => {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: GOOGLE_API_KEY, // Use the environment variable
        },
      });

      if (response.data.status === 'OK') {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        console.error('Geocoding API error:', response.data);
        Alert.alert('Error', `Geocoding API error: ${response.data.status} - ${response.data.error_message}`);
        return null;
      }
    } catch (error) {
      console.error('Geocoding API request failed:', error);
      Alert.alert('Error', `Failed to get location coordinates. ${error.message}`);
      return null;
    }
  };

  const fetchUnsplashImage = async (query) => {
    try {
      const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query,
          client_id: UNSPLASH_ACCESS_KEY, // Use your Unsplash access key
        },
      });

      if (response.data.results.length > 0) {
        return response.data.results[0].urls.regular;
      } else {
        return 'https://example.com/default-driving-image.jpg'; // Use a default image URL
      }
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return 'https://example.com/default-driving-image.jpg'; // Use a default image URL
    }
  };

  const handleShare = async () => {
    if (!rideDetails.destination || !rideDetails.startPoint || rideDetails.price <= 0 || rideDetails.numSpaces <= 0) {
      Alert.alert("Missing Information", "Please fill in all the details.");
      return;
    }

    const coordinates = await getCoordinates(rideDetails.destination);
    if (!coordinates) {
      Alert.alert("Error", "Failed to get location coordinates.");
      return;
    }

    const imageUrl = await fetchUnsplashImage(rideDetails.destination);

    const user = auth.currentUser;
    if (user) {
      const rideWithUser = {
        ...rideDetails,
        location: coordinates,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        dateListed: new Date(),
        imageUrl
      };

      firestore.collection('rides').add(rideWithUser)
        .then(() => {
          Alert.alert("Success", "Ride shared successfully!");
          navigation.navigate('Home'); // Navigate to Home or another screen after adding the ride
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    } else {
      Alert.alert("Error", "User not logged in.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Avatar.Icon size={80} icon="car" style={styles.avatar} />
      <Text style={[styles.title, { color: colors.primary }]}>Share a Ride</Text>
      <TextInput
        label="Starting Point"
        value={rideDetails.startPoint}
        onChangeText={(text) => setRideDetails({ ...rideDetails, startPoint: text })}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Destination"
        value={rideDetails.destination}
        onChangeText={(text) => setRideDetails({ ...rideDetails, destination: text })}
        style={styles.input}
        mode="outlined"
      />
      <Text style={styles.label}>Price: ${rideDetails.price}</Text>
      <Slider
        value={rideDetails.price}
        onValueChange={(value) => setRideDetails({ ...rideDetails, price: value })}
        minimumValue={0}
        maximumValue={100}
        step={1}
        style={styles.slider}
      />
      <Text style={styles.label}>Number of Spaces: {rideDetails.numSpaces}</Text>
      <Slider
        value={rideDetails.numSpaces}
        onValueChange={(value) => setRideDetails({ ...rideDetails, numSpaces: value })}
        minimumValue={1}
        maximumValue={10}
        step={1}
        style={styles.slider}
      />
      <Button mode="outlined" onPress={() => setShowDatePicker(true)} style={styles.button}>
        Select Date Range
      </Button>
      {showDatePicker && (
        <DatePickerModal
          mode="range"
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          startDate={rideDetails.startDate}
          endDate={rideDetails.endDate}
          onConfirm={handleDateChange}
        />
      )}
      {rideDetails.startDate && rideDetails.endDate && (
        <Text style={styles.label}>Selected Dates: {rideDetails.startDate.toDateString()} - {rideDetails.endDate.toDateString()}</Text>
      )}
      <TextInput
        label="Description"
        value={rideDetails.description}
        onChangeText={(text) => setRideDetails({ ...rideDetails, description: text })}
        style={styles.input}
        mode="outlined"
        multiline
        numberOfLines={4}
      />
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={rideDetails.isTaxi ? 'checked' : 'unchecked'}
          onPress={() => setRideDetails({ ...rideDetails, isTaxi: !rideDetails.isTaxi })}
        />
        <Text style={styles.checkboxLabel}>Taxi</Text>
      </View>
      <Button mode="contained" onPress={handleShare} style={styles.button}>
        Share Ride
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  avatar: {
    backgroundColor: '#6200EE',
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    marginBottom: 16,
  },
  label: {
    width: '80%',
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  slider: {
    width: '80%',
    marginBottom: 16,
  },
  button: {
    width: '80%',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
});

export default RideShareScreen;
