import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDAIc5w0ZbQsaE4bxeiiM0ipZXHnnkPlGw",
  authDomain: "sharemobile-app.firebaseapp.com",
  projectId: "sharemobile-app",
  storageBucket: "sharemobile-app.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "1:213660721187:android:59fa2daa7f58d4820ed196"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // if already initialized, use that one
}

// Enable Firestore logging
firebase.firestore.setLogLevel('debug');

// Export auth and firestore
export const auth = firebase.auth();
export const firestore = firebase.firestore();