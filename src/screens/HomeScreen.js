import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { Text, Card, Button, Appbar, IconButton, Provider as PaperProvider } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const HomeScreen = ({ navigation }) => {
  const [latestRide, setLatestRide] = useState(null);
  const [latestAirbnb, setLatestAirbnb] = useState(null);
  const [latestItem, setLatestItem] = useState(null);
  const [latestExperience, setLatestExperience] = useState(null);

  useEffect(() => {
    const unsubscribeRides = firestore.collection('rides').orderBy('dateListed', 'desc').limit(1).onSnapshot(snapshot => {
      const ride = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))[0];
      setLatestRide(ride);
    });

    const unsubscribeAirbnbs = firestore.collection('airbnbs').orderBy('dateListed', 'desc').limit(1).onSnapshot(snapshot => {
      const airbnb = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))[0];
      setLatestAirbnb(airbnb);
    });

    const unsubscribeItems = firestore.collection('items').orderBy('dateListed', 'desc').limit(1).onSnapshot(snapshot => {
      const item = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))[0];
      setLatestItem(item);
    });

    const unsubscribeExperiences = firestore.collection('experiences').orderBy('dateListed', 'desc').limit(1).onSnapshot(snapshot => {
      const experience = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))[0];
      setLatestExperience(experience);
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

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.Content title="ShareApp" />
          <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Welcome to ShareApp</Text>
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
              {latestRide.userId !== auth.currentUser?.uid && (
                <Card.Actions>
                  <IconButton icon="thumb-up" onPress={() => notifyOwner(latestRide.userId, latestRide.id)} />
                </Card.Actions>
              )}
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
                <Text style={styles.cardDetails}>Amenities: {latestAirbnb.amenities}</Text>
                <Text style={styles.cardDetails}>Description: {latestAirbnb.description}</Text>
                <Text style={styles.cardDate}>Date: {formatDate(latestAirbnb.date)}</Text>
              </Card.Content>
              {latestAirbnb.userId !== auth.currentUser?.uid && (
                <Card.Actions>
                  <IconButton icon="thumb-up" onPress={() => notifyOwner(latestAirbnb.userId, latestAirbnb.id)} />
                </Card.Actions>
              )}
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
              {latestItem.userId !== auth.currentUser?.uid && (
                <Card.Actions>
                  <IconButton icon="thumb-up" onPress={() => notifyOwner(latestItem.userId, latestItem.id)} />
                </Card.Actions>
              )}
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
              {latestExperience.userId !== auth.currentUser?.uid && (
                <Card.Actions>
                  <IconButton icon="thumb-up" onPress={() => notifyOwner(latestExperience.userId, latestExperience.id)} />
                </Card.Actions>
              )}
            </Card>
          )}

          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={() => navigation.navigate('RidesScreen')} style={styles.button}>
              View All Rides
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('AirbnbsScreen')} style={styles.button}>
              View All Airbnbs
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('ItemsScreen')} style={styles.button}>
              View All Items
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('ExperiencesScreen')} style={styles.button}>
              View All Experiences
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('RideShare')} style={styles.button}>
              Share a Ride
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('AirbnbShare')} style={styles.button}>
              Share an Airbnb
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('ItemShare')} style={styles.button}>
              Share an Item
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('ExperienceShare')} style={styles.button}>
              Share an Experience
            </Button>
          </View>
        </ScrollView>
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
  buttonContainer: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: '90%',
    marginVertical: 8,
  },
});

export default HomeScreen;
