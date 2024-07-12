import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Avatar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import axios from 'axios';
import { firestore, auth } from '../services/firebase'; // Adjust the path as needed

const RideShareScreen = ({ navigation }) => {
  const [rideDetails, setRideDetails] = useState({ destination: '', date: new Date(), price: 0, numSpaces: 1, timeLimited: false, location: { latitude: null, longitude: null } });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || rideDetails.date;
    setShowDatePicker(Platform.OS === 'ios');
    setRideDetails({ ...rideDetails, date: currentDate });
  };

  const getCoordinates = async (address) => {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address,
          key: 'AIzaSyAL8jwPOMbTWQoxeSlH01GZPUl7kQYj5YI',
        },
      });

      if (response.data.status === 'OK') {
        const location = response.data.results[0].geometry.location;
        return {
          latitude: location.lat,
          longitude: location.lng,
        };
      } else {
        console.error('Geocoding API error:', response.data.status);
        Alert.alert('Error', `Geocoding API error: ${response.data.status}`);
        return null;
      }
    } catch (error) {
      console.error('Geocoding API request failed:', error);
      Alert.alert('Error', 'Failed to get location coordinates.');
      return null;
    }
  };

  const handleShare = async () => {
    if (!rideDetails.destination || rideDetails.price <= 0 || rideDetails.numSpaces <= 0) {
      Alert.alert("Missing Information", "Please fill in all the details.");
      return;
    }

    const coordinates = await getCoordinates(rideDetails.destination);
    if (!coordinates) {
      Alert.alert("Error", "Failed to get location coordinates.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      const rideWithUser = {
        ...rideDetails,
        location: coordinates,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        dateListed: new Date(),
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
    <View style={styles.container}>
      <Avatar.Icon size={80} icon="car" style={styles.avatar} />
      <Text style={[styles.title, { color: colors.primary }]}>Share a Ride</Text>
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
        Select Date
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={rideDetails.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          onClose={() => setShowDatePicker(false)}
        />
      )}
      <Button mode="contained" onPress={handleShare} style={styles.button}>
        Share Ride
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
});

export default RideShareScreen;
