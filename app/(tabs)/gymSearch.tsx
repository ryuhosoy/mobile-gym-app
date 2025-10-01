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
  Modal,
  Dimensions,
} from "react-native";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import StarRating from "../components/StarRating";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocation } from "../contexts/LocationContext";
import RNPickerSelect from "react-native-picker-select";

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
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

type SortOption = "距離" | "評価" | "レビュー数";
type FilterOption = "全て" | "営業中" | "高評価" | "レビュー多数" | "24時間営業";

export default function gymSearch({ route }: { route: any }) {
  const { userLocation } = useLocation();
  const { searchQuery } = route.params || {};
  const [searchText, setSearchText] = useState(searchQuery || '');
  const [allGyms, setAllGyms] = useState<Gym[]>([]);
  const [filteredGyms, setFilteredGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>("距離");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>(["全て"]);
  const [tempFilters, setTempFilters] = useState<FilterOption[]>(["全て"]);
  const [showMap, setShowMap] = useState(false);
  const mapRef = React.useRef<MapView>(null);

  console.log("activeFilters", activeFilters);
  console.log("filteredGyms", filteredGyms);
  console.log("searchText", searchText);

  const sortOptions: SortOption[] = ["距離", "評価", "レビュー数"];
  const filterOptions: FilterOption[] = [
    "全て",
    "営業中",
    "高評価",
    "レビュー多数",
    "24時間営業",
  ];

  useEffect(() => {
    console.log("searchQueryが変わりました", searchQuery);
    console.log("searchQuery", searchQuery);
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    searchNearbyGyms();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(allGyms);
    const sorted = sortGyms(filtered, currentSort);
    setFilteredGyms(sorted);
  }, [activeFilters, currentSort, allGyms]);

  const calculateDistance = (gym: Gym) => {
    if (!userLocation) return Infinity;

    const R = 6371; // 地球の半径（km）
    const lat1 = userLocation.coords.latitude;
    const lon1 = userLocation.coords.longitude;
    const lat2 = gym.geometry.location.lat;
    const lon2 = gym.geometry.location.lng;

    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const sortGyms = (gyms: Gym[], sortType: SortOption) => {
    const sortedGyms = [...gyms];
    switch (sortType) {
      case "距離":
        return sortedGyms.sort(
          (a, b) => calculateDistance(a) - calculateDistance(b)
        );
      case "評価":
        return sortedGyms.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "レビュー数":
        return sortedGyms.sort(
          (a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0)
        );
      default:
        return sortedGyms;
    }
  };

  const handleSort = (option: SortOption) => {
    setCurrentSort(option);
    setSortModalVisible(false);
  };

  const applyFilters = (gyms: Gym[]) => {
    if (activeFilters.includes("全て")) return gyms;

    return gyms.filter((gym) => {
      return activeFilters.every((filter) => {
        switch (filter) {
          case "営業中":
            return gym.opening_hours?.open_now === true;
          case "高評価":
            return (gym.rating || 0) >= 4.0;
          case "レビュー多数":
            return (gym.user_ratings_total || 0) >= 30;
          case "24時間営業":
            return true; // APIからの結果に既に含まれている前提
          default:
            return true;
        }
      });
    });
  };

  const handleFilter = (option: FilterOption) => {
    if (option === "全て") {
      setTempFilters(["全て"]);
    } else {
      const newFilters = tempFilters.filter((f) => f !== "全て");
      if (newFilters.includes(option)) {
        setTempFilters(newFilters.filter((f) => f !== option));
      } else {
        setTempFilters([...newFilters, option]);
      }
    }
  };

  const applyTempFilters = () => {
    setActiveFilters(tempFilters);
    setFilterModalVisible(false);
    if (tempFilters.includes("24時間営業")) {
      handleSearch(searchText);
    }
  };

  const cancelTempFilters = () => {
    setTempFilters(activeFilters);
    setFilterModalVisible(false);
  };

  const searchNearbyGyms = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("位置情報の許可が必要です");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});

      const params = {
        location: `${location.coords.latitude},${location.coords.longitude}`,
        radius: "5000",
        type: "gym",
        language: "ja",
        key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY!,
      };

      const url =
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${url}?${queryString}`);
      const data = await response.json();

      if (data.status === "OK") {
        setAllGyms(data.results);
      }
    } catch (error) {
      console.error("ジムの検索中にエラーが発生しました:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchText(text);
    setLoading(true);

    try {
      const query = activeFilters.includes("24時間営業") ? 
        `${text} ジム 24時間` : 
        `${text} ジム`;
        
      const params = {
        query: query,
        language: "ja",
        key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY!,
      };

      const url = "https://maps.googleapis.com/maps/api/place/textsearch/json";
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${url}?${queryString}`);
      const data = await response.json();

      if (data.status === "OK") {
        setAllGyms(data.results);
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

  const moveToCurrentLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        1000
      ); // 1000msかけてアニメーション
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, showMap && styles.searchInputDisabled]}
          placeholder="地域名やジム名で検索"
          value={searchText}
          onChangeText={handleSearch}
          editable={!showMap}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            setTempFilters(activeFilters);
            setFilterModalVisible(true);
          }}
          disabled={showMap}
        >
          <Text
            style={[
              styles.filterButtonText,
              showMap && styles.buttonTextDisabled,
            ]}
          >
            絞込み
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, showMap && styles.buttonDisabled]}
          onPress={() => setSortModalVisible(true)}
          disabled={showMap}
        >
          <Text
            style={[
              styles.sortButtonText,
              showMap && styles.buttonTextDisabled,
            ]}
          >
            {currentSort}順
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.mapToggleButton}
        onPress={() => setShowMap(!showMap)}
      >
        <Text style={styles.mapToggleButtonText}>
          {showMap ? "リスト表示" : "マップ表示"}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={cancelTempFilters}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>絞り込み条件</Text>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterOption,
                  tempFilters.includes(option) && styles.selectedFilter,
                ]}
                onPress={() => handleFilter(option)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    tempFilters.includes(option) && styles.selectedFilterText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.applyButton}
              onPress={applyTempFilters}
            >
              <Text style={styles.applyButtonText}>適用</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelTempFilters}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={sortModalVisible}
        onRequestClose={() => setSortModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>並び替え</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  currentSort === option && styles.selectedSort,
                ]}
                onPress={() => handleSort(option)}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    currentSort === option && styles.selectedSortText,
                  ]}
                >
                  {option}順
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setSortModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          size="large"
          color="#6B4DE6"
        />
      ) : showMap ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: userLocation?.coords.latitude || 35.6812,
              longitude: userLocation?.coords.longitude || 139.7671,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
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
            {filteredGyms.map((gym) => (
              <Marker
                key={gym.place_id}
                coordinate={{
                  latitude: gym.geometry.location.lat,
                  longitude: gym.geometry.location.lng,
                }}
                title={gym.name}
                description={gym.formatted_address}
              />
            ))}
          </MapView>

          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={moveToCurrentLocation}
          >
            <Text style={styles.currentLocationButtonText}>現在地へ</Text>
          </TouchableOpacity>
        </>
      ) : (
        <FlatList
          data={filteredGyms}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 15,
  },
  filterButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  sortButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#6B4DE6",
    borderRadius: 15,
  },
  sortButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  sortOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  selectedSort: {
    backgroundColor: "#F0F0FF",
  },
  sortOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  selectedSortText: {
    color: "#6B4DE6",
    fontWeight: "bold",
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 15,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
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
  filterOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  selectedFilter: {
    backgroundColor: "#E8F5E9",
  },
  filterOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  selectedFilterText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  applyButton: {
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
  },
  applyButtonText: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  mapToggleButton: {
    position: "absolute",
    right: 15,
    bottom: 30,
    backgroundColor: "#6B4DE6",
    padding: 15,
    borderRadius: 25,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapToggleButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  searchInputDisabled: {
    backgroundColor: "#E0E0E0",
    color: "#999",
  },
  buttonDisabled: {
    backgroundColor: "#D1D1D1",
  },
  buttonTextDisabled: {
    color: "#999",
  },
  currentLocationButton: {
    position: "absolute",
    right: 15,
    bottom: 90, // mapToggleButtonの上に配置
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currentLocationButtonText: {
    color: "#6B4DE6",
    fontWeight: "bold",
  },
});
