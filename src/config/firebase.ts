import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getReactNativePersistence,
  initializeAuth
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyAqzU8ffqqolOCayxkG4tr8kWXlZmgo5hI",
  authDomain: "viegrandapp.firebaseapp.com",
  projectId: "viegrandapp",
  storageBucket: "viegrandapp.firebasestorage.app",
  messagingSenderId: "426031697085",
  appId: "1:426031697085:web:9ec5fde976a779c4c13bd4",
  measurementId: "G-Q8J5N0JC0P",
};

const app = initializeApp(firebaseConfig);

// Kiểm tra xem đang chạy trên Web hay Native để chọn Persistence phù hợp
const auth = initializeAuth(app, {
  persistence:
    Platform.OS === "web"
      ? browserLocalPersistence
      : getReactNativePersistence(AsyncStorage),
});

export { auth };
export const db = getFirestore(app);
