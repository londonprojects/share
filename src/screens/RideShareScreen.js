import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, Avatar } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from '../services/firebase'; // Adjust the path as needed

const RideShareScreen = ({ navigation }) => {
  const [rideDetails, setRideDetails] = useState({ destination: '', date: new Date(), price: '', numSpaces: '', timeLimited: false });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || rideDetails.date;
    setShowDatePicker(Platform.OS === 'ios');
    setRideDetails({ ...rideDetails, date: currentDate });
  };

  const handleShare = () => {
    if (!rideDetails.destination || !rideDetails.price || !rideDetails.numSpaces) {
      Alert.alert("Missing Information", "Please fill in all the details.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      const rideWithUser = {
        ...rideDetails,
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
      <TextInput
        label="Price"
        value={rideDetails.price}
        onChangeText={(text) => setRideDetails({ ...rideDetails, price: text })}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
      />
      <TextInput
        label="Number of Spaces"
        value={rideDetails.numSpaces}
        onChangeText={(text) => setRideDetails({ ...rideDetails, numSpaces: text })}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
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
  button: {
    width: '80%',
    marginBottom: 16,
  },
});

export default RideShareScreen;
