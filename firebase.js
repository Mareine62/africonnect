import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAEyfeM53lc-Frg0eg6ruZYAuYn9fv_TA4",
  authDomain: "africonnect-ea126.firebaseapp.com",
  projectId: "africonnect-ea126",
  storageBucket: "africonnect-ea126.firebasestorage.app",
  messagingSenderId: "210919835437",
  appId: "1:210919835437:web:ba0ea56d479b84f06435a4",
  measurementId: "G-6W8BW1MNJF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
