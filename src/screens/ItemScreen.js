import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { firestore, auth } from '../services/firebase';

const ItemShare = ({ navigation }) => {
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemPrice, setItemPrice] = useState('');

  const handleShareItem = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert('Error', 'You need to be logged in to share an item.');
      return;
    }

    if (!itemName || !itemDescription || !itemPrice) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    try {
      const itemRef = await firestore.collection('items').add({
        name: itemName,
        description: itemDescription,
        price: itemPrice,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhoto: currentUser.photoURL,
        dateListed: new Date(),
      });

      await firestore.collection('notifications').add({
        itemId: itemRef.id,
        itemName: itemName,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        type: 'item_shared',
        message: `${currentUser.displayName} has shared a new item: ${itemName}`,
        read: false,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Item shared successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error sharing item:', error);
      Alert.alert('Error', 'Failed to share item.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share an Item</Text>
      <TextInput
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
        style={styles.input}
      />
      <TextInput
        placeholder="Item Description"
        value={itemDescription}
        onChangeText={setItemDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Item Price"
        value={itemPrice}
        onChangeText={setItemPrice}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button mode="contained" onPress={handleShareItem} style={styles.button}>
        Share Item
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    marginTop: 16,
  },
});

export default ItemShare;
