import React, { useEffect, useState, useRef } from 'react';
import { View, Button, StyleSheet, Dimensions, TouchableOpacity, Text, SafeAreaView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import getLocation from '../util/getLocation';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import Icon
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { FontAwesome } from 'react-native-vector-icons';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { shareAsync } from 'expo-sharing';
import CameraScan from '../CameraScan';

const GOOGLE_CLOUD_API_KEY = 'AIzaSyDy6DQJ1lr29xJPQ0DgagixGE5Tim5eJ90';
const GOOGLE_CLOUD_SPEECH_API_URL = 'https://speech.googleapis.com/v1/speech:recognize?key=AIzaSyDy6DQJ1lr29xJPQ0DgagixGE5Tim5eJ90';

const HomeScreen = () => {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [location, setLocation] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(null);

  const toggleCamera = () => {
    setShowCamera(!showCamera);
    console.log("Toggling camera, showCamera:", !showCamera);
  };

  const takePic = async () => {
    if (cameraRef.current) {
      const options = { quality: 1, base64: true, exif: false };
      const newPhoto = await cameraRef.current.takePictureAsync(options);
      setPhoto(newPhoto);
    }
  };

  if (photo) {
    // Photo preview and options to share, save, or discard
    return (
      <SafeAreaView style={styles.container}>
        <Image style={styles.preview} source={{ uri: photo.uri }} />
        <Button title="Share" onPress={() => shareAsync(photo.uri)} />
        <Button title="Save" onPress={() => MediaLibrary.saveToLibraryAsync(photo.uri)} />
        <Button title="Discard" onPress={() => setPhoto(null)} />
      </SafeAreaView>
    );
  }

  
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

      {/* {showCamera && (
        <Camera style={styles.camera} ref={cameraRef}>
          <View style={styles.cameraContent}>
            <TouchableOpacity onPress={takePic} style={styles.cameraButton}>
              <FontAwesome name="camera" size={40} color="white" />
            </TouchableOpacity>
          </View>
        </Camera>
      )} */}
    
      <View style={styles.container}>
        <TouchableOpacity onPress={toggleCamera} style={styles.cameraButton}>
          <Icon name="camera-alt" size={30} color="#FFF" />
          {showCamera && <CameraScan />}
        </TouchableOpacity>
      </View>

      
      <TouchableOpacity style={styles.micButton} onPress={handlePress}>
        <Icon name="mic" size={30} color="#FFF" />
      </TouchableOpacity>

      {/* {recordings.length > 0 && 
        <View style={styles.playButton}>
          <Button
            title="Play Last Recording"
            onPress={() =>
              playRecording(recordings[recordings.length - 1].file)
            }
          />
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  micButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "left",
    backgroundColor: "#007AFF", // Change as per your preference
    borderRadius: 30,
    left: 20,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cameraButton: {
    position: "absolute",
    backgroundColor: "#007AFF",
    bottom: 20,
    right: 10,
    padding: 20,
    borderRadius: 30,
   
  },
});

export default HomeScreen;