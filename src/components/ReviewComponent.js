import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput, Text } from 'react-native-paper';
import { firestore } from '../src/services/firebase';

const ReviewComponent = ({ itemId, itemType }) => {
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');

  const handleSubmit = () => {
    firestore.collection('reviews').add({
      itemId,
      itemType,
      rating,
      review,
    }).then(() => {
      setRating('');
      setReview('');
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Rating (1-5)"
        value={rating}
        onChangeText={setRating}
        style={styles.input}
      />
      <TextInput
        label="Review"
        value={review}
        onChangeText={setReview}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Submit Review
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});

export default ReviewComponent;
