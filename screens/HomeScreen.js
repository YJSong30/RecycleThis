import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import getLocation from '../util/getLocation';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Icon
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const GOOGLE_CLOUD_API_KEY = 'AIzaSyDy6DQJ1lr29xJPQ0DgagixGE5Tim5eJ90';
const GOOGLE_CLOUD_SPEECH_API_URL = 'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyDy6DQJ1lr29xJPQ0DgagixGE5Tim5eJ90';

const HomeScreen = () => {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [location, setLocation] = useState(null);

  const convertAudioToBase64 = async (uri) => {
    try {
      const audioData = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      return audioData;
    } catch (error) {
      console.error("Error converting audio to Base64");
    }
  };

  const sendAudioToSpeechToTextAPI = async (base64Audio) => {
    try {
      const response = await axios.post(
        GOOGLE_CLOUD_SPEECH_API_URL,
        {
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 44100,
            languageCode: 'en-US',
          },
          audio: {
            content: base64Audio,
          },
        }
      );
  
      if (response.data && response.data.results) {
        // Process the response
        const transcription = response.data.results
          .map(result => result.alternatives[0].transcript)
          .join('\n');
        return transcription;
      } else {
        console.log('No transcription results.');
        return null;
      }
    } catch (error) {
      console.error('Error calling Google Speech-to-Text API:', error);
    }
  };
  

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const recording = new Audio.Recording();

        try {
          await recording.prepareToRecordAsync({
            android: {
              extension: '.wav',
              outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
              audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
              sampleRate: 44100,
              numberOfChannels: 1,
              bitRate: 128000,
            },
            ios: {
              extension: '.wav',
              audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
              sampleRate: 44100,
              numberOfChannels: 1,
              bitRate: 128000,
              linearPCMBitDepth: 16,
              linearPCMIsBigEndian: false,
              linearPCMIsFloat: false,
            },
          });
          await recording.startAsync();
          setRecording(recording);
          console.log("Recording started");
        } catch (error) {
          console.log("Failed to start recording:", error);
        }
      }
    } catch (error) {
      console.log("Permission for audio recording not granted:", error);
    }
  }

  async function stopRecording() {
    setRecording(undefined);

    await recording.stopAndUnloadAsync();
    console.log("recording stopped")
    let allRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    allRecordings.push({
      sound: sound,
      file: recording.getURI(),
    });

    setRecordings(allRecordings);
    const uri = recording.getURI();
    const base64Audio = await convertAudioToBase64(uri);

    const transcription = await sendAudioToSpeechToTextAPI(base64Audio);
    console.log(transcription);
    console.log("all recordings: ", allRecordings)
  }

  function clearRecordings() {
    setRecordings([]);
  }


  useEffect(() => {
    const fetchLocation = async () => {
      const loc = await getLocation();
      setLocation(loc);
    };

    fetchLocation();
  }, []);

  const handlePress = async () => {
    // Check and request permission
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission for audio recording not granted");
      return;
    }

    // If permission is granted, start or stop recording based on the current state
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }

    console.log("Pressed");
  };

  const playRecording = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: uri });
      await sound.playAsync();
    } catch (error) {
      console.error("Couldn't play the recording. Error:", error);
    }
  };

  return (
    <View style={styles.container}>

      {location && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title={"Your Location"}
          />
        </MapView>
      )}

      {/* Circular Button with Microphone Icon */}
      <TouchableOpacity style={styles.micButton} onPress={handlePress}>
        <Icon name="mic" size={30} color="#FFF" />
      </TouchableOpacity>
      {recordings.length > 0 && (
        <View style={styles.playButton}>
          <Button
            title="Play Last Recording"
            onPress={() => playRecording(recordings[recordings.length - 1].file)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  micButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#007AFF', // Change as per your preference
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  playButton: {
    position: 'absolute',
    paddingTop: 50,

  }


});

export default HomeScreen;