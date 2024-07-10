import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text, TextInput, useTheme, Checkbox } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firestore, auth } from '../services/firebase';

function AirbnbShareScreen({ navigation }) {
  const [airbnbDetails, setAirbnbDetails] = useState({
    location: '',
    date: new Date(),
    price: '',
    numRooms: '',
    amenities: '',
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
          navigation.navigate('Schedule', { type: 'airbnb', details: airbnbWithUser });
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
      <Text variant="titleLarge" style={styles.title}>Share an Airbnb</Text>
      <TextInput
        label="Location"
        value={airbnbDetails.location}
        onChangeText={(text) => setAirbnbDetails({ ...airbnbDetails, location: text })}
        style={styles.input}
      />
      <TextInput
        label="Price"
        value={airbnbDetails.price}
        onChangeText={(text) => setAirbnbDetails({ ...airbnbDetails, price: text })}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Number of Rooms"
        value={airbnbDetails.numRooms}
        onChangeText={(text) => setAirbnbDetails({ ...airbnbDetails, numRooms: text })}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="Amenities"
        value={airbnbDetails.amenities}
        onChangeText={(text) => setAirbnbDetails({ ...airbnbDetails, amenities: text })}
        style={styles.input}
      />
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
    </View>
  );
}

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

export default AirbnbShareScreen;
