// components/ListingCard.js
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, IconButton, Button } from 'react-native-paper';

const ListingCard = ({ listing, currentUser, userProfilePhoto, navigation, notifyOwner }) => {
  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toDateString();
    }
    return 'Unknown date';
  };

  const getListingTypeScreen = (type) => {
    switch (type) {
      case 'Ride':
        return 'RidesScreen';
      case 'Airbnb':
        return 'AirbnbsScreen';
      case 'Item':
        return 'ItemsScreen';
      case 'Experience':
        return 'ExperiencesScreen';
      default:
        return 'HomeScreen';
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: listing.imageUrl }} style={styles.cardImage} />
      <Card.Content>
        <View style={styles.cardHeader}>
          {listing.userPhoto && <Image source={{ uri: listing.userPhoto }} style={styles.userPhoto} />}
          {listing.userId === currentUser?.uid && userProfilePhoto && (
            <Image source={{ uri: userProfilePhoto }} style={styles.userPhoto} />
          )}
          <View>
            <Text style={styles.cardTitle}>{listing.title || listing.name || listing.destination || listing.location}</Text>
            <Text style={styles.userName}>{listing.userName}</Text>
            <Text style={styles.cardDate}>{formatDate(listing.dateListed)}</Text>
          </View>
        </View>
        <Text style={styles.cardDetails}>Price: ${listing.price}</Text>
        {listing.numSpaces && <Text style={styles.cardDetails}>Number of Spaces: {listing.numSpaces}</Text>}
        {listing.numRooms && <Text style={styles.cardDetails}>Number of Rooms: {listing.numRooms}</Text>}
        {listing.amenities && <Text style={styles.cardDetails}>Amenities: {Object.keys(listing.amenities).filter(key => listing.amenities[key]).join(', ')}</Text>}
        {listing.timeLimited && <Text style={styles.cardDetails}>Time Limited</Text>}
        {listing.description && <Text style={styles.cardDetails}>Description: {listing.description}</Text>}
        <Text style={styles.cardDate}>Date: {formatDate(listing.date)}</Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="text" onPress={() => navigation.navigate(getListingTypeScreen(listing.type))}>View All</Button>
        {listing.userId !== currentUser?.uid && (
          <IconButton icon="thumb-up" onPress={() => notifyOwner(listing.userId, listing.id)} />
        )}
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
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
});

export default ListingCard;
