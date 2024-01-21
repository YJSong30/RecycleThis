import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { Button, TextInput, ActivityIndicator, MD2Colors } from 'react-native-paper';


function Login() {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      <TextInput autoCapitalize='none' placeholder='Email' onChangeText={(username) => setUsername(username)} value={username}></TextInput>
      <TextInput autoCapitalize='none' placeholder='Password' onChangeText={(password) => setPassword(password)} value={password}></TextInput>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1, // Takes up the whole screen
      justifyContent: 'center', // Vertically aligns children in the middle
      alignItems: 'center', // Horizontally aligns children in the middle
    },
    text: {
      fontSize: 18, // Adjust text size
      marginTop: 20, // Adjust the top margin to push it down
    }
  });


export default Login;