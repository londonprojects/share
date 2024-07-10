import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  requestPermissions: Platform.OS === 'ios',
});

export const sendNotification = (title, message) => {
  PushNotification.localNotification({
    title: title,
    message: message,
  });
};
