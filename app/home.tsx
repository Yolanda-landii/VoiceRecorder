import React, { useEffect, useState } from 'react';
import {View,Text,StyleSheet,FlatList,Alert,TouchableOpacity,TextInput,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RecorderControls from './RecorderControls';
import AudioPlayer from './AudioPlayer';

export default function HomeScreen() {
  const [audioNotes, setAudioNotes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedAudioUri, setSelectedAudioUri] = useState(null);
  const [editingId, setEditingId] = useState(null); 
  const [editedTitle, setEditedTitle] = useState(''); 

  useEffect(() => {
    loadAudioNotes();
  }, [refresh]);

  const loadAudioNotes = async () => {
    try {
      const data = await AsyncStorage.getItem('audioNotes');
      const notes = data ? JSON.parse(data) : [];
      setAudioNotes(notes);
    } catch (error) {
      console.error('Failed to load audio notes:', error);
      Alert.alert('Storage Error', 'Could not load audio notes.');
    }
  };

  const saveAudioNote = async (note) => {
    try {
      const newNotes = [
        ...audioNotes,
        { ...note, title: `Recording ${audioNotes.length + 1}` },
      ];
      await AsyncStorage.setItem('audioNotes', JSON.stringify(newNotes));
      setRefresh(!refresh);
    } catch (error) {
      console.error('Failed to save audio note:', error);
      Alert.alert('Storage Error', 'Could not save audio note.');
    }
  };

  const deleteAudioNote = async (id) => {
    try {
      const newNotes = audioNotes.filter((note) => note.id !== id);
      await AsyncStorage.setItem('audioNotes', JSON.stringify(newNotes));

      if (selectedAudioUri === id) {
        setSelectedAudioUri(null);
      }
      setRefresh(!refresh);
    } catch (error) {
      console.error('Failed to delete audio note:', error);
      Alert.alert('Storage Error', 'Could not delete audio note.');
    }
  };

  const handleEditNote = async (id) => {
    try {
      const updatedNotes = audioNotes.map((note) =>
        note.id === id ? { ...note, title: editedTitle } : note
      );
      await AsyncStorage.setItem('audioNotes', JSON.stringify(updatedNotes));
      setAudioNotes(updatedNotes);
      setEditingId(null);
      setEditedTitle('');
    } catch (error) {
      console.error('Failed to edit audio note:', error);
      Alert.alert('Storage Error', 'Could not edit audio note.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Recordings</Text>

      {audioNotes.length === 0 ? (
        <Text style={styles.emptyState}>
          No recordings available. Start recording to add notes!
        </Text>
      ) : (
        <FlatList
          data={audioNotes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.audioItem}>
              {editingId === item.id ? (
                <TextInput
                  style={styles.editInput}
                  value={editedTitle}
                  onChangeText={setEditedTitle}
                  onBlur={() => handleEditNote(item.id)}
                  autoFocus
                />
              ) : (
                <TouchableOpacity
                  onPress={() => setSelectedAudioUri(item.uri)}
                  style={styles.recordingInfo}
                >
                  <Text style={styles.recordingTitle}>
                    {item.title || item.id}
                  </Text>
                  <Text style={styles.recordingDate}>{item.date}</Text>
                </TouchableOpacity>
              )}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => {
                    setEditingId(item.id);
                    setEditedTitle(item.title || '');
                  }}
                  style={styles.editButton}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteAudioNote(item.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 150 }}
        />
      )}

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
  emptyState: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
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
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  actions: { flexDirection: 'row', alignItems: 'center' },
  editButton: { marginRight: 10, padding: 8 },
  editButtonText: { color: '#007bff' },
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
