// components/UserList.js
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Text } from 'react-native-paper';

const UserList = ({ recentUsers, title }) => {
  return (
    <>
      <Text style={styles.subtitle}>{title}</Text>
      <View style={styles.avatarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {recentUsers.map((user, index) => (
            <Avatar.Image key={index} size={50} source={{ uri: user.photoURL }} style={styles.avatar} />
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
  avatar: {
    marginHorizontal: 5,
  },
});

export default UserList;
