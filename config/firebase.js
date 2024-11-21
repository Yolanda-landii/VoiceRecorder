import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBjLKWrIx9K-gvDAKmb2YQjVSHTXIFxtOQ",
  authDomain: "audio-recorder-7f976.firebaseapp.com",
  projectId: "audio-recorder-7f976",
  storageBucket: "audio-recorder-7f976.appspot.com",
  messagingSenderId: "444776250542",
  appId: "1:444776250542:web:23b0f68a3673fdd339813f",
  measurementId: "G-F41ZJGNT6G",
};

let app;
let auth;
let firestore;
let storage;

export function initializeFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
  }
  return { auth, firestore, storage };
}
