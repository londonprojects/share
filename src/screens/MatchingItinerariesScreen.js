import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const MatchingItinerariesScreen = ({ route, navigation }) => {
  const { airport } = route.params;
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore.collection('flightItineraries')
      .where('arrivalAirport', '==', airport) // Ensure this matches the field name in your documents
      .onSnapshot(snapshot => {
        const itinerariesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItineraries(itinerariesList);
      });

    return () => unsubscribe();
  }, [airport]);

  const contactUser = (userId) => {
    navigation.navigate('MessageScreen', { userId });
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toDateString();
    }
    return 'Unknown date';
  };

  const formatTime = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString();
    }
    return 'Unknown time';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>People arriving at {airport}</Text>
      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.userName}
              subtitle={item.userBio}
              left={(props) => item.userPhoto ? <Avatar.Image {...props} source={{ uri: item.userPhoto }} /> : <Avatar.Icon {...props} icon="account" />}
            />
            <Card.Content>
              <Text style={styles.detailText}>Flight: {item.flightNumber}</Text>
              <Text style={styles.detailText}>Departure City: {item.departureCity}</Text>
              <Text style={styles.detailText}>Arrival Time: {formatTime(item.arrivalTime)}</Text>
              <Text style={styles.detailText}>Date: {formatDate(item.date)}</Text>
              <Text style={styles.detailText}>Duration: {item.duration}</Text>
            </Card.Content>
            <Card.Actions>
              {item.userId !== auth.currentUser?.uid ? (
                <Button onPress={() => contactUser(item.userId)}>Contact</Button>
              ) : (
                <Button disabled>Your Itinerary</Button>
              )}
            </Card.Actions>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
});

export default MatchingItinerariesScreen;
