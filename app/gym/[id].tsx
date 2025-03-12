import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import StarRating from "../components/StarRating";
import MapView, { Marker } from "react-native-maps";
import { useLocation } from "../contexts/LocationContext";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, push, set, update } from "firebase/database";
import { app } from "../config/firebase";
import { useRouter } from "expo-router";

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
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface DistanceInfo {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
}

export default function GymDetailScreen() {
  const { id } = useLocalSearchParams();
  const [details, setDetails] = useState<GymDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { userLocation } = useLocation();
  const [distanceInfo, setDistanceInfo] = useState<DistanceInfo | null>(null);
  const router = useRouter();
  const auth = getAuth(app);
  const db = getDatabase(app);

  useEffect(() => {
    fetchGymDetails();
  }, [id]);

  useEffect(() => {
    if (userLocation && details?.geometry) {
      fetchDistanceAndTime();
    }
  }, [userLocation, details]);

  const fetchGymDetails = async () => {
    try {
      const params = {
        place_id: id as string,
        fields:
          "name,formatted_address,rating,user_ratings_total,formatted_phone_number,website,opening_hours,geometry",
        language: "ja",
        key: "AIzaSyD0C3aL0m4on5-6w5H3W1NawXPGHByZOjg",
      };

      const url = "https://maps.googleapis.com/maps/api/place/details/json";
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${url}?${queryString}`);
      const data = await response.json();

      if (data.status === "OK") {
        console.log("detail data", data);
        setDetails(data.result);
      }
    } catch (error) {
      console.error("詳細情報の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDistanceAndTime = async () => {
    if (!userLocation || !details?.geometry) return;

    try {
      const params = {
        origins: `${userLocation.coords.latitude},${userLocation.coords.longitude}`,
        destinations: `${details.geometry.location.lat},${details.geometry.location.lng}`,
        mode: "walking",
        language: "ja",
        key: "AIzaSyD0C3aL0m4on5-6w5H3W1NawXPGHByZOjg",
      };

      const url = "https://maps.googleapis.com/maps/api/distancematrix/json";
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${url}?${queryString}`);
      const data = await response.json();

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        setDistanceInfo(data.rows[0].elements[0]);
      }
    } catch (error) {
      console.error("距離と時間の取得に失敗しました:", error);
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

  const createChatRoom = async () => {
    if (!auth.currentUser || !details) return;

    try {
      const newRoomRef = push(ref(db, "chats"));
      const roomId = newRoomRef.key;

      if (!roomId) return;

      const timestamp = Date.now();

      const updates: { [key: string]: any } = {};
      updates[`/chats/${roomId}`] = {
        gymId: id,
        gymName: details.name,
        title: details.name,
        lastMessage: "チャットルームが作成されました",
        lastMessageTime: timestamp,
        timestamp: timestamp,
      };

      updates[`/members/${roomId}/${auth.currentUser.uid}`] = true;

      await update(ref(db), updates);

      router.push(`../chat/${roomId}`);
    } catch (error) {
      console.error("チャットルームの作成に失敗しました:", error);
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

        {userLocation && distanceInfo && (
          <View style={styles.distanceContainer}>
            <Text style={styles.distanceText}>
              現在地から徒歩{distanceInfo.duration.text}（
              {distanceInfo.distance.text}）
            </Text>
          </View>
        )}

        {details.geometry && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
            >
              {userLocation && (
                <Marker
                  coordinate={{
                    latitude: userLocation.coords.latitude,
                    longitude: userLocation.coords.longitude,
                  }}
                  title="現在地"
                  pinColor="blue"
                />
              )}
              <Marker
                coordinate={{
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                }}
                title={details.name}
                description={details.formatted_address}
              />
            </MapView>
          </View>
        )}

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
              <Text key={index} style={styles.info}>
                {text}
              </Text>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>料金・プラン情報</Text>
        <Text style={styles.info}>料金、プランはウェブサイトからご確認下さい。</Text>

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
          <TouchableOpacity
            style={[styles.button, styles.chatButton]}
            onPress={createChatRoom}
          >
            <Text style={styles.buttonText}>チャットで問い合わせ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  contentContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rating: {
    fontSize: 16,
    color: "#FFB100",
    fontWeight: "bold",
  },
  openStatus: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 10,
    marginTop: 30,
  },
  button: {
    backgroundColor: "#6B4DE6",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  websiteButton: {
    backgroundColor: "#4CAF50",
  },
  chatButton: {
    backgroundColor: "#FF6B6B",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  mapContainer: {
    height: 200,
    marginVertical: 15,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  distanceContainer: {
    backgroundColor: "#F5F5F5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
