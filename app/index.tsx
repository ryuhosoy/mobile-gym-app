import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import * as Location from 'expo-location';
import StarRating from './components/StarRating';

interface Gym {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
  photos?: Array<{
    photo_reference: string;
  }>;
  opening_hours?: {
    open_now: boolean;
  };
}

export default function GymSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchNearbyGyms();
  }, []);

  const searchNearbyGyms = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('位置情報の許可が必要です');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const params = {
        location: `${location.coords.latitude},${location.coords.longitude}`,
        radius: "5000",
        type: "gym",
        language: "ja",
        key: "AIzaSyD0C3aL0m4on5-6w5H3W1NawXPGHByZOjg"
      };

      const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${url}?${queryString}`);
      const data = await response.json();
      
      if (data.status === "OK") {
        setGyms(data.results);
      }
    } catch (error) {
      console.error("ジムの検索中にエラーが発生しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    setLoading(true);

    try {
      const params = {
        query: `${text} ジム`,
        language: "ja",
        key: "AIzaSyD0C3aL0m4on5-6w5H3W1NawXPGHByZOjg"
      };

      const url = "https://maps.googleapis.com/maps/api/place/textsearch/json";
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${url}?${queryString}`);
      const data = await response.json();

      if (data.status === "OK") {
        setGyms(data.results);
      }
    } catch (error) {
      console.error("検索中にエラーが発生しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderGymItem = ({ item }: { item: Gym }) => (
    <Link href={`/gym/${item.place_id}`} asChild>
      <TouchableOpacity style={styles.gymCard}>
        <View style={styles.gymInfo}>
          <Text style={styles.gymName}>{item.name}</Text>
          <Text style={styles.gymAddress}>{item.formatted_address}</Text>
          <View style={styles.ratingContainer}>
            {item.rating && (
              <StarRating 
                rating={item.rating} 
                totalReviews={item.user_ratings_total} 
              />
            )}
            <Text style={styles.openStatus}>
              {item.opening_hours?.open_now ? "営業中" : "営業時間外"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="地域名やジム名で検索"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loading} size="large" color="#6B4DE6" />
      ) : (
        <FlatList
          data={gyms}
          renderItem={renderGymItem}
          keyExtractor={(item) => item.place_id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  searchContainer: {
    padding: 15,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    height: 40,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  loading: {
    marginTop: 20,
  },
  listContainer: {
    padding: 15,
  },
  gymCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gymInfo: {
    padding: 15,
  },
  gymName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  gymAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  openStatus: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
});
