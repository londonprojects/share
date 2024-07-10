import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList } from 'react-native';
import { Text, Button, List, Divider, Avatar, Switch } from 'react-native-paper';
import { auth, firestore } from '../services/firebase';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [userStats, setUserStats] = useState({ rides: 0, airbnbs: 0, items: 0, experiences: 0 });
  const [isHitchhiker, setIsHitchhiker] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchUserListings(currentUser.uid);
      fetchUserHitchhikerStatus(currentUser.uid);
      fetchInterestedUsers(currentUser.uid);
    } else {
      navigation.navigate('Login'); // Redirect to login if not logged in
    }
  }, []);

  const fetchUserListings = async (userId) => {
    const rides = await firestore.collection('rides').where('userId', '==', userId).get();
    const airbnbs = await firestore.collection('airbnbs').where('userId', '==', userId).get();
    const items = await firestore.collection('items').where('userId', '==', userId).get();
    const experiences = await firestore.collection('experiences').where('userId', '==', userId).get();

    setUserStats({
      rides: rides.size,
      airbnbs: airbnbs.size,
      items: items.size,
      experiences: experiences.size,
    });

    setListings([
      ...rides.docs.map(doc => ({ id: doc.id, type: 'Ride', ...doc.data() })),
      ...airbnbs.docs.map(doc => ({ id: doc.id, type: 'Airbnb', ...doc.data() })),
      ...items.docs.map(doc => ({ id: doc.id, type: 'Item', ...doc.data() })),
      ...experiences.docs.map(doc => ({ id: doc.id, type: 'Experience', ...doc.data() })),
    ]);
  };

  const fetchUserHitchhikerStatus = async (userId) => {
    const userDoc = await firestore.collection('users').doc(userId).get();
    if (userDoc.exists) {
      setIsHitchhiker(userDoc.data().isHitchhiker || false);
    }
  };

  const fetchInterestedUsers = async (userId) => {
    const interests = await firestore.collection('interests').where('ownerId', '==', userId).get();
    const userIds = interests.docs.map(doc => doc.data().interestedUserId);
    
    const userPromises = userIds.map(userId => firestore.collection('users').doc(userId).get());
    const userDocs = await Promise.all(userPromises);
    const users = userDocs.map(doc => ({ id: doc.id, ...doc.data() }));

    setInterestedUsers(users);
  };

  const handleToggleHitchhiker = () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      firestore.collection('users').doc(userId).update({ isHitchhiker: !isHitchhiker })
        .then(() => {
          setIsHitchhiker(!isHitchhiker);
          Alert.alert("Success", `Hitchhiker feature turned ${!isHitchhiker ? 'on' : 'off'}.`);
        })
        .catch(error => {
          Alert.alert("Error", error.message);
        });
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigation.navigate('Login');
    }).catch(error => {
      Alert.alert('Error', error.message);
    });
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toDateString();
    }
    return 'Unknown date';
  };

  return (
    <View style={styles.container}>
      {user && (
        <View style={styles.profileHeader}>
          <Avatar.Image size={80} source={{ uri: user.photoURL }} />
          <Text style={styles.username}>{user.displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      )}
      <Divider />
      <View style={styles.statsContainer}>
        <Text>Rides: {userStats.rides}</Text>
        <Text>Airbnbs: {userStats.airbnbs}</Text>
        <Text>Items: {userStats.items}</Text>
        <Text>Experiences: {userStats.experiences}</Text>
      </View>
      <Divider />
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={`${item.type}: ${item.details || item.location || item.name}`}
            description={`Date Listed: ${formatDate(item.dateListed)}`}
            left={props => <List.Icon {...props} icon="folder" />}
          />
        )}
      />
      <View style={styles.hitchhikerToggleContainer}>
        <Text style={styles.hitchhikerToggleLabel}>Hitchhiker Feature</Text>
        <Switch value={isHitchhiker} onValueChange={handleToggleHitchhiker} />
      </View>
      <Divider />
      <Text style={styles.interestedTitle}>Interested Users:</Text>
      <FlatList
        data={interestedUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.displayName}
            description={item.email}
            left={props => <Avatar.Image {...props} size={40} source={{ uri: item.photoURL }} />}
            onPress={() => navigation.navigate('Messenger', { userId: item.id })}
          />
        )}
      />
      <Button mode="outlined" onPress={() => navigation.navigate('EditProfile')} style={styles.button}>
        Edit Profile
      </Button>
      <Button mode="outlined" onPress={handleLogout} style={styles.button}>
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  hitchhikerToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 16,
  },
  hitchhikerToggleLabel: {
    fontSize: 18,
  },
  interestedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  button: {
    marginVertical: 8,
  },
});

export default ProfileScreen;
