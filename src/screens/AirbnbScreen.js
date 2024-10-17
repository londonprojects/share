import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, Image, Alert, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Card, Searchbar, IconButton, Avatar, Badge, Button, Portal, Dialog, Paragraph, ActivityIndicator, Provider as PaperProvider } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import axios from 'axios';
import CustomAppBar from '../components/CustomAppBar'; // Import CustomAppBar
import CustomTabBar from '../components/TabsComponent'; // Renamed from TabsComponent to CustomTabBar for consistency

const UNSPLASH_ACCESS_KEY = '9tdu1sdQdRJV4zwTDqLsSxT9-yJbuud6msoTTMAu_Lg'; // Replace with your Unsplash Access Key
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1716671827397-8948fb218779?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Replace with your default image URL

function AirbnbScreen({ navigation }) {
  const [airbnbs, setAirbnbs] = useState([]);
  const [filteredAirbnbs, setFilteredAirbnbs] = useState([]);
  const [query, setQuery] = useState('');
  const [recentUsers, setRecentUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedAirbnb, setSelectedAirbnb] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editAirbnbDetails, setEditAirbnbDetails] = useState({ location: '', price: '', numRooms: '', date: new Date() });
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const [activeTab, setActiveTab] = useState(2); // Set to 2 for Airbnb tab

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserProfilePhoto(user.photoURL);
    }

    const unsubscribeAirbnbs = firestore.collection('airbnbs').onSnapshot(snapshot => {
      const airbnbList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAirbnbs(airbnbList);
      setFilteredAirbnbs(airbnbList);
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
      unsubscribeAirbnbs();
    };
  }, []);

  const fetchBackgroundImage = async (location) => {
    try {
      const response = await axios.get(`https://api.unsplash.com/photos/random`, {
        params: { query: location, client_id: UNSPLASH_ACCESS_KEY },
      });
      return response.data.urls.regular;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return DEFAULT_IMAGE;
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      const updatedAirbnbs = await Promise.all(
        airbnbs.map(async (airbnb) => {
          const imageUrl = await fetchBackgroundImage(airbnb.location);
          return { ...airbnb, imageUrl };
        })
      );

      const updatedAirbnbsWithUserDetails = await Promise.all(
        updatedAirbnbs.map(async (airbnb) => {
          try {
            const userDoc = await firestore.collection('users').doc(airbnb.userId).get();
            const userData = userDoc.data();
            return {
              ...airbnb,
              userPhoto: userData?.photoURL || DEFAULT_IMAGE,
              userName: userData?.displayName || 'Unknown',
            };
          } catch (error) {
            console.error('Error fetching user details:', error);
            return airbnb;
          }
        })
      );

      setFilteredAirbnbs(updatedAirbnbsWithUserDetails);
    };

    if (airbnbs.length > 0) {
      fetchImages();
    }
  }, [airbnbs]);

  const handleSearch = (query) => {
    setQuery(query);
    if (query) {
      setFilteredAirbnbs(airbnbs.filter(airbnb => airbnb.location.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFilteredAirbnbs(airbnbs);
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

  const handleMessage = (userId) => {
    navigation.navigate('MessageScreen', { userId });
  };

  const handleCardPress = (airbnb) => {
    setSelectedAirbnb(airbnb);
    setDialogVisible(true);
  };

  const handleEditCardPress = (airbnb) => {
    setEditAirbnbDetails(airbnb);
    setEditDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);
  const hideEditDialog = () => setEditDialogVisible(false);

  const handleEditChange = (field, value) => {
    setEditAirbnbDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await firestore.collection('airbnbs').doc(editAirbnbDetails.id).update(editAirbnbDetails);
      setEditDialogVisible(false);
      Alert.alert('Success', 'Airbnb details updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (airbnbId) => {
    try {
      await firestore.collection('airbnbs').doc(airbnbId).delete();
      Alert.alert('Success', 'Airbnb deleted successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSetActiveTab = useCallback((index) => {
    setActiveTab(index);
    switch(index) {
      case 0:
        navigation.navigate('Home');
        break;
      case 1:
        navigation.navigate('RidesScreen');
        break;
      case 2:
        navigation.navigate('AirbnbScreen');
        break;
      case 3:
        navigation.navigate('ItemShareScreen');
        break;
      case 4:
        navigation.navigate('ExperienceShareScreen');
        break;
    }
  }, [navigation]);

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
              placeholder="Search Airbnbs"
              onChangeText={handleSearch}
              value={query}
              style={styles.searchbar}
            />
            <FlatList
              data={filteredAirbnbs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.card} onPress={() => handleCardPress(item)}>
                  <Card.Cover source={{ uri: item.imageUrl || DEFAULT_IMAGE }} style={styles.cardImage} />
                  <Card.Content>
                    <View style={styles.rideHeader}>
                      <Image source={{ uri: item.userPhoto }} style={styles.userPhoto} />
                      <View>
                        <Text style={styles.cardTitle}>{item.location}</Text>
                        <Text style={styles.userName}>{item.userName}</Text>
                        <Text style={styles.cardDate}>{formatDate(item.dateListed)}</Text>
                      </View>
                      {messages[item.userId] && (
                        <Badge style={styles.badge}>{messages[item.userId].length}</Badge>
                      )}
                    </View>
                    <Text style={styles.rideDetails}>Price: ${item.price}</Text>
                    <Text style={styles.rideDetails}>Number of Rooms: {item.numRooms}</Text>
                    <Text style={styles.rideDate}>Date: {formatDate(item.date)}</Text>
                  </Card.Content>
                  <Card.Actions>
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
            <Dialog.Title>Airbnb Details</Dialog.Title>
            <Dialog.Content>
              {selectedAirbnb && (
                <>
                  <Paragraph>Location: {selectedAirbnb.location}</Paragraph>
                  <Paragraph>Price: ${selectedAirbnb.price}</Paragraph>
                  <Paragraph>Number of Rooms: {selectedAirbnb.numRooms}</Paragraph>
                  <Paragraph>Date: {formatDate(selectedAirbnb.date)}</Paragraph>
                </>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Close</Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog visible={editDialogVisible} onDismiss={hideEditDialog}>
            <Dialog.Title>Edit Airbnb Details</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Location"
                value={editAirbnbDetails.location}
                onChangeText={(text) => handleEditChange('location', text)}
                style={styles.input}
              />
              <TextInput
                label="Price"
                value={editAirbnbDetails.price}
                onChangeText={(text) => handleEditChange('price', text)}
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                label="Number of Rooms"
                value={editAirbnbDetails.numRooms}
                onChangeText={(text) => handleEditChange('numRooms', text)}
                style={styles.input}
                keyboardType="numeric"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideEditDialog}>Cancel</Button>
              <Button onPress={handleSaveEdit}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
        <CustomTabBar
          state={{
            index: activeTab,
            routes: [
              { key: 'home', name: 'Home' },
              { key: 'rides', name: 'Rides' },
              { key: 'airbnb', name: 'Airbnb' },
              { key: 'items', name: 'Items' },
              { key: 'experiences', name: 'Experiences' },
            ]
          }}
          navigation={navigation}
          activeTab={activeTab}
          setActiveTab={handleSetActiveTab}
        />
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
  profilePhoto: {
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
  input: {
    marginBottom: 10,
  },
});

export default AirbnbScreen;
