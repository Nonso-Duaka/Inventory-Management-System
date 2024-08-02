// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
const firestore = getFirestore(app);
export { firestore };