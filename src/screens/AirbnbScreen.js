import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, TextInput, useTheme, Checkbox } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Slider from '@react-native-community/slider';
import { firestore, auth } from '../services/firebase';

function AirbnbShareScreen({ navigation }) {
  const [airbnbDetails, setAirbnbDetails] = useState({
    location: '',
    date: new Date(),
    price: 50,
    numRooms: 1,
    amenities: {
      wifi: false,
      kitchen: false,
      parking: false,
      pool: false,
    },
    description: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { colors } = useTheme();

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || airbnbDetails.date;
    setShowDatePicker(false);
    setAirbnbDetails({ ...airbnbDetails, date: currentDate });
  };

  const handleShare = () => {
    const user = auth.currentUser;
    if (user) {
      const airbnbWithUser = {
        ...airbnbDetails,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        dateListed: new Date(),
      };

      firestore.collection('airbnbs').add(airbnbWithUser)
        .then(() => {
          Alert.alert("Success", "Airbnb shared successfully!");
          navigation.navigate('Schedule', { type: 'airbnb', details: airbnbWithUser });
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    } else {
      Alert.alert("Error", "User not logged in.");
    }
  };

  const toggleAmenity = (amenity) => {
    setAirbnbDetails((prevState) => ({
      ...prevState,
      amenities: {
        ...prevState.amenities,
        [amenity]: !prevState.amenities[amenity],
      },
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { color: colors.primary }]}>Share an Airbnb</Text>
      <TextInput
        label="Location"
        value={airbnbDetails.location}
        onChangeText={(text) => setAirbnbDetails({ ...airbnbDetails, location: text })}
        style={styles.input}
      />
      <Text style={styles.label}>Price: ${airbnbDetails.price}</Text>
      <Slider
        value={airbnbDetails.price}
        onValueChange={(value) => setAirbnbDetails({ ...airbnbDetails, price: value })}
        minimumValue={0}
        maximumValue={1000}
        step={1}
        style={styles.slider}
      />
      <Text style={styles.label}>Number of Rooms: {airbnbDetails.numRooms}</Text>
      <Slider
        value={airbnbDetails.numRooms}
        onValueChange={(value) => setAirbnbDetails({ ...airbnbDetails, numRooms: value })}
        minimumValue={1}
        maximumValue={10}
        step={1}
        style={styles.slider}
      />
      <Text style={styles.label}>Amenities:</Text>
      <View style={styles.checkboxContainer}>
        <Checkbox.Item
          label="WiFi"
          status={airbnbDetails.amenities.wifi ? 'checked' : 'unchecked'}
          onPress={() => toggleAmenity('wifi')}
        />
        <Checkbox.Item
          label="Kitchen"
          status={airbnbDetails.amenities.kitchen ? 'checked' : 'unchecked'}
          onPress={() => toggleAmenity('kitchen')}
        />
        <Checkbox.Item
          label="Parking"
          status={airbnbDetails.amenities.parking ? 'checked' : 'unchecked'}
          onPress={() => toggleAmenity('parking')}
        />
        <Checkbox.Item
          label="Pool"
          status={airbnbDetails.amenities.pool ? 'checked' : 'unchecked'}
          onPress={() => toggleAmenity('pool')}
        />
      </View>
      <TextInput
        label="Description"
        value={airbnbDetails.description}
        onChangeText={(text) => setAirbnbDetails({ ...airbnbDetails, description: text })}
        style={styles.input}
        multiline
        numberOfLines={4}
      />
      <Button mode="contained" onPress={() => setShowDatePicker(true)} style={styles.button}>
        Select Date
      </Button>
      {showDatePicker && (
        <DateTimePicker
          value={airbnbDetails.date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Button mode="contained" onPress={handleShare} style={styles.button}>
        Share Airbnb
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('AirbnbsScreen')} style={styles.button}>
        View Airbnb Listings
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
    textAlign: 'left',
    marginBottom: 8,
  },
  slider: {
    width: '80%',
    marginBottom: 16,
  },
  checkboxContainer: {
    width: '80%',
    marginBottom: 16,
  },
  button: {
    width: '80%',
    marginBottom: 16,
  },
});

export default AirbnbShareScreen;
