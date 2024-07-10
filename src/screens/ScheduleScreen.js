import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card, useTheme } from 'react-native-paper';

function ScheduleScreen({ route }) {
  const { type, details } = route.params;
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title={`Scheduled ${type === 'ride' ? 'Ride' : 'Airbnb'}`} />
        <Card.Content>
          <Text variant="bodyLarge" style={styles.text}>Details:</Text>
          <Text variant="bodyMedium" style={styles.text}>{JSON.stringify(details)}</Text>
        </Card.Content>
      </Card>
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
  card: {
    width: '80%',
    padding: 16,
  },
  text: {
    marginTop: 8,
  },
});

export default ScheduleScreen;
