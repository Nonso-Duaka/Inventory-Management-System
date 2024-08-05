// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAufy2Lq8JTSC0l3RGkIqBG9AVBvwXFJ-U",
  authDomain: "inventory-management-sys-c3e87.firebaseapp.com",
  projectId: "inventory-management-sys-c3e87",
  storageBucket: "inventory-management-sys-c3e87.appspot.com",
  messagingSenderId: "551675366520",
  appId: "1:551675366520:web:b7bc8e5a688e2e8114f18d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
