import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB87znIRC8YFb9UcE16nTCULaCB655ogZU",
  authDomain: "coolbook-c7c5a.firebaseapp.com",
  projectId: "coolbook-c7c5a",
  storageBucket: "coolbook-c7c5a.appspot.com",
  messagingSenderId: "421787031558",
  appId: "1:421787031558:web:b0031487060a2078cd8b87",
  measurementId: "G-VDHHZ3GSBQ"
};

// Initialize Firebase
const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

// Initialize Firestore
const db = firebase.firestore();
const auth = app.auth();
// Initialize Storage
const storage = firebase.storage();

export { db, storage, auth, app };
