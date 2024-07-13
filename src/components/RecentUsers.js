// components/RecentUsers.js
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Avatar } from 'react-native-paper';

const DEFAULT_IMAGE = 'https://plus.unsplash.com/premium_photo-1683800241997-a387bacbf06b?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';

const RecentUsers = ({ recentUsers }) => {
  return (
    <View>
      {recentUsers.map(user => (
        <View key={user.id} style={styles.recentUserContainer}>
          <Avatar.Image size={80} source={{ uri: user.photoURL || DEFAULT_IMAGE }} />
          <Text style={styles.userName}>{user.displayName || 'No Name'}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  recentUserContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  userName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RecentUsers;
