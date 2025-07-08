// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWwPG3AwekdYEDKBz1doH8NWWfZ2QoSGU",
  authDomain: "chandan-prasad-group.firebaseapp.com",
  projectId: "chandan-prasad-group",
  storageBucket: "chandan-prasad-group.firebasestorage.app",
  messagingSenderId: "362364815178",
  appId: "1:362364815178:web:9483c6da3a689dd32423b3",
  measurementId: "G-5TKNE1R42Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
