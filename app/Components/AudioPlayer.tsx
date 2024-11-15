import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

export default function AudioPlayer({ uri }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (uri) {
      loadAudio();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [uri]);
  

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading audio", error);
      Alert.alert("Error", "Failed to load audio.");
      setIsLoading(false);
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
    if (sound && isPlaying) {
      await sound.pauseAsync();
    } else if (sound && !isPlaying) {
      try {
        await sound.playAsync();
      } catch (error) {
        console.error("Error playing audio:", error);
        Alert.alert("Error", "Failed to play audio.");
      }
    }
  };
  
  
  

  const handleSliderChange = async (value) => {
    if (sound) {
      const seekPosition = value * duration;
      await sound.setPositionAsync(seekPosition);
    }
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Audio Player</Text>
      <Slider
        style={styles.slider}
        value={position / duration || 0}
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
    padding: 20,
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
    marginTop: 10,
  },
  time: {
    color: '#fff',
  },
  playButton: {
    backgroundColor: '#ff007f',
    padding: 10,
    borderRadius: 50,
    marginTop: 20,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});
