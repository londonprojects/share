import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { Text, Card, Searchbar, IconButton, Appbar, Avatar, Badge } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = '9tdu1sdQdRJV4zwTDqLsSxT9-yJbuud6msoTTMAu_Lg'; // Replace with your Unsplash Access Key
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1716671827397-8948fb218779?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Replace with your default image URL

function RidesScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [query, setQuery] = useState('');
  const [recentUsers, setRecentUsers] = useState([]);
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const unsubscribeRides = firestore.collection('rides').onSnapshot(snapshot => {
      const ridesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(ridesList);
      setFilteredRides(ridesList);
    });

    const fetchRecentUsers = async () => {
      const usersSnapshot = await firestore.collection('users').orderBy('lastPosted', 'desc').limit(5).get();
      const usersList = usersSnapshot.docs.map(doc => doc.data());
      setRecentUsers(usersList);
    };

    const fetchMessages = async () => {
      const messagesSnapshot = await firestore.collection('messages').where('receiverId', '==', auth.currentUser?.uid).get();
      const messagesList = messagesSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        if (!acc[data.senderId]) acc[data.senderId] = [];
        acc[data.senderId].push(data);
        return acc;
      }, {});
      setMessages(messagesList);
    };

    fetchRecentUsers();
    fetchMessages();

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
      return DEFAULT_IMAGE;
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

  const handleMessage = (userId) => {
    navigation.navigate('MessageScreen', { userId });
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Rides" />
      </Appbar.Header>
      <View style={styles.avatarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentUsers.map((user, index) => (
            <Avatar.Image key={index} size={50} source={{ uri: user.photoURL || DEFAULT_IMAGE }} style={styles.avatar} />
          ))}
        </ScrollView>
      </View>
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
            <Card.Cover source={{ uri: item.imageUrl || DEFAULT_IMAGE }} style={styles.cardImage} />
            <Card.Content>
              <View style={styles.rideHeader}>
                {item.userPhoto && <Image source={{ uri: item.userPhoto }} style={styles.userPhoto} />}
                {item.userId === auth.currentUser?.uid && auth.currentUser?.photoURL && (
                  <Image source={{ uri: auth.currentUser.photoURL }} style={styles.userPhoto} />
                )}
                <View>
                  <Text style={styles.cardTitle}>{item.destination}</Text>
                  <Text style={styles.userName}>{item.userName}</Text>
                  <Text style={styles.cardDate}>{formatDate(item.dateListed)}</Text>
                </View>
                {messages[item.userId] && (
                  <Badge style={styles.badge}>{messages[item.userId].length}</Badge>
                )}
              </View>
              <Text style={styles.rideDetails}>Price: ${item.price}</Text>
              <Text style={styles.rideDetails}>Number of Places: {item.numPlaces}</Text>
              {item.timeLimited && <Text style={styles.rideDetails}>Time Limited</Text>}
              <Text style={styles.rideDate}>Date: {formatDate(item.date)}</Text>
            </Card.Content>
            {item.userId !== auth.currentUser?.uid && (
              <Card.Actions>
                <IconButton icon="thumb-up" onPress={() => notifyOwner(item.userId, item.id)} />
                <IconButton icon="message" onPress={() => handleMessage(item.userId)} />
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
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatar: {
    marginHorizontal: 5,
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
  badge: {
    backgroundColor: 'red',
    color: 'white',
    fontSize: 12,
    position: 'absolute',
    top: -10,
    right: -10,
  },
});

export default RidesScreen;
