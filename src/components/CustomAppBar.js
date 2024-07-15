// components/CustomAppBar.js
import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomAppBar = ({ navigation, userProfilePhoto }) => {
  return (
    <Appbar.Header style={styles.appbar}>
      <IconButton
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="home-outline" size={size} color={color} />
        )}
        size={30}
        onPress={() => navigation.navigate('Home')}
      />
      <Appbar.Content title="" />
      <IconButton
        icon="account-group"
        size={30}
        onPress={() => navigation.navigate('Community')}
      />
      <IconButton
        icon="comment-outline"
        size={30}
        onPress={() => navigation.navigate('Messenger', { userId: 'exampleUserId' })}
      />
      <IconButton
        icon="chat-processing-outline"
        size={30}
        onPress={() => navigation.navigate('MessagesList', { userId: 'exampleUserId' })}
      />
      <IconButton
        icon="map"
        size={30}
        onPress={() => navigation.navigate('MapScreen')}
      />
      {userProfilePhoto ? (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={{ uri: userProfilePhoto }} style={styles.profilePhoto} />
        </TouchableOpacity>
      ) : (
        <Appbar.Action icon="account" onPress={() => navigation.navigate('Profile')} />
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  appbar: {
    backgroundColor: '#ffffff',
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
});

export default CustomAppBar;
