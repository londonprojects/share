// components/ModalContent.js
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';

const ModalContent = ({ marker, contactUser, closeModal }) => {
  if (!marker) return null;
  const { userName, userPhoto, description, type, destination, departureCity, arrivalCity } = marker;

  return (
    <ScrollView contentContainerStyle={styles.modalContent}>
      <Avatar.Image size={80} source={{ uri: userPhoto || 'https://via.placeholder.com/150' }} />
      <Text style={styles.modalTitle}>{userName}</Text>
      <Text>{description}</Text>
      {type === 'ride' && <Text>Destination: {destination}</Text>}
      {type === 'itinerary' && (
        <>
          <Text>Departure: {departureCity}</Text>
          <Text>Arrival: {arrivalCity}</Text>
        </>
      )}
      <Button mode="contained" onPress={() => contactUser(marker.userId)}>
        Contact
      </Button>
      <Button mode="outlined" onPress={closeModal}>
        Close
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default ModalContent;
