import { initializeFirebase } from "../config/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function backupAudioNotes() {
  const { firestore, storage } = initializeFirebase();
  const audioNotes = await AsyncStorage.getItem("audioNotes");
  const notes = audioNotes ? JSON.parse(audioNotes) : [];

  if (notes.length === 0) return;

  const uploadPromises = notes.map(async (note) => {

    const noteDocRef = firestore.collection("audioNotes").doc(note.id);
    await noteDocRef.set({
      title: note.title,
      date: note.date,
    });

    const storageRef = storage.ref().child(`audioNotes/${note.id}.mp3`);
    const response = await fetch(note.uri); 
    const blob = await response.blob();
    await storageRef.put(blob);
  });

  await Promise.all(uploadPromises);
}

export async function restoreAudioNotes() {
  const { firestore, storage } = initializeFirebase();

  const notesSnapshot = await firestore.collection("audioNotes").get();
  const notes = notesSnapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title,
    date: doc.data().date,
  }));

  const downloadPromises = notes.map(async (note) => {
   
    const storageRef = storage.ref().child(`audioNotes/${note.id}.mp3`);
    const uri = await storageRef.getDownloadURL();

    return { ...note, uri };
  });

  const downloadedNotes = await Promise.all(downloadPromises);

  // Save downloaded notes back to AsyncStorage
  await AsyncStorage.setItem("audioNotes", JSON.stringify(downloadedNotes));
}
