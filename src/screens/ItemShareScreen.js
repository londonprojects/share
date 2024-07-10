import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

function ItemShareScreen({ navigation }) {
  const [itemDetails, setItemDetails] = useState({ name: '', description: '', price: '' });
  const { colors } = useTheme();

  const handleShare = () => {
    const user = auth.currentUser;
    if (user) {
      const itemWithUser = {
        ...itemDetails,
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        dateListed: new Date(),
      };

      firestore.collection('items').add(itemWithUser)
        .then(() => {
          Alert.alert("Success", "Item shared successfully!");
          navigation.navigate('Home');
        })
        .catch((error) => {
          Alert.alert("Error", error.message);
        });
    } else {
      Alert.alert("Error", "User not logged in.");
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>Share an Item</Text>
      <TextInput
        label="Name"
        value={itemDetails.name}
        onChangeText={(text) => setItemDetails({ ...itemDetails, name: text })}
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={itemDetails.description}
        onChangeText={(text) => setItemDetails({ ...itemDetails, description: text })}
        style={styles.input}
        multiline
        numberOfLines={4}
      />
      <TextInput
        label="Price"
        value={itemDetails.price}
        onChangeText={(text) => setItemDetails({ ...itemDetails, price: text })}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleShare} style={styles.button}>
        Share Item
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  input: {
    width: '80%',
    marginBottom: 16,
  },
  button: {
    width: '80%',
    marginBottom: 16,
  },
});

export default ItemShareScreen;
