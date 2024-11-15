import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function RecorderControls({ saveAudioNote }) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { status } = await Audio.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        Alert.alert('Permission Error', 'Failed to get permission');
        setHasPermission(false);
      }
    };

    checkPermissions();
  }, []);

  const startRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'You need to grant microphone permissions to record audio.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const recordingInstance = new Audio.Recording();
      await recordingInstance.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recordingInstance.startAsync();

      setRecording(recordingInstance);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        saveAudioNote({
          id: new Date().toISOString(),
          uri,
          date: new Date().toLocaleString(),
        });
      } else {
        Alert.alert('Error', 'No audio recorded');
      }
      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording.");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={isRecording ? stopRecording : startRecording}
        style={[styles.recordButton, isRecording ? styles.stopButton : styles.startButton]}
      >
        <FontAwesome name={isRecording ? 'stop' : 'microphone'} size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  recordButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: '#ff007f',
  },
  stopButton: {
    backgroundColor: '#ff0000',
  },
});
