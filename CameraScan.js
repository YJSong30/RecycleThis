import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, SafeAreaView, Button, Image  } from 'react-native';
import { Camera, CameraType, requestCameraPermissionsAsync, getCameraPermissionsAsync,  } from 'expo-camera';
import { FontAwesome } from 'react-native-vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { shareAsync } from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';


const CameraScan = () => {
  let cameraRef = useRef();
  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  const [photo, setPhoto] = useState();

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === "granted");
      setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>;
  } else if (!hasCameraPermission) {
    return (
      <Text>
        Permission for camera not granted. Please change this in settings.
      </Text>
    );
  }

  let takePic = async () => {
    let options = {
      quality: 1,
      base64: true,
      exif: false,
    };

    let newPhoto = await cameraRef.current.takePictureAsync(options);
    setPhoto(newPhoto);
  };

  if (photo) {
    let sharePic = () => {
      shareAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    let savePhoto = () => {
      MediaLibrary.saveToLibraryAsync(photo.uri).then(() => {
        setPhoto(undefined);
      });
    };

    return (
      <SafeAreaView style={styles.container}>
        <Image
          style={styles.preview}
          source={{ uri: "data:image/jpg;base64," + photo.base64 }}
        />
        <Button title="Share" onPress={sharePic} />
        {hasMediaLibraryPermission ? (
          <Button title="Save" onPress={savePhoto} />
        ) : undefined}
        <Button title="Discard" onPress={() => setPhoto(undefined)} />
      </SafeAreaView>
    );
  }

  return (
    <Camera style={styles.camera} ref={cameraRef}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.takePicButton} onPress={takePic}>
          <Text style={styles.takePicText}>Take Pic</Text>
        </TouchableOpacity>
      </View>
    </Camera>
  );
};

  
//   const [type, setType] = useState(CameraType.back);
//   const [permission, requestPermission] = Camera.useCameraPermissions();

//   function toggleCameraType() {
//     setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
//   }

//   useEffect(() => {
//     (async () => {
//       if (!permission) {
//         await requestPermission();
//       }
//     })();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <Camera>
//         <View
//           style={{
//             flex: 1,
//             backgroundColor: 'transparent',
//             justifyContent: 'flex-end',
//             alignItems: 'center',
//             marginBottom: 20,
//           }}>
//           <TouchableOpacity onPress={toggleCameraType}>
//             <FontAwesome name="camera" size={50} color="white" />
//           </TouchableOpacity>
//         </View>
//       </Camera>
//     </View>
//   );
// };

const styles = StyleSheet.create({
  camera: {
    flex: 1,
    width: '100%', 
    height: '100%', 
  },
  takePicButton: {
    backgroundColor: '#007AFF',
    borderRadius: 30,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, 
  },
  preview: {
    width: '200%', 
    height: '200%', 
    position: 'absolute', 
  },
});

export default CameraScan;