import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { get, getDatabase, push, ref, set, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import StarRating from "../components/StarRating";
import { app } from "../config/firebase";
import { useLocation } from "../contexts/LocationContext";

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

interface Review {
  rating: number;
  comment: string;
  userId: string;
  id: string;
}

interface UserProfile {
  name: string;
  gender: string;
}

interface Equipment {
  id: string;
  name: string;
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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [userProfiles, setUserProfiles] = useState<{
    [key: string]: UserProfile;
  }>({});
  const [equipmentName, setEquipmentName] = useState("");
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

  useEffect(() => {
    fetchGymDetails();
    fetchReviews();
    console.log("id", id);
  }, [id]);

  useEffect(() => {
    if (userLocation && details?.geometry) {
      fetchDistanceAndTime();
    }
  }, [userLocation, details]);

  useEffect(() => {
    console.log("レビューが更新されました:", reviews);
  }, [reviews]);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      try {
        const userIds = reviews.map((review) => review.userId);
        const profiles: { [key: string]: UserProfile } = {};

        for (const userId of userIds) {
          const userRef = ref(db, `users/${userId}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            profiles[userId] = snapshot.val();
          }
        }

        setUserProfiles(profiles);
      } catch (error) {
        console.error("ユーザープロファイルの取得に失敗しました: ", error);
      }
    };

    fetchUserProfiles();
  }, [reviews]);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchGymDetails = async () => {
    try {
      const params = {
        place_id: id as string,
        fields:
          "name,formatted_address,rating,user_ratings_total,formatted_phone_number,website,opening_hours,geometry",
        language: "ja",
        key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY!,
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
        key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY!,
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

  const fetchReviews = async () => {
    try {
      const reviewsRef = ref(db, `reviews/${id}`);
      const snapshot = await get(reviewsRef);
      console.log("snapshot in fetchReviews", snapshot);
      if (snapshot.exists()) {
        setReviews(Object.values(snapshot.val()));
        console.log("setReviewsが更新されました");
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("レビューの取得に失敗しました:", error);
    }
  };

  const submitReview = async () => {
    if (!auth.currentUser) return;
    if (newReview.rating === 0 || newReview.comment.trim() === "") {
      Alert.alert("エラー", "評価とコメントを入力してください。");
      return;
    }
    try {
      const reviewRef = push(ref(db, `reviews/${id}`));
      const reviewId = reviewRef.key; // 一意のIDを取得

      if (!reviewId) return;

      await set(reviewRef, {
        id: reviewId, // IDを保存
        userId: auth.currentUser.uid,
        rating: newReview.rating,
        comment: newReview.comment,
        timestamp: Date.now(),
      });
      setNewReview({ rating: 0, comment: "" });
      fetchReviews();
    } catch (error) {
      console.error("レビューの投稿に失敗しました:", error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    if (!auth.currentUser) return;
    try {
      console.log("reviewId", reviewId);
      console.log("reviews/${id}/${reviewId}", `reviews/${id}/${reviewId}`);
      const reviewRef = ref(db, `reviews/${id}/${reviewId}`);
      const snapshot = await get(reviewRef);
      if (snapshot.exists() && snapshot.val().userId === auth.currentUser.uid) {
        await set(reviewRef, null);
        fetchReviews();
        console.log("レビュー投稿後にfetchReviewsを呼び出しています");
      } else {
        console.error("You can only delete your own reviews.");
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const addEquipment = async () => {
    if (!auth.currentUser) return;
    if (equipmentName.trim() === "") {
      Alert.alert("エラー", "器具名を入力してください。");
      return;
    }

    try {
      const equipmentRef = push(ref(db, `gyms/${id}/equipment`));
      const equipmentId = equipmentRef.key;

      if (!equipmentId) return;

      await set(equipmentRef, {
        id: equipmentId,
        name: equipmentName,
        userId: auth.currentUser.uid,
        timestamp: Date.now(),
      });

      setEquipmentName("");
      fetchEquipment();
    } catch (error) {
      console.error("器具の登録に失敗しました:", error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const equipmentRef = ref(db, `gyms/${id}/equipment`);
      const snapshot = await get(equipmentRef);
      if (snapshot.exists()) {
        setEquipmentList(Object.values(snapshot.val()));
      } else {
        setEquipmentList([]);
      }
    } catch (error) {
      console.error("器具の取得に失敗しました:", error);
    }
  };

  const deleteEquipment = async (equipmentId: string) => {
    if (!auth.currentUser) return;
    try {
      const equipmentRef = ref(db, `gyms/${id}/equipment/${equipmentId}`);
      await set(equipmentRef, null);
      fetchEquipment();
    } catch (error) {
      console.error("器具の削除に失敗しました:", error);
    }
  };

  const userHasReview = reviews.some(review => review.userId === auth.currentUser?.uid);

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
        <Text style={styles.sectionTitle}>トレーニング器具を追加</Text>
        <TextInput
          style={styles.input}
          placeholder="器具名を入力してください"
          value={equipmentName}
          onChangeText={setEquipmentName}
        />
        <TouchableOpacity style={styles.button} onPress={addEquipment}>
          <Text style={styles.buttonText}>追加</Text>
        </TouchableOpacity>

        {equipmentList.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>トレーニング器具</Text>
            {equipmentList.map((equipment) => (
              <View key={equipment.id} style={styles.infoContainer}>
                <Text style={styles.info}>{equipment.name}</Text>
                <TouchableOpacity onPress={() => deleteEquipment(equipment.id)}>
                  <Text style={styles.deleteButton}>削除</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
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
        <Text style={styles.info}>
          料金、プランはウェブサイトからご確認下さい。
        </Text>

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

        {reviews.length > 0 && (
          <View style={styles.sectionTitle}>
            <Text style={styles.sectionTitle}>ユーザーレビュー</Text>
          </View>
        )}
        {reviews.map((review) => (
          <View key={review.id} style={styles.reviewContainer}>
            <Text style={styles.info}>
              投稿者: {userProfiles[review.userId]?.name || "不明"} (
              {userProfiles[review.userId]?.gender || "不明"})
            </Text>
            <StarRating rating={review.rating} totalReviews={1} />
            <Text style={styles.reviewComment}>{review.comment}</Text>
            {review.userId === auth.currentUser?.uid && (
              <TouchableOpacity onPress={() => deleteReview(review.id)}>
                <Text style={styles.deleteButton}>削除</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {!userHasReview && (
          <View style={styles.reviewForm}>
            <Text style={styles.sectionTitle}>レビューを投稿する</Text>
            <StarRating
              rating={newReview.rating}
              totalReviews={5}
              onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
            />
            <TextInput
              style={styles.reviewInput}
              placeholder="コメントを入力してください"
              value={newReview.comment}
              onChangeText={(text) =>
                setNewReview({ ...newReview, comment: text })
              }
            />
            <TouchableOpacity style={styles.button} onPress={submitReview}>
              <Text style={styles.buttonText}>投稿する</Text>
            </TouchableOpacity>
          </View>
        )}
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
  reviewContainer: {
    backgroundColor: "#F0F0F0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  reviewComment: {
    fontSize: 14,
    color: "#333",
    marginTop: 5,
  },
  reviewForm: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
  },
  reviewInput: {
    height: 100,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
    color: "#333",
  },
  deleteButton: {
    color: "#FF0000",
    fontSize: 14,
    marginTop: 10,
    textAlign: "right",
  },
  input: {
    height: 50,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
