import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecorderControls from '../Components/RecorderControls';
import AudioPlayer from '../Components/AudioPlayer';

export default function App() {
  const [audioNotes, setAudioNotes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedAudioUri, setSelectedAudioUri] = useState(null);

  useEffect(() => {
    loadAudioNotes();
  }, [refresh]);

  const loadAudioNotes = async () => {
    try {
      const data = await AsyncStorage.getItem('audioNotes');
      const notes = data ? JSON.parse(data) : [];
      setAudioNotes(notes);
    } catch (error) {
      console.error("Failed to load audio notes:", error);
      Alert.alert("Storage Error", "Could not load audio notes.");
    }
  };

  const saveAudioNote = async (note) => {
    try {
      const newNotes = [...audioNotes, note];
      await AsyncStorage.setItem('audioNotes', JSON.stringify(newNotes));
      setRefresh(!refresh);
    } catch (error) {
      console.error("Failed to save audio note:", error);
      Alert.alert("Storage Error", "Could not save audio note.");
    }
  };

  const deleteAudioNote = async (id) => {
    try {
      const newNotes = audioNotes.filter((note) => note.id !== id);
      await AsyncStorage.setItem('audioNotes', JSON.stringify(newNotes));
      setRefresh(!refresh);
    } catch (error) {
      console.error("Failed to delete audio note:", error);
      Alert.alert("Storage Error", "Could not delete audio note.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Audio Recorder App</Text>
      <RecorderControls saveAudioNote={saveAudioNote} />
      <FlatList
        data={audioNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.audioItem}>
            <Text>{item.date}</Text>
            <Button
              title="Play"
              onPress={() => setSelectedAudioUri(item.path)}
            />
            <Button
              title="Delete"
              onPress={() => deleteAudioNote(item.id)}
            />
            {/* Render AudioPlayer only if selectedAudioUri matches the item's path */}
            {selectedAudioUri && <AudioPlayer uri={selectedAudioUri} />}

          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  audioItem: { marginVertical: 10, padding: 10, backgroundColor: '#fff', borderRadius: 5 },
});
