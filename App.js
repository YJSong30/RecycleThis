import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, Button, Image, TouchableOpacity, Icon } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'expo-camera';
import HomeScreen from './screens/HomeScreen';
import { shareAsync } from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { FontAwesome } from 'react-native-vector-icons';

export default function App() {
  
  return <HomeScreen></HomeScreen>  
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
  }
)
