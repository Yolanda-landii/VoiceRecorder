import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AudioPlayer({ uri }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (uri) {
      loadAudio();
      getAudioState();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);

  // Load audio file from URI and set up the audio player
  const loadAudio = async () => {
    if (!uri) {
      Alert.alert("Error", "Audio file not found.");
      return;
    }

    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading audio", error);
      Alert.alert("Error", "Failed to load audio.");
      setIsLoading(false);
    }
  };

  const storeAudioState = async (state) => {
    try {
      await AsyncStorage.setItem('audioPlaybackState', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save audio state", error);
    }
  };

  const getAudioState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('audioPlaybackState');
      if (savedState) {
        const { uri: savedUri, position: savedPosition, isPlaying: savedIsPlaying } = JSON.parse(savedState);
        if (savedUri === uri) {
          setPosition(savedPosition);
          setIsPlaying(savedIsPlaying);
          if (savedIsPlaying) {
            playAudio();
          }
        }
      }
    } catch (error) {
      console.error("Failed to load audio state", error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) {
      console.warn("Audio is still loading.");
      return;
    }

    if (!sound) {
      console.error("Sound is not loaded.");
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      storeAudioState({
        uri,
        position,
        isPlaying: !isPlaying,
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Failed to play audio.");
    }
  };

  const handleSliderChange = async (value) => {
    if (sound) {
      const seekPosition = value * duration;
      await sound.setPositionAsync(seekPosition);
      setPosition(seekPosition);
      storeAudioState({
        uri,
        position: seekPosition,
        isPlaying,
      });
    }
  };

  const formatTime = (millis) => {
    if (isNaN(millis) || millis <= 0) return '00:00'; 
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Audio Player</Text>
      <Slider
        style={styles.slider}
        value={duration > 0 ? position / duration : 0} // Only update slider when duration is valid
        onValueChange={handleSliderChange}
        minimumTrackTintColor="#ff007f"
        maximumTrackTintColor="#ffffff"
        thumbTintColor="#ffffff"
      />
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(position)}</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
      <TouchableOpacity
        onPress={handlePlayPause}
        style={styles.playButton}
        disabled={isLoading}
      >
        <Text style={styles.playButtonText}>
          {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
    marginTop: 50,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  header: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 5,
  },
  time: {
    color: '#fff',
  },
  playButton: {
    backgroundColor: '#ff007f',
    padding: 10,
    borderRadius: 50,
    marginTop: 5,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

