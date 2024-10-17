import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, RefreshControl } from 'react-native';
import { Provider as PaperProvider, Searchbar, FAB, Avatar, useTheme, Text } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import CustomAppBar from '../components/CustomAppBar';
import UserList from '../components/UserList';
import ListingCard from '../components/ListingCard';
import MapSection from '../components/MapSection';
import CustomTabBar from '../components/TabsComponent';
import theme from '../../theme';
import logger from '../services/logger';

const DEFAULT_IMAGE = 'https://plus.unsplash.com/premium_photo-1683800241997-a387bacbf06b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const NO_ITEMS_IMAGE = 'https://via.placeholder.com/300x200.png?text=No+Items+Shared';

const HomeScreen = ({ navigation }) => {
  console.log('HomeScreen rendered');

  const [latestListings, setLatestListings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const currentUser = auth.currentUser;
  const { colors } = useTheme();
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  const fetchListings = async () => {
    // Your logic to fetch listings from Firestore
    const fetchedListings = await firestore.collection('listings').get();
    setListings(fetchedListings.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    console.log('HomeScreen useEffect triggered');
    fetchUserProfile();
    fetchRecentUsers();
    fetchLatestListings();
  }, [currentUser]);

  const fetchUserProfile = async () => {
    console.log('Fetching user profile');
    try {
      if (currentUser) {
        setUserProfilePhoto(currentUser.photoURL);
        logger.info('User profile photo set:', currentUser.photoURL);
      }
    } catch (error) {
      logger.error('Error fetching user profile:', error);
    }
  };

  const fetchImageAndSetState = async (doc, query) => {
    const data = { id: doc.id, ...doc.data() };
    try {
      const imageUrl = await getRandomImage(query);
      data.imageUrl = imageUrl;
    } catch (error) {
      console.warn('Error setting image for listing:', error.message);
      data.imageUrl = DEFAULT_IMAGE;
    }
    return data;
  };

  const fetchRecentUsers = async () => {
    try {
      logger.debug('Fetching recent users from Firestore...');
      const usersSnapshot = await firestore.collection('users').orderBy('lastPosted', 'desc').limit(5).get();
      logger.debug('Fetched users snapshot:', usersSnapshot);
      const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      logger.info('Fetched recent users:', usersList);
      if (usersList.length > 0) {
        setRecentUsers(usersList);
      } else {
        logger.info('No recent users found.');
      }
    } catch (error) {
      logger.error('Error fetching recent users:', error);
    }
  };

  const fetchLatestListings = async (retryCount = 3) => {
    try {
      logger.debug('Fetching latest listings from Firestore...');
      const collections = ['rides', 'airbnbs', 'items', 'experiences'];
      const latestDocs = await Promise.all(
        collections.map(collection =>
          firestore.collection(collection).orderBy('dateListed', 'desc').limit(1).get()
        )
      );

      const listings = await Promise.all(
        latestDocs.flatMap(snapshot =>
          snapshot.docs.map(doc => fetchImageAndSetState(doc, doc.data().name))
        )
      );

      setLatestListings(listings);
      logger.info('Fetched latest listings:', listings);
    } catch (error) {
      logger.error('Error fetching latest listings:', error);
      if (retryCount > 0) {
        logger.info(`Retrying... (${retryCount} attempts left)`);
        setTimeout(() => fetchLatestListings(retryCount - 1), 1000);
      } else {
        logger.error('Failed to fetch latest listings after multiple attempts');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserProfile();
    await fetchRecentUsers();
    await fetchLatestListings();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setQuery(query);
    // Implement search logic here
  };

  const notifyOwner = (ownerId, listingId) => {
    Alert.alert("Notification Sent", "You have notified the owner of the listing.");
    // Implement actual notification logic
  };

  const handleNavigate = () => {
    if (city) {
      navigation.navigate('MatchingItineraries', { city });
    } else {
      alert('Please enter a city name');
    }
  };

  const renderAvatar = (user) => {
    logger.debug('renderAvatar called with:', user);
    if (user.userPhoto && user.userPhoto.startsWith('file://')) {
      logger.debug('Rendering local image:', user.photoURL);
      return <Image source={{ uri: user.photoURL }} style={styles.localAvatar} />;
    } else if (user.photoURL) {
      logger.debug('Rendering remote image:', user.photoURL);
      return <Avatar.Image size={80} source={{ uri: user.photoURL }} />;
    } else {
      logger.debug('Rendering default image');
      return <Avatar.Image size={80} source={{ uri: DEFAULT_IMAGE }} />;
    }
  };

  // const recentUsers = [
  //   { id: 'user1', photoURL: 'https://example.com/photo1.jpg', isHitchhiking: true, isOnline: false },
  //   { id: 'user2', photoURL: 'https://example.com/photo2.jpg', isHitchhiking: false, isOnline: true },
  //   // Add more users as needed
  // ];

  const getRandomImage = async (query) => {
    try {
      const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=9tdu1sdQdRJV4zwTDqLsSxT9-yJbuud6msoTTMAu_Lg`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.urls.regular;
    } catch (error) {
      console.warn('Error fetching image from Unsplash:', error.message);
      return DEFAULT_IMAGE; // Return a default image URL instead of null
    }
  };

  const renderImage = (imageUrl) => {
    if (imageUrl) {
      return <Image source={{ uri: imageUrl }} style={styles.image} />;
    } else {
      return <Text>No image available</Text>; // Fallback if no image URL
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
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <CustomAppBar navigation={navigation} userProfilePhoto={userProfilePhoto} />
        <Searchbar
          placeholder="Search"
          onChangeText={handleSearch}
          value={query}
          style={styles.searchbar}
        />
        <ScrollView 
          contentContainerStyle={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <UserList recentUsers={recentUsers} title="Recent Users" navigation={navigation} />
          <Text style={styles.subtitle}>Sharing around me</Text>
          <MapSection />
          <Text style={styles.subtitle}>Latest Listings</Text>
          {latestListings.length > 0 ? (
            latestListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                currentUser={currentUser}
                userProfilePhoto={userProfilePhoto}
                navigation={navigation}
                notifyOwner={notifyOwner}
                refreshListings={fetchListings}
              />
            ))
          ) : (
            <View style={styles.noItemsContainer}>
              <Image source={{ uri: NO_ITEMS_IMAGE }} style={styles.noItemsImage} />
              <Text style={styles.noItemsText}>No items shared yet.</Text>
            </View>
          )}
        </ScrollView>
        <FAB.Group
          open={fabOpen}
          icon={fabOpen ? 'close' : 'plus'}
          actions={[
            { icon: 'car', label: 'Share a Ride', onPress: () => navigation.navigate('RideShare') },
            { icon: 'home', label: 'Share an Airbnb', onPress: () => navigation.navigate('AirbnbShare') },
            { icon: 'gift', label: 'Share an Item', onPress: () => navigation.navigate('ItemShare') },
            { icon: 'run', label: 'Share an Experience', onPress: () => navigation.navigate('ExperienceShare') },
            { icon: 'airplane', label: 'Share Your Flight Itinerary', onPress: () => navigation.navigate('FlightItinerary') },
          ]}
          onStateChange={({ open }) => setFabOpen(open)}
          style={styles.fab}
        />
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
  },
  scrollView: {
    paddingBottom: 60, // Add some bottom padding to account for the TabsComponent
  },
  searchbar: {
    margin: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  recentUserContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  userName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
  localAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  noItemsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  noItemsImage: {
    width: 300,
    height: 200,
  },
  noItemsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 60, // Adjust this value to position FAB above the tabs
  },
});

export default HomeScreen;
