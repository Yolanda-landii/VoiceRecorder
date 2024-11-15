import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity } from 'react-native';
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
      if (selectedAudioUri === id) {
        setSelectedAudioUri(null);
      }
    } catch (error) {
      console.error("Failed to delete audio note:", error);
      Alert.alert("Storage Error", "Could not delete audio note.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Recordings</Text>

      <FlatList
        data={audioNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.audioItem}>
            <TouchableOpacity onPress={() => setSelectedAudioUri(item.path)} style={styles.recordingInfo}>
              <Text style={styles.recordingTitle}>{item.id}</Text>
              <Text style={styles.recordingDate}>{item.date}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteAudioNote(item.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 150 }} 
      />

      {selectedAudioUri && (
        <View style={styles.audioPlayerContainer}>
          <AudioPlayer uri={selectedAudioUri} />
        </View>
      )}

      <View style={styles.recorderControlsContainer}>
        <RecorderControls saveAudioNote={saveAudioNote} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  recordingInfo: { flex: 1 },
  recordingTitle: { fontSize: 16, fontWeight: 'bold' },
  recordingDate: { fontSize: 14, color: '#888' },
  deleteButton: { padding: 8 },
  deleteButtonText: { color: '#ff0000' },
  audioPlayerContainer: {
    position: 'absolute',
    bottom: 80, 
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  recorderControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});
