// HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput, Button as RNButton, Image } from 'react-native';
import { Provider as PaperProvider, Searchbar, FAB, Button, Avatar, useTheme, Text } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import { getRandomImage } from '../services/unsplash';
import CustomAppBar from '../components/CustomAppBar';
import UserList from '../components/UserList';
import ListingCard from '../components/ListingCard';
import MapSection from '../components/MapSection';
import TabsComponent from '../components/TabsComponent';
import MatchingItinerariesComponent from '../components/MatchingItinerariesComponent';
import { addDummyData } from '../services/dummyData';
import theme from '../../theme';

const DEFAULT_IMAGE = 'https://plus.unsplash.com/premium_photo-1683800241997-a387bacbf06b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const HomeScreen = ({ navigation }) => {
  const [latestListings, setLatestListings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [visible, setVisible] = useState(false);
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const [fabOpen, setFabOpen] = useState(false); // Ensure this state is defined
  const currentUser = auth.currentUser;
  const { colors } = useTheme();
  const [dataAdded, setDataAdded] = useState(false); // Ensure data is added only once

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        setUserProfilePhoto(currentUser.photoURL);
      }
    };

    const fetchImageAndSetState = async (doc, query) => {
      const data = { id: doc.id, ...doc.data() };
      try {
        const imageUrl = await getRandomImage(query);
        data.imageUrl = imageUrl || DEFAULT_IMAGE;
      } catch (error) {
        console.error('Error fetching image from Unsplash:', error);
        data.imageUrl = DEFAULT_IMAGE;
      }
      return data;
    };

    const fetchRecentUsers = async () => {
      try {
        const usersSnapshot = await firestore.collection('users').orderBy('lastPosted', 'desc').limit(5).get();
        const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched recent users:', usersList); // Debugging line
        if (usersList.length > 0) {
          setRecentUsers(usersList);
        } else {
          console.log('No recent users found.');
        }
      } catch (error) {
        console.error('Error fetching recent users:', error);
      }
    };

    const fetchLatestListings = async () => {
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
    };

    const addDataIfNeeded = async () => {
      const usersSnapshot = await firestore.collection('users').get();
      if (usersSnapshot.empty) {
        await addDummyData();
        setDataAdded(true);
      }
    };

    fetchUserProfile();
    fetchRecentUsers();
    fetchLatestListings();
    if (!dataAdded) {
      addDataIfNeeded();
    }
  }, [currentUser, dataAdded]);

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
    if (user.photoURL && user.photoURL.startsWith('file://')) {
      return <Image source={{ uri: user.photoURL }} style={styles.localAvatar} />;
    } else {
      return <Avatar.Image size={80} source={{ uri: user.photoURL || DEFAULT_IMAGE }} />;
    }
  };

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
        <ScrollView contentContainerStyle={styles.scrollView}>
          <UserList recentUsers={recentUsers} title="Nearby Travelers" />
          {recentUsers.map(user => (
            <View key={user.id} style={styles.recentUserContainer}>
              {renderAvatar(user)}
              <Text style={styles.userName}>{user.displayName}</Text>
            </View>
          ))}
          <Text style={styles.subtitle}>Sharing around me</Text>
          <MapSection />
          <MatchingItinerariesComponent navigation={navigation} />
          <Text style={styles.subtitle}>Latest Listings</Text>
          {latestListings.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              currentUser={currentUser}
              userProfilePhoto={userProfilePhoto}
              navigation={navigation}
              notifyOwner={notifyOwner}
            />
          ))}
        </ScrollView>
        <TabsComponent navigation={navigation} />
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
    paddingVertical: 20,
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
  inputContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '90%',
    marginVertical: 8,
  },
  button: {
    width: '90%',
    marginVertical: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    left: '50%',
    bottom: 0,
    transform: [{ translateX: -120 }], // Adjust based on the FAB size
  },
  menu: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 2,
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
});

export default HomeScreen;
