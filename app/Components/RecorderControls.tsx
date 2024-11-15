import React, { useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

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
          id: new Date().toISOString(), // You could use a unique ID here
          path: uri,
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
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : startRecording}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 20 },
});
