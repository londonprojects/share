// components/CustomAppBar.js
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomAppBar = ({ navigation, userProfilePhoto }) => {
  return (
    <Appbar.Header style={styles.appbar}>
      <View style={styles.iconContainer}>
        <IconButton
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="home-outline" size={size} color={color} />
          )}
          size={30}
          onPress={() => navigation.navigate('Home')}
        />
        <Text style={styles.iconLabel}>Home</Text>
      </View>

      <View style={styles.iconContainer}>
        <IconButton
          icon="account-group"
          size={30}
          onPress={() => navigation.navigate('Community')}
        />
        <Text style={styles.iconLabel}>Community</Text>
      </View>

      <View style={styles.iconContainer}>
        <IconButton
          icon="comment-outline"
          size={30}
          onPress={() => navigation.navigate('Messenger', { userId: 'exampleUserId' })}
        />
        <Text style={styles.iconLabel}>Messenger</Text>
      </View>

      <View style={styles.iconContainer}>
        <IconButton
          icon="chat-processing-outline"
          size={30}
          onPress={() => navigation.navigate('MessagesList', { userId: 'exampleUserId' })}
        />
        <Text style={styles.iconLabel}>Messages</Text>
      </View>

      <View style={styles.iconContainer}>
        <IconButton
          icon="map"
          size={30}
          onPress={() => navigation.navigate('MapScreen')}
        />
        <Text style={styles.iconLabel}>Map</Text>
      </View>

      {userProfilePhoto ? (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: userProfilePhoto }} style={styles.profilePhoto} />
          {/* <Text style={styles.iconLabel}>Profile</Text> */}
        </TouchableOpacity>
      ) : (
        <View style={styles.iconContainer}>
          <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
          <Text style={styles.iconLabel}>Profile</Text>
        </View>
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  appbar: {
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  iconContainer: {
    alignItems: 'center',
  },
  iconLabel: {
    fontSize: 10,
    color: '#000', // Adjust color as needed
  },
});

export default CustomAppBar;
