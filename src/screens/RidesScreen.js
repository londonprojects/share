import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { Text, Card, Searchbar, IconButton, Appbar } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = '9tdu1sdQdRJV4zwTDqLsSxT9-yJbuud6msoTTMAu_Lg'; // Replace with your Unsplash Access Key

function RidesScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const unsubscribeRides = firestore.collection('rides').onSnapshot(snapshot => {
      const ridesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(ridesList);
      setFilteredRides(ridesList);
    });

    return () => {
      unsubscribeRides();
    };
  }, []);

  const fetchBackgroundImage = async (city) => {
    try {
      const response = await axios.get(`https://api.unsplash.com/photos/random`, {
        params: { query: city, client_id: UNSPLASH_ACCESS_KEY },
      });
      return response.data.urls.regular;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      const updatedRides = await Promise.all(
        rides.map(async (ride) => {
          const imageUrl = await fetchBackgroundImage(ride.destination);
          return { ...ride, imageUrl };
        })
      );
      setFilteredRides(updatedRides);
    };

    if (rides.length > 0) {
      fetchImages();
    }
  }, [rides]);

  const handleSearch = (query) => {
    setQuery(query);
    if (query) {
      setFilteredRides(rides.filter(ride => ride.destination.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFilteredRides(rides);
    }
  };

  const notifyOwner = (ownerId, listingId) => {
    Alert.alert("Notification Sent", "You have notified the owner of the listing.");
    // Implement actual notification logic
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toDateString();
    }
    return 'Unknown date';
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Rides" />
      </Appbar.Header>
      <Searchbar
        placeholder="Search"
        onChangeText={handleSearch}
        value={query}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredRides}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            {item.imageUrl && <Card.Cover source={{ uri: item.imageUrl }} style={styles.cardImage} />}
            <Card.Content>
              <View style={styles.rideHeader}>
                {item.userPhoto && <Image source={{ uri: item.userPhoto }} style={styles.userPhoto} />}
                <View>
                  <Text style={styles.cardTitle}>{item.destination}</Text>
                  <Text style={styles.userName}>{item.userName}</Text>
                  <Text style={styles.cardDate}>{formatDate(item.dateListed)}</Text>
                </View>
              </View>
              <Text style={styles.rideDetails}>Price: ${item.price}</Text>
              <Text style={styles.rideDetails}>Number of Places: {item.numPlaces}</Text>
              {item.timeLimited && <Text style={styles.rideDetails}>Time Limited</Text>}
              <Text style={styles.rideDate}>Date: {formatDate(item.date)}</Text>
            </Card.Content>
            {item.userId !== auth.currentUser?.uid && (
              <Card.Actions>
                <IconButton icon="thumb-up" onPress={() => notifyOwner(item.userId, item.id)} />
              </Card.Actions>
            )}
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchbar: {
    margin: 16,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  cardImage: {
    height: 200,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    color: '#757575',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    fontSize: 14,
    color: '#757575',
  },
  rideDetails: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
  rideDate: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
  },
});

export default RidesScreen;
