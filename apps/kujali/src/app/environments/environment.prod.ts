import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBl_SdgPAQxymGzoI9MPvBa__HdP4nTs4Q",
  authDomain: "kujali-36a76.firebaseapp.com",
  projectId: "kujali-36a76",
  storageBucket: "kujali-36a76.firebasestorage.app",
  messagingSenderId: "682904600196",
  appId: "1:682904600196:web:012cd7b27aed072b950cd1",
  measurementId: "G-WYNTR0M79F"
};

// Firebase initialization
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);