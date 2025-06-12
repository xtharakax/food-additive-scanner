import React, { useState } from 'react';
import { View, Button, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Take photo using camera
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is needed to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      // You can call OCR here or after user confirms
      router.push({
        pathname: '/ResultScreen',
        params: { image: `data:image/jpeg;base64,${result.assets[0].base64}` },
      });
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Media library permission is needed to upload an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
      router.push({
        pathname: '/ResultScreen',
        params: { image: `data:image/jpeg;base64,${result.assets[0].base64}` },
      });
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="📸 Take Photo" onPress={takePhoto} />
      <View style={{ height: 16 }} />
      <Button title="🖼️ Upload Image" onPress={pickImage} />
      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      {image && (
        <Image source={{ uri: image }} style={{ width: 200, height: 200, marginTop: 20 }} />
      )}
    </View>
  );
} 