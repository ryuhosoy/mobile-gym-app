import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import StarRating from '../components/StarRating';

interface GymDetails {
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: { 
    weekday_text: string[];
    open_now: boolean;
  };
}

export default function GymDetailScreen() {
  const { id } = useLocalSearchParams();
  const [details, setDetails] = useState<GymDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGymDetails();
  }, [id]);

  const fetchGymDetails = async () => {
    try {
      const params = {
        place_id: id as string,
        fields: 'name,formatted_address,rating,user_ratings_total,formatted_phone_number,website,opening_hours',
        language: 'ja',
        key: 'AIzaSyD0C3aL0m4on5-6w5H3W1NawXPGHByZOjg'
      };

      const url = 'https://maps.googleapis.com/maps/api/place/details/json';
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${url}?${queryString}`);
      const data = await response.json();

      if (data.status === 'OK') {
        setDetails(data.result);
      }
    } catch (error) {
      console.error('詳細情報の取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (details?.formatted_phone_number) {
      Linking.openURL(`tel:${details.formatted_phone_number}`);
    }
  };

  const handleWebsite = () => {
    if (details?.website) {
      Linking.openURL(details.website);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B4DE6" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.container}>
        <Text>情報を取得できませんでした</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{details.name}</Text>
        <Text style={styles.address}>{details.formatted_address}</Text>
        
        {details.rating && (
          <View style={styles.ratingContainer}>
            <StarRating 
              rating={details.rating} 
              totalReviews={details.user_ratings_total} 
            />
            <Text style={styles.openStatus}>
              {details.opening_hours?.open_now ? "営業中" : "営業時間外"}
            </Text>
          </View>
        )}

        {details.opening_hours?.weekday_text && (
          <>
            <Text style={styles.sectionTitle}>営業時間</Text>
            {details.opening_hours.weekday_text.map((text, index) => (
              <Text key={index} style={styles.info}>{text}</Text>
            ))}
          </>
        )}

        <View style={styles.buttonContainer}>
          {details.formatted_phone_number && (
            <TouchableOpacity style={styles.button} onPress={handleCall}>
              <Text style={styles.buttonText}>電話する</Text>
            </TouchableOpacity>
          )}
          {details.website && (
            <TouchableOpacity 
              style={[styles.button, styles.websiteButton]} 
              onPress={handleWebsite}
            >
              <Text style={styles.buttonText}>ウェブサイトを見る</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rating: {
    fontSize: 16,
    color: '#FFB100',
    fontWeight: 'bold',
  },
  openStatus: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 15,
  },
  button: {
    flex: 1,
    backgroundColor: '#6B4DE6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  websiteButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 