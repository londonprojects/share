import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { firestore, auth } from '../services/firebase'; // Adjust the path as needed

const HitchhikeRequestScreen = ({ navigation }) => {
  const [requestDetails, setRequestDetails] = useState({ destination: '', currentLocation: '' });
  const { colors } = useTheme();

  const handleRequest = () => {
    if (!requestDetails.destination || !requestDetails.currentLocation) {
      Alert.alert("Missing Information", "Please enter all details.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      const requestWithUser = {
        ...requestDetails,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        dateRequested: new Date(),
      };

      firestore.collection('hitchhiking_requests').add(requestWithUser)
        .then(() => {
          Alert.alert("Success", "Hitchhike request sent successfully!");
          navigation.navigate('Home'); // Navigate to Home or another screen after adding the request
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
      <Text style={[styles.title, { color: colors.primary }]}>Request a Hitchhike</Text>
      <TextInput
        label="Current Location"
        value={requestDetails.currentLocation}
        onChangeText={(text) => setRequestDetails({ ...requestDetails, currentLocation: text })}
        style={styles.input}
        mode="outlined"
      />
      <TextInput
        label="Destination"
        value={requestDetails.destination}
        onChangeText={(text) => setRequestDetails({ ...requestDetails, destination: text })}
        style={styles.input}
        mode="outlined"
      />
      <Button mode="contained" onPress={handleRequest} style={styles.button}>
        Send Request
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

export default HitchhikeRequestScreen;
