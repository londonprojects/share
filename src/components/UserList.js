// components/UserList.js
import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Avatar, Text } from 'react-native-paper';

const UserList = ({ recentUsers, title, navigation }) => {
  const handleUserPress = (userId) => {
    navigation.navigate('Messenger', { userId });
  };

  return (
    <>
      <Text style={styles.subtitle}>{title}</Text>
      <View style={styles.avatarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentUsers.map((user, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.avatarWrapper,
                user.isHitchhiking && styles.hitchhiking,
                user.isOnline && styles.online,
              ]}
              onPress={() => handleUserPress(user.id)} // Assuming each user has a unique `id` property
            >
              <Avatar.Image size={50} source={{ uri: user.photoURL }} style={styles.avatar} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    marginHorizontal: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 15,
    padding: 5,
  },
  avatarWrapper: {
    marginHorizontal: 5,
    borderRadius: 25, // half of the avatar size to make it a circle
    borderWidth: 2,
    borderColor: 'transparent', // default to transparent
  },
  avatar: {
    marginHorizontal: 5,
  },
  hitchhiking: {
    borderColor: 'blue', // color for hitchhiking
  },
  online: {
    borderColor: 'green', // color for online
  },
});

export default UserList;
