import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, TextInput } from 'react-native-paper';


function CreateAccount() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = () => {
    navigation.navigate("Welcome");
    Alert.alert("Your account has been created!");

  }


  return (
    <View style={styles.container}>
      <Image source={require("../logo.png")} style={styles.logo} />
      <TextInput
        style={styles.textboxes}
        autoCapitalize="none"
        placeholder="Email"
        onChangeText={setEmail} // Corrected from setUsername to setEmail
        value={email} // Corrected from username to email
      />
      <TextInput
        style={styles.textboxes}
        autoCapitalize="none"
        secureTextEntry={true}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
      />

      <Button mode="contained" onPress={handleSubmit} style={styles.button}>
        Create Account
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    marginTop: 10,
  },
  textboxes: {
    marginBottom: 40,
    
  },
  button: {
    marginTop: 15,
    paddingVertical: 8,
  },
  logo: {
    width: 340,
    height: 390,
    resizeMode: "contain",
    marginBottom: 30,
  },
});

export default CreateAccount    