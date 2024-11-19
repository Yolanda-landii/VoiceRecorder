import React, { useEffect, useState } from 'react';
import { View, Alert, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function RecorderControls({ saveAudioNote }) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // Timer state

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

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isRecording) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer!);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

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
      setElapsedTime(0); // Reset the timer
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
          duration: elapsedTime, // Save duration
        });
      } else {
        Alert.alert('Error', 'No audio recorded');
      }

      setRecording(null);
      setIsRecording(false);
      setElapsedTime(0); // Reset the timer
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording.");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
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
    marginVertical: -10,
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
