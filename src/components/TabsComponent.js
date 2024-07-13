import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, TabScreen } from 'react-native-paper-tabs';

const TabsComponent = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Tabs>
        <TabScreen label="Rides" onPress={() => navigation.navigate('RidesScreen')}>
          <View />
        </TabScreen>
        <TabScreen label="Airbnbs" onPress={() => navigation.navigate('AirbnbShare')}>
          <View />
        </TabScreen>
        <TabScreen label="Items" onPress={() => navigation.navigate('ItemShareScreen')}>
          <View />
        </TabScreen>
        <TabScreen label="Experiences" onPress={() => navigation.navigate('ExperienceShare')}>
          <View />
        </TabScreen>
      </Tabs>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
});

export default TabsComponent;
