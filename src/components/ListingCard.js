import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Text, IconButton, Button, Avatar, Modal, Portal, TextInput, useTheme } from 'react-native-paper';
import { firestore } from '../services/firebase';

const ListingCard = ({ listing, currentUser, userProfilePhoto, navigation, notifyOwner, refreshListings }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingListing, setEditingListing] = useState(listing);
  const { colors } = useTheme();

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

  const getListingTypeScreen = (type) => {
    switch (type) {
      case 'Ride':
        return 'RidesScreen';
      case 'Airbnb':
        return 'AirbnbScreen';
      case 'Item':
        return 'ItemShareScreen';
      case 'Experience':
        return 'ExperienceShareScreen';
      default:
        return 'Home';
    }
  };

  const handleEdit = () => {
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    try {
      const collectionName = `${listing.type?.toLowerCase() || 'fallbackCollection'}`;
      await firestore.collection(collectionName).doc(listing.id).update(editingListing);
      setModalVisible(false);
      Alert.alert('Success', 'Listing updated successfully!');
      refreshListings(); // Refresh listings after edit
    } catch (error) {
      console.error('Error updating listing:', error);
      Alert.alert('Error', 'Failed to update listing.');
    }
  };

  const handleDelete = async () => {
    try {
      const collectionName = `${listing.type?.toLowerCase() || 'fallbackCollection'}`;
      console.log(`Attempting to delete from collection: ${collectionName}, Listing ID: ${listing.id}`);
      await firestore.collection(collectionName).doc(listing.id).delete();
      Alert.alert('Success', 'Listing deleted successfully!');
      refreshListings(); // Refresh listings after delete
    } catch (error) {
      console.error('Error deleting listing:', error);
      Alert.alert('Error', 'Failed to delete listing.');
    }
  };

  const renderEditModal = () => (
    <Portal>
      <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
        <Text style={styles.modalTitle}>Edit Listing</Text>
        <TextInput
          label="Title"
          value={editingListing.title || ''}
          onChangeText={(text) => setEditingListing({ ...editingListing, title: text })}
          style={styles.modalInput}
        />
        <TextInput
          label="Description"
          value={editingListing.description || ''}
          onChangeText={(text) => setEditingListing({ ...editingListing, description: text })}
          style={styles.modalInput}
        />
        <TextInput
          label="Price"
          value={editingListing.price ? String(editingListing.price) : ''}
          onChangeText={(text) => setEditingListing({ ...editingListing, price: Number(text) })}
          style={styles.modalInput}
          keyboardType="numeric"
        />
        <Button mode="contained" onPress={handleSaveEdit} style={styles.modalButton}>
          Save Changes
        </Button>
        <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.modalButton}>
          Cancel
        </Button>
      </Modal>
    </Portal>
  );

  return (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: listing.imageUrl || 'https://via.placeholder.com/150' }} style={styles.cardImage} />
      <Card.Content>
        <View style={styles.cardHeader}>
          <Avatar.Image 
            size={40} 
            source={{ uri: listing.userPhoto || userProfilePhoto || 'https://via.placeholder.com/150' }} 
            style={styles.userPhoto} 
          />
          <View style={styles.headerText}>
            <View style={styles.titleContainer}>
              <Text style={styles.cardTitle}>
                {listing.title || listing.name || listing.destination || listing.location}
              </Text>
              
            </View>
            <Text style={styles.userName}>{listing.userName}</Text>
            <Text style={styles.cardDate}>{formatRangeDate(listing.startDate, listing.endDate)}</Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          {listing.price && <Text style={styles.detailText}>Price: ${listing.price}</Text>}
          {listing.numSpaces && <Text style={styles.detailText}>Spaces: {listing.numSpaces}</Text>}
          {listing.numRooms && <Text style={styles.detailText}>Rooms: {listing.numRooms}</Text>}
          {listing.amenities && (
            <Text style={styles.detailText}>
              Amenities: {Object.keys(listing.amenities).filter(key => listing.amenities[key]).join(', ')}
            </Text>
          )}
          {listing.timeLimited && <Text style={styles.detailText}>Time Limited</Text>}
          {listing.description && <Text style={styles.detailText}>Description: {listing.description}</Text>}
          <Text style={styles.cardDate}>Date: {formatDate(listing.dateListed)}</Text>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <Button 
          mode="text" 
          onPress={() => navigation.navigate(getListingTypeScreen(listing.type))}
          style={styles.viewAllButton}
        >
          View All
        </Button>
        {listing.isTaxi && <IconButton icon="taxi" size={20} style={styles.taxiIcon} />}
        {listing.userId === currentUser?.uid ? (
          <>
            <IconButton icon="pencil" onPress={handleEdit} />
            <IconButton icon="delete" onPress={handleDelete} />
          </>
        ) : (
          <IconButton icon="thumb-up" onPress={() => notifyOwner(listing.userId, listing.id)} />
        )}
      </Card.Actions>
      {renderEditModal()}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
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
    marginRight: 8,
  },
  headerText: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taxiIcon: {
    marginLeft: 8,
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
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#757575',
  },
  cardActions: {
    justifyContent: 'space-between',
  },
  viewAllButton: {
    marginLeft: 'auto',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButton: {
    marginTop: 10,
  },
});

export default ListingCard;
