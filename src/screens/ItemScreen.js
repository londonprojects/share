import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Text, TextInput, useTheme, Provider as PaperProvider } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import CustomAppBar from '../components/CustomAppBar';
import CustomTabBar from '../components/TabsComponent';

const ItemScreen = ({ navigation }) => {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const [activeTab, setActiveTab] = useState(3); // Set to 3 for Item tab

  // Add this useEffect to fetch user profile photo
  React.useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserProfilePhoto(user.photoURL);
    }
  }, []);

  const handleShareItem = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You need to be logged in to share an item.');
      return;
    }

    if (!itemName || !itemDescription || !itemPrice) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const itemRef = await firestore.collection('items').add({
        name: itemName,
        description: itemDescription,
        price: itemPrice,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        dateListed: new Date(),
      });

      await firestore.collection('notifications').add({
        itemId: itemRef.id,
        itemName: itemName,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        type: 'item_shared',
        message: `${currentUser.displayName} has shared a new item: ${itemName}`,
        read: false,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Item shared successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error sharing item:', error);
      Alert.alert('Error', 'Failed to share item.');
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
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Share an Item</Text>
            <TextInput
              placeholder="Item Name"
              value={itemName}
              onChangeText={setItemName}
              style={styles.input}
            />
            <TextInput
              placeholder="Item Description"
              value={itemDescription}
              onChangeText={setItemDescription}
              style={styles.input}
              multiline
            />
            <TextInput
              placeholder="Item Price"
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleShareItem} style={styles.button}>
              Share Item
            </Button>
          </ScrollView>
        </View>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    marginTop: 16,
  },
});

export default ItemScreen;
