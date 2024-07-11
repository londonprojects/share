import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, Button, Avatar } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const MatchingItinerariesScreen = ({ route, navigation }) => {
  const { city } = route.params;
  const [itineraries, setItineraries] = useState([]);

  useEffect(() => {
    const unsubscribe = firestore.collection('flightItineraries')
      .where('city', '==', city)
      .onSnapshot(snapshot => {
        const itinerariesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setItineraries(itinerariesList);
      });

    return () => unsubscribe();
  }, [city]);

  const contactUser = (userId) => {
    // Implement the logic to contact the user via messenger or chat
    Alert.alert("Contact", "Feature to contact the user is under development.");
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toDateString();
    }
    return 'Unknown date';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>People arriving in {city}</Text>
      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title
              title={item.userName}
              left={(props) => item.userPhoto ? <Avatar.Image {...props} source={{ uri: item.userPhoto }} /> : <Avatar.Icon {...props} icon="account" />}
            />
            <Card.Content>
              <Text>Flight: {item.flightNumber}</Text>
              <Text>Arrival Time: {item.arrivalTime}</Text>
              <Text>Date: {formatDate(item.date)}</Text>
            </Card.Content>
            <Card.Actions>
              {item.userId !== auth.currentUser?.uid && (
                <Button onPress={() => contactUser(item.userId)}>Contact</Button>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
});

export default MatchingItinerariesScreen;
