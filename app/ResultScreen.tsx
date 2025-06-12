import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getAdditivesFromImage, FoodAdditive } from '../utils/ocr';

export default function ResultScreen() {
  const { image } = useLocalSearchParams();
  const [identifiedAdditives, setIdentifiedAdditives] = useState<FoodAdditive[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      if (typeof image === 'string') {
        setLoading(true);
        setError(null);
        try {
          const additives = await getAdditivesFromImage(image);
          console.log('Identified additives:', additives);
          
          setIdentifiedAdditives(additives);
          setLoading(false);
        } catch (err) {
          console.error('Processing error:', err);
          setError('An error occurred during processing.');
          setLoading(false);
        }
      } else {
        setError('No image data received.');
        setLoading(false);
      }
    };
    processImage();
  }, [image]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Scan Result</Text>
      {typeof image === 'string' && image ? (
        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
      ) : (
        <Text>No image to display.</Text>
      )}

      <Text style={styles.sectionTitle}>Identified Additives:</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : (
        identifiedAdditives.length > 0 ? (
          <View style={{ width: '100%' }}>
            {identifiedAdditives.map((additive) => (
              <View key={additive.id} style={styles.additiveCard}>
                <Text style={styles.additiveTitle}>{additive.e_code} - {additive.name}</Text>
                <Text style={styles.additiveDesc}>{additive.category}</Text>
                <Text style={styles.additiveRisk}>Risk Level: {additive.safetyValue}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text>No additives identified or processing failed.</Text>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
    textAlign: 'left',
  },
  additiveCard: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  additiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  additiveDesc: {
    fontSize: 14,
    marginBottom: 4,
  },
  additiveRisk: {
    fontSize: 13,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  }
});