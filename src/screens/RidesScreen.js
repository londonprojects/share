import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Image, Alert, ScrollView, TextInput } from 'react-native';
import { Text, Card, Searchbar, IconButton, Avatar, Badge, Button, Portal, Dialog, Paragraph, ActivityIndicator, Provider as PaperProvider, Switch } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import axios from 'axios';
import CustomAppBar from '../components/CustomAppBar';
import TabsComponent from '../components/TabsComponent';

const UNSPLASH_ACCESS_KEY = '9tdu1sdQdRJV4zwTDqLsSxT9-yJbuud6msoTTMAu_Lg';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1716671827397-8948fb218779?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

function RidesScreen({ navigation }) {
  const [rides, setRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [query, setQuery] = useState('');
  const [recentUsers, setRecentUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editRideDetails, setEditRideDetails] = useState({
    destination: '', price: '', numPlaces: '', startDate: null, endDate: null, isTaxi: false, description: '', from: '', to: ''
  });
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserProfilePhoto(user.photoURL);
    }

    const unsubscribeRides = firestore.collection('rides').onSnapshot(snapshot => {
      const ridesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(ridesList);
      setFilteredRides(ridesList);
      setLoading(false);
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

      const updatedRidesWithUserDetails = await Promise.all(
        updatedRides.map(async (ride) => {
          try {
            const userDoc = await firestore.collection('users').doc(ride.userId).get();
            const userData = userDoc.data();
            return {
              ...ride,
              userPhoto: userData?.photoURL || DEFAULT_IMAGE,
              userName: userData?.displayName || 'Unknown',
            };
          } catch (error) {
            console.error('Error fetching user details:', error);
            return ride;
          }
        })
      );

      setFilteredRides(updatedRidesWithUserDetails);
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
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toDateString();
    }
    return 'Unknown date';
  };

  const formatRangeDate = (startDate, endDate) => {
    if (startDate && endDate) {
      return `${new Date(startDate.seconds * 1000).toDateString()} - ${new Date(endDate.seconds * 1000).toDateString()}`;
    }
    return 'Unknown date range';
  };

  const handleMessage = (userId) => {
    navigation.navigate('MessageScreen', { userId });
  };

  const handleCardPress = (ride) => {
    setSelectedRide(ride);
    setDialogVisible(true);
  };

  const handleEditCardPress = (ride) => {
    setEditRideDetails(ride);
    setEditDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);
  const hideEditDialog = () => setEditDialogVisible(false);

  const handleEditChange = (field, value) => {
    setEditRideDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await firestore.collection('rides').doc(editRideDetails.id).update(editRideDetails);
      setEditDialogVisible(false);
      Alert.alert('Success', 'Ride details updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (rideId) => {
    try {
      await firestore.collection('rides').doc(rideId).delete();
      Alert.alert('Success', 'Ride deleted successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <CustomAppBar navigation={navigation} userProfilePhoto={userProfilePhoto} />
        {loading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <>
            <View style={styles.avatarContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {recentUsers.map((user, index) => (
                  <Avatar.Image key={index} size={50} source={{ uri: user.photoURL || DEFAULT_IMAGE }} style={styles.avatar} />
                ))}
              </ScrollView>
            </View>
            <Searchbar
              placeholder="Search Rides"
              onChangeText={handleSearch}
              value={query}
              style={styles.searchbar}
            />
            <FlatList
              data={filteredRides}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.card} onPress={() => handleCardPress(item)}>
                  <Card.Cover source={{ uri: item.imageUrl || DEFAULT_IMAGE }} style={styles.cardImage} />
                  <Card.Content>
                    <View style={styles.rideHeader}>
                      <Image source={{ uri: item.userPhoto }} style={styles.userPhoto} />
                      <View>
                        <Text style={styles.cardTitle}>
                          {item.destination}
                        </Text>
                        <Text style={styles.userName}>{item.userName}</Text>
                        <Text style={styles.cardDate}>{formatRangeDate(item.startDate, item.endDate)}</Text>
                      </View>
                      {messages[item.userId] && (
                        <Badge style={styles.badge}>{messages[item.userId].length}</Badge>
                      )}
                    </View>
                    <Text style={styles.rideDetails}>From: {item.from}</Text>
                    <Text style={styles.rideDetails}>To: {item.to}</Text>
                    <Text style={styles.rideDetails}>Price: ${item.price}</Text>
                    <Text style={styles.rideDetails}>Number of Places: {item.numPlaces}</Text>
                    {item.timeLimited && <Text style={styles.rideDetails}>Time Limited</Text>}
                    <Text style={styles.rideDetails}>Description: {item.description}</Text>
                  </Card.Content>
                  <Card.Actions>
                  {item.isTaxi && <IconButton icon="taxi" size={20} style={styles.taxiIcon} />}
                    <IconButton icon="thumb-up" onPress={() => notifyOwner(item.userId, item.id)} />
                    <IconButton icon="message" onPress={() => handleMessage(item.userId)} />
                    {item.userId === auth.currentUser?.uid && (
                      <>
                        <IconButton icon="pencil" onPress={() => handleEditCardPress(item)} />
                        <IconButton icon="delete" onPress={() => handleDelete(item.id)} />
                      </>
                    )}
                  </Card.Actions>
                </Card>
              )}
            />
          </>
        )}
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>Ride Details</Dialog.Title>
            <Dialog.Content>
              {selectedRide && (
                <>
                  <Paragraph>Destination: {selectedRide.destination}</Paragraph>
                  <Paragraph>From: {selectedRide.from}</Paragraph>
                  <Paragraph>To: {selectedRide.to}</Paragraph>
                  <Paragraph>Price: ${selectedRide.price}</Paragraph>
                  <Paragraph>Number of Places: {selectedRide.numPlaces}</Paragraph>
                  <Paragraph>Date: {formatRangeDate(selectedRide.startDate, selectedRide.endDate)}</Paragraph>
                  <Paragraph>Time Limited: {selectedRide.timeLimited ? 'Yes' : 'No'}</Paragraph>
                  <Paragraph>Description: {selectedRide.description}</Paragraph>
                </>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Close</Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog visible={editDialogVisible} onDismiss={hideEditDialog}>
            <Dialog.Title>Edit Ride Details</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Destination"
                value={editRideDetails.destination}
                onChangeText={(text) => handleEditChange('destination', text)}
                style={styles.input}
              />
              <TextInput
                label="From"
                value={editRideDetails.from}
                onChangeText={(text) => handleEditChange('from', text)}
                style={styles.input}
              />
              <TextInput
                label="To"
                value={editRideDetails.to}
                onChangeText={(text) => handleEditChange('to', text)}
                style={styles.input}
              />
              <TextInput
                label="Price"
                value={editRideDetails.price}
                onChangeText={(text) => handleEditChange('price', text)}
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                label="Number of Places"
                value={editRideDetails.numPlaces}
                onChangeText={(text) => handleEditChange('numPlaces', text)}
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                label="Start Date"
                value={editRideDetails.startDate ? new Date(editRideDetails.startDate.seconds * 1000).toDateString() : ''}
                onChangeText={(text) => handleEditChange('startDate', new Date(text))}
                style={styles.input}
              />
              <TextInput
                label="End Date"
                value={editRideDetails.endDate ? new Date(editRideDetails.endDate.seconds * 1000).toDateString() : ''}
                onChangeText={(text) => handleEditChange('endDate', new Date(text))}
                style={styles.input}
              />
              <TextInput
                label="Description"
                value={editRideDetails.description}
                onChangeText={(text) => handleEditChange('description', text)}
                style={styles.input}
              />
              <View style={styles.switchContainer}>
                <Text>Is Taxi: </Text>
                <Switch
                  value={editRideDetails.isTaxi}
                  onValueChange={(value) => handleEditChange('isTaxi', value)}
                />
              </View>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideEditDialog}>Cancel</Button>
              <Button onPress={handleSaveEdit}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <TabsComponent navigation={navigation} />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    margin: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 5,
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
  badge: {
    backgroundColor: 'red',
    color: 'white',
    fontSize: 12,
    position: 'absolute',
    top: -10,
    right: -10,
  },
  input: {
    marginBottom: 10,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  taxiIcon: {
    marginLeft: 5,
  },
});

export default RidesScreen;
