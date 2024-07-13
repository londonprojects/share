// HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TextInput, Button as RNButton, Text } from 'react-native';
import { Provider as PaperProvider, Searchbar, FAB, Button } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import { cities } from '../services/cities';
import { getRandomImage } from '../services/unsplash';
import CustomAppBar from '../components/CustomAppBar';
import UserList from '../components/UserList';
import ListingCard from '../components/ListingCard';
import MapSection from '../components/MapSection';
import { DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00bcd4',
    accent: '#00bcd4',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#212121',
    disabled: '#bdbdbd',
    placeholder: '#757575',
    backdrop: '#000000',
    notification: '#ff80ab',
    error: '#d32f2f',
    onPrimary: '#ffffff',
    onSurface: '#212121',
    onBackground: '#212121',
    onError: '#ffffff',
  },
};

const HomeScreen = ({ navigation }) => {
  const [latestListings, setLatestListings] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [visible, setVisible] = useState(false);
  const [city, setCity] = useState('');
  const [fabOpen, setFabOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [userProfilePhoto, setUserProfilePhoto] = useState(null);
  const currentUser = auth.currentUser; // Fetch current user once here

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (currentUser) {
        setUserProfilePhoto(currentUser.photoURL);
      }
    };

    const fetchImageAndSetState = async (doc, query) => {
      const data = { id: doc.id, ...doc.data() };
      data.imageUrl = await getRandomImage(query) || DEFAULT_IMAGE;
      return data;
    };

    const fetchRecentUsers = async () => {
      const usersSnapshot = await firestore.collection('users').orderBy('lastPosted', 'desc').limit(5).get();
      const usersList = usersSnapshot.docs.map(doc => doc.data());
      if (usersList.length > 0) {
        setRecentUsers(usersList);
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

    fetchUserProfile();
    fetchRecentUsers();
    fetchLatestListings();
  }, [currentUser]);

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
          <Text style={styles.subtitle}>Sharing around me</Text>
          <MapSection />
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Enter City"
              value={city}
              onChangeText={setCity}
              style={styles.input}
            />
            <RNButton title="Select City" onPress={() => setVisible(true)} />
            {visible && (
              <View style={styles.menu}>
                {cities.map((city) => (
                  <RNButton key={city.value} title={city.label} onPress={() => { setCity(city.value); setVisible(false); }} />
                ))}
              </View>
            )}
            <Button mode="contained" onPress={handleNavigate} style={styles.button}>
              View Matching Itineraries
            </Button>
          </View>

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
    right: 0,
    bottom: 0,
  },
  menu: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    elevation: 2,
  },
});

export default HomeScreen;
