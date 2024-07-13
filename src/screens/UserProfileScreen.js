import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Avatar, Text, Button, Card, Divider } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1716671827397-8948fb218779?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        if (userDoc.exists) {
          setUser({ id: userDoc.id, ...userDoc.data() });
        }
        
        const ridesSnapshot = await firestore.collection('rides').where('userId', '==', userId).get();
        const airbnbsSnapshot = await firestore.collection('airbnbs').where('userId', '==', userId).get();
        const itemsSnapshot = await firestore.collection('items').where('userId', '==', userId).get();
        const experiencesSnapshot = await firestore.collection('experiences').where('userId', '==', userId).get();

        setListings([
          ...ridesSnapshot.docs.map(doc => ({ id: doc.id, type: 'Ride', ...doc.data() })),
          ...airbnbsSnapshot.docs.map(doc => ({ id: doc.id, type: 'Airbnb', ...doc.data() })),
          ...itemsSnapshot.docs.map(doc => ({ id: doc.id, type: 'Item', ...doc.data() })),
          ...experiencesSnapshot.docs.map(doc => ({ id: doc.id, type: 'Experience', ...doc.data() })),
        ]);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toDateString();
    }
    return 'Unknown date';
  };

  return (
    <ScrollView style={styles.container}>
      {user && (
        <View style={styles.profileHeader}>
          <Avatar.Image size={80} source={{ uri: user.photoURL || DEFAULT_IMAGE }} />
          <Text style={styles.username}>{user.displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}
      <Divider />
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.listingType}>{item.type}</Text>
              <Text style={styles.listingDetails}>{item.details || item.location || item.name}</Text>
              <Text style={styles.listingDate}>Date Listed: {formatDate(item.dateListed)}</Text>
            </Card.Content>
          </Card>
        )}
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('MessageScreen', { userId: user.id })}
        style={styles.button}
      >
        Send Message
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  email: {
    fontSize: 16,
    color: '#757575',
  },
  card: {
    marginVertical: 8,
  },
  listingType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listingDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  listingDate: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  button: {
    marginVertical: 16,
  },
});

export default UserProfileScreen;
