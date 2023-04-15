import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDPJKy2NkmD0BT5i-eVprgaPBlCN1SD3Fs",
  authDomain: "coolbook-ec640.firebaseapp.com",
  projectId: "coolbook-ec640",
  storageBucket: "coolbook-ec640.appspot.com",
  messagingSenderId: "704850255751",
  appId: "1:704850255751:web:d6bf49144c0544a3e57d22",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Firestore
const db = firebase.firestore();

// Initialize Storage
const storage = firebase.storage();

export { db, storage };
