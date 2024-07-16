import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image, Alert, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Text, Card, Searchbar, IconButton, Avatar, Badge, Button, Portal, Dialog, Paragraph, ActivityIndicator, Provider as PaperProvider } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import axios from 'axios';
import CustomAppBar from '../components/CustomAppBar'; // Import CustomAppBar
import TabsComponent from '../components/TabsComponent'; // Import TabsComponent

const UNSPLASH_ACCESS_KEY = '9tdu1sdQdRJV4zwTDqLsSxT9-yJbuud6msoTTMAu_Lg'; // Replace with your Unsplash Access Key
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1716671827397-8948fb218779?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Replace with your default image URL

function ItemShareScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [query, setQuery] = useState('');
  const [recentUsers, setRecentUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editItemDetails, setEditItemDetails] = useState({ name: '', price: '', description: '' });
  const [userProfilePhoto, setUserProfilePhoto] = useState(null); // Add state for user profile photo

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserProfilePhoto(user.photoURL); // Set the user's profile photo URL
    }

    const unsubscribeItems = firestore.collection('items').onSnapshot(snapshot => {
      const itemsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsList);
      setFilteredItems(itemsList);
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
      unsubscribeItems();
    };
  }, []);

  const fetchBackgroundImage = async (itemName) => {
    try {
      const response = await axios.get(`https://api.unsplash.com/photos/random`, {
        params: { query: itemName, client_id: UNSPLASH_ACCESS_KEY },
      });
      return response.data.urls.regular;
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return DEFAULT_IMAGE;
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          const imageUrl = await fetchBackgroundImage(item.name);
          return { ...item, imageUrl };
        })
      );

      const updatedItemsWithUserDetails = await Promise.all(
        updatedItems.map(async (item) => {
          try {
            const userDoc = await firestore.collection('users').doc(item.userId).get();
            const userData = userDoc.data();
            return {
              ...item,
              userPhoto: userData?.photoURL || DEFAULT_IMAGE,
              userName: userData?.displayName || 'Unknown',
            };
          } catch (error) {
            console.error('Error fetching user details:', error);
            return item;
          }
        })
      );

      setFilteredItems(updatedItemsWithUserDetails);
    };

    if (items.length > 0) {
      fetchImages();
    }
  }, [items]);

  const handleSearch = (query) => {
    setQuery(query);
    if (query) {
      setFilteredItems(items.filter(item => item.name.toLowerCase().includes(query.toLowerCase())));
    } else {
      setFilteredItems(items);
    }
  };

  const notifyOwner = (ownerId, listingId) => {
    Alert.alert("Notification Sent", "You have notified the owner of the listing.");
  };

  const handleMessage = (userId) => {
    navigation.navigate('MessageScreen', { userId });
  };

  const handleCardPress = (item) => {
    setSelectedItem(item);
    setDialogVisible(true);
  };

  const handleEditCardPress = (item) => {
    setEditItemDetails(item);
    setEditDialogVisible(true);
  };

  const hideDialog = () => setDialogVisible(false);
  const hideEditDialog = () => setEditDialogVisible(false);

  const handleEditChange = (field, value) => {
    setEditItemDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  const handleSaveEdit = async () => {
    try {
      await firestore.collection('items').doc(editItemDetails.id).update(editItemDetails);
      setEditDialogVisible(false);
      Alert.alert('Success', 'Item details updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      await firestore.collection('items').doc(itemId).delete();
      Alert.alert('Success', 'Item deleted successfully!');
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
              placeholder="Search Items"
              onChangeText={handleSearch}
              value={query}
              style={styles.searchbar}
            />
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.card} onPress={() => handleCardPress(item)}>
                  <Card.Cover source={{ uri: item.imageUrl || DEFAULT_IMAGE }} style={styles.cardImage} />
                  <Card.Content>
                    <View style={styles.itemHeader}>
                      <Image source={{ uri: item.userPhoto }} style={styles.userPhoto} />
                      <View>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.userName}>{item.userName}</Text>
                        <Text style={styles.cardDate}>{new Date(item.dateListed.seconds * 1000).toDateString()}</Text>
                      </View>
                      {messages[item.userId] && (
                        <Badge style={styles.badge}>{messages[item.userId].length}</Badge>
                      )}
                    </View>
                    <Text style={styles.itemDetails}>Price: ${item.price}</Text>
                    <Text style={styles.itemDetails}>Description: {item.description}</Text>
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
            <Dialog.Title>Item Details</Dialog.Title>
            <Dialog.Content>
              {selectedItem && (
                <>
                  <Paragraph>Name: {selectedItem.name}</Paragraph>
                  <Paragraph>Price: ${selectedItem.price}</Paragraph>
                  <Paragraph>Description: {selectedItem.description}</Paragraph>
                  <Paragraph>Date Listed: {new Date(selectedItem.dateListed.seconds * 1000).toDateString()}</Paragraph>
                </>
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Close</Button>
            </Dialog.Actions>
          </Dialog>
          <Dialog visible={editDialogVisible} onDismiss={hideEditDialog}>
            <Dialog.Title>Edit Item Details</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Name"
                value={editItemDetails.name}
                onChangeText={(text) => handleEditChange('name', text)}
                style={styles.input}
              />
              <TextInput
                label="Price"
                value={editItemDetails.price}
                onChangeText={(text) => handleEditChange('price', text)}
                style={styles.input}
                keyboardType="numeric"
              />
              <TextInput
                label="Description"
                value={editItemDetails.description}
                onChangeText={(text) => handleEditChange('description', text)}
                style={styles.input}
              />
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
  itemHeader: {
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
  itemDetails: {
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

export default ItemShareScreen;
