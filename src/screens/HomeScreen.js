import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TextInput } from 'react-native';
import { Text, Card, Button, Appbar, IconButton, Provider as PaperProvider, Menu, List, FAB, Portal } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';
import { cities } from '../services/cities'; // Adjust the path as needed
import { getRandomImage } from '../services/unsplash'; // Import the unsplash service
import { DefaultTheme } from 'react-native-paper';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00bcd4',
    accent: '#00bcd4',
  },
};

const HomeScreen = ({ navigation }) => {
  const [latestRide, setLatestRide] = useState(null);
  const [latestAirbnb, setLatestAirbnb] = useState(null);
  const [latestItem, setLatestItem] = useState(null);
  const [latestExperience, setLatestExperience] = useState(null);
  const [visible, setVisible] = useState(false);
  const [city, setCity] = useState('');
  const [fabOpen, setFabOpen] = useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  useEffect(() => {
    const fetchImageAndSetState = async (doc, setState, query) => {
      const data = { id: doc.id, ...doc.data() };
      data.imageUrl = await getRandomImage(query);
      setState(data);
    };

    const unsubscribeRides = firestore.collection('rides').orderBy('dateListed', 'desc').limit(1).onSnapshot(snapshot => {
      const ride = snapshot.docs[0];
      if (ride) fetchImageAndSetState(ride, setLatestRide, ride.data().destination);
    });

    const unsubscribeAirbnbs = firestore.collection('airbnbs').orderBy('dateListed', 'desc').limit(1).onSnapshot(snapshot => {
      const airbnb = snapshot.docs[0];
      if (airbnb) fetchImageAndSetState(airbnb, setLatestAirbnb, airbnb.data().location);
    });

    const unsubscribeItems = firestore.collection('items').orderBy('dateListed', 'desc').limit(1).onSnapshot(snapshot => {
      const item = snapshot.docs[0];
      if (item) fetchImageAndSetState(item, setLatestItem, item.data().name);
    });

    const unsubscribeExperiences = firestore.collection('experiences').orderBy('dateListed', 'desc').limit(1).onSnapshot(snapshot => {
      const experience = snapshot.docs[0];
      if (experience) fetchImageAndSetState(experience, setLatestExperience, experience.data().name);
    });

    return () => {
      unsubscribeRides();
      unsubscribeAirbnbs();
      unsubscribeItems();
      unsubscribeExperiences();
    };
  }, []);

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toDateString();
    }
    return 'Unknown date';
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

  const renderAmenities = (amenities) => {
    return Object.keys(amenities)
      .filter(key => amenities[key])
      .map(key => key.charAt(0).toUpperCase() + key.slice(1))
      .join(', ');
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="ShareApp" />
          <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/* <Text style={styles.title}>Welcome to ShareApp</Text> */}
          <Text style={styles.subtitle}>Latest Listings</Text>
          
          {latestRide && (
            <Card style={styles.card}>
              <Card.Cover source={{ uri: latestRide.imageUrl }} style={styles.cardImage} />
              <Card.Content>
                <View style={styles.cardHeader}>
                  {latestRide.userPhoto && <Image source={{ uri: latestRide.userPhoto }} style={styles.userPhoto} />}
                  <View>
                    <Text style={styles.cardTitle}>{latestRide.destination}</Text>
                    <Text style={styles.userName}>{latestRide.userName}</Text>
                    <Text style={styles.cardDate}>{formatDate(latestRide.dateListed)}</Text>
                  </View>
                </View>
                <Text style={styles.cardDetails}>Price: ${latestRide.price}</Text>
                <Text style={styles.cardDetails}>Number of Places: {latestRide.numPlaces}</Text>
                {latestRide.timeLimited && <Text style={styles.cardDetails}>Time Limited</Text>}
                <Text style={styles.cardDate}>Date: {formatDate(latestRide.date)}</Text>
              </Card.Content>
              <Card.Actions>
                {/* <Button onPress={() => navigation.navigate('RidesScreen')} mode="text">View All Rides</Button> */}
                <Button mode="text" onPress={() => navigation.navigate('RidesScreen')}>
                  View All Rides
                </Button>
                {latestRide.userId !== auth.currentUser?.uid && (
                  <IconButton icon="thumb-up" onPress={() => notifyOwner(latestRide.userId, latestRide.id)} />
                )}
              </Card.Actions>
            </Card>
          )}

          {latestAirbnb && (
            <Card style={styles.card}>
              <Card.Cover source={{ uri: latestAirbnb.imageUrl }} style={styles.cardImage} />
              <Card.Content>
                <View style={styles.cardHeader}>
                  {latestAirbnb.userPhoto && <Image source={{ uri: latestAirbnb.userPhoto }} style={styles.userPhoto} />}
                  <View>
                    <Text style={styles.cardTitle}>{latestAirbnb.location}</Text>
                    <Text style={styles.userName}>{latestAirbnb.userName}</Text>
                    <Text style={styles.cardDate}>{formatDate(latestAirbnb.dateListed)}</Text>
                  </View>
                </View>
                <Text style={styles.cardDetails}>Price: ${latestAirbnb.price}</Text>
                <Text style={styles.cardDetails}>Number of Rooms: {latestAirbnb.numRooms}</Text>
                <Text style={styles.cardDetails}>Amenities: {renderAmenities(latestAirbnb.amenities)}</Text>
                <Text style={styles.cardDetails}>Description: {latestAirbnb.description}</Text>
                <Text style={styles.cardDate}>Date: {formatDate(latestAirbnb.date)}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => navigation.navigate('AirbnbsScreen')} mode="text">View All Airbnbs</Button>
                {latestAirbnb.userId !== auth.currentUser?.uid && (
                  <IconButton icon="thumb-up" onPress={() => notifyOwner(latestAirbnb.userId, latestAirbnb.id)} />
                )}
              </Card.Actions>
            </Card>
          )}

          {latestItem && (
            <Card style={styles.card}>
              <Card.Cover source={{ uri: latestItem.imageUrl }} style={styles.cardImage} />
              <Card.Content>
                <View style={styles.cardHeader}>
                  {latestItem.userPhoto && <Image source={{ uri: latestItem.userPhoto }} style={styles.userPhoto} />}
                  <View>
                    <Text style={styles.cardTitle}>{latestItem.name}</Text>
                    <Text style={styles.userName}>{latestItem.userName}</Text>
                    <Text style={styles.cardDate}>{formatDate(latestItem.dateListed)}</Text>
                  </View>
                </View>
                <Text style={styles.cardDetails}>Price: ${latestItem.price}</Text>
                <Text style={styles.cardDetails}>Description: {latestItem.description}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => navigation.navigate('ItemsScreen')} mode="text">View All Items</Button>
                {latestItem.userId !== auth.currentUser?.uid && (
                  <IconButton icon="thumb-up" onPress={() => notifyOwner(latestItem.userId, latestItem.id)} />
                )}
              </Card.Actions>
            </Card>
          )}

          {latestExperience && (
            <Card style={styles.card}>
              <Card.Cover source={{ uri: latestExperience.imageUrl }} style={styles.cardImage} />
              <Card.Content>
                <View style={styles.cardHeader}>
                  {latestExperience.userPhoto && <Image source={{ uri: latestExperience.userPhoto }} style={styles.userPhoto} />}
                  <View>
                    <Text style={styles.cardTitle}>{latestExperience.name}</Text>
                    <Text style={styles.userName}>{latestExperience.userName}</Text>
                    <Text style={styles.cardDate}>{formatDate(latestExperience.dateListed)}</Text>
                  </View>
                </View>
                <Text style={styles.cardDetails}>Price: ${latestExperience.price}</Text>
                <Text style={styles.cardDetails}>Description: {latestExperience.description}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => navigation.navigate('ExperiencesScreen')} mode="text">View All Experiences</Button>
                {latestExperience.userId !== auth.currentUser?.uid && (
                  <IconButton icon="thumb-up" onPress={() => notifyOwner(latestExperience.userId, latestExperience.id)} />
                )}
              </Card.Actions>
            </Card>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              label="Enter City"
              value={city}
              onChangeText={setCity}
              style={styles.input}
            />
            <Menu
              visible={visible}
              onDismiss={closeMenu}
              anchor={
                <Button mode="outlined" onPress={openMenu} style={styles.dropdown}>
                  Select City
                </Button>
              }>
              {cities.map((city) => (
                <Menu.Item key={city.value} onPress={() => { setCity(city.value); closeMenu(); }} title={city.label} />
              ))}
            </Menu>
            <Button mode="contained" onPress={handleNavigate} style={styles.button}>
              View Matching Itineraries
            </Button>
          </View>
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
  appbar: {
    backgroundColor: '#ffffff',
  },
  scrollView: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardImage: {
    height: 200,
  },
  cardHeader: {
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
  cardDetails: {
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
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
  dropdown: {
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
});

export default HomeScreen;
