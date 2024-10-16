import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, FlatList, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Text, Button, List, Divider, Avatar, Switch } from 'react-native-paper';
import { auth, firestore, storage } from '../services/firebase';
import ImagePicker from 'react-native-image-picker';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [userStats, setUserStats] = useState({ rides: 0, airbnbs: 0, items: 0, experiences: 0 });
  const [isHitchhiker, setIsHitchhiker] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

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

  const uploadImage = async (uri, userId) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ref = storage().ref().child(`profilePictures/${userId}`);
    await ref.put(blob);

    const downloadURL = await ref.getDownloadURL();
    return downloadURL;
  };

  const handleSelectPhoto = () => {
    const options = {
      title: 'Select Avatar',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = { uri: response.uri };
        const downloadURL = await uploadImage(response.uri, user.uid);
        
        await auth.currentUser.updateProfile({
          photoURL: downloadURL,
        });

        setUser({
          ...user,
          photoURL: downloadURL,
        });
      }
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      await fetchUserListings(currentUser.uid);
      await fetchUserHitchhikerStatus(currentUser.uid);
      await fetchInterestedUsers(currentUser.uid);
    }
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {user && (
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={handleSelectPhoto}>
            {user.photoURL ? (
              <Avatar.Image size={80} source={{ uri: user.photoURL }} />
            ) : (
              <Avatar.Icon size={80} icon="account" />
            )}
          </TouchableOpacity>
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
      <Divider />
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
      <Divider />
      <List.Section>
        <List.Subheader>Support</List.Subheader>
        <List.Item
          title="How it Works"
          left={props => <List.Icon {...props} icon="information" />}
          onPress={() => navigation.navigate('HowItWorks')}
        />
        <List.Item
          title="Give Us Feedback"
          left={props => <List.Icon {...props} icon="message" />}
          onPress={() => navigation.navigate('Feedback')}
        />
        <List.Item
          title="Report a Concern"
          left={props => <List.Icon {...props} icon="alert" />}
          onPress={() => navigation.navigate('ReportConcern')}
        />
        <List.Item
          title="Visit the Help Centre"
          left={props => <List.Icon {...props} icon="help-circle" />}
          onPress={() => navigation.navigate('HelpCentre')}
        />
      </List.Section>
    </ScrollView>
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
