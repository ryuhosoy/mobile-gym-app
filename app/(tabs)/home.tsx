import { StyleSheet, ScrollView, View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useLocation } from '../contexts/LocationContext';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface Gym {
  name: string;
  keyword: string;
}

interface Category {
  title: string;
  icon: keyof typeof FontAwesome.glyphMap;
  items: Gym[];
}

const staticCategories: Category[] = [
  {
    title: '安いジム',
    icon: 'dollar',
    items: [
      { name: 'エニタイムフィットネス', keyword: 'エニタイムフィットネス 格安' },
      { name: 'ジョイフィット', keyword: 'ジョイフィット' },
      { name: 'ファストジム24', keyword: 'ファストジム24' },
    ]
  },
  {
    title: '学生に人気',
    icon: 'graduation-cap',
    items: [
      { name: 'ANYTIME FITNESS', keyword: 'ANYTIME FITNESS 学割' },
      { name: 'コナミスポーツ', keyword: 'コナミスポーツ 学生' },
      { name: 'セントラルスポーツ', keyword: 'セントラルスポーツ 学生' },
    ]
  },
  {
    title: '女性に人気',
    icon: 'heart',
    items: [
      { name: 'カーブス', keyword: 'カーブス' },
      { name: 'ライザップ', keyword: 'ライザップ 女性' },
      { name: 'ホットヨガLAVA', keyword: 'ホットヨガLAVA' },
    ]
  },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  const { width } = useWindowDimensions();
  const location = useLocation();
  const { searchQuery } = useLocalSearchParams<{ searchQuery: string }>();
  const [nearby24HourGyms, setNearby24HourGyms] = useState<Gym[]>([]);

  console.log("searchQuery in home", searchQuery);

  useEffect(() => {
    if (searchQuery) {
      console.log("searchQuery in home", searchQuery);
    }
  }, [searchQuery]);

  useEffect(() => {
    // 環境変数の読み込み確認
    console.log('Home - API Key loaded:', process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY ? 'YES' : 'NO');
    
    const fetch24HourGyms = async () => {
      if (location.userLocation) {
        try {
          const params = {
            location: `${location.userLocation.coords.latitude},${location.userLocation.coords.longitude}`,
            radius: "5000",
            type: "gym",
            keyword: "24時間",
            language: "ja",
            key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY!,
          };

          const url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
          const queryString = new URLSearchParams(params).toString();
          const response = await fetch(`${url}?${queryString}`);
          const data = await response.json();
          console.log("data.results", data.results);
          const gyms = data.results.map((place: any) => ({
            name: place.name,
            keyword: `${place.name} 24時間`,
          }));
          setNearby24HourGyms(gyms);
        } catch (error) {
          console.error('24時間ジムの取得に失敗しました:', error);
        }
      }
    };

    fetch24HourGyms();
  }, [location]);

  const allCategories = [
    ...staticCategories,
    {
      title: '24時間営業のジム',
      icon: 'clock-o',
      items: nearby24HourGyms
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>おすすめジム</Text>
        <Text style={styles.headerSubtitle}>カテゴリーから探す</Text>
      </View>

      {allCategories.map((category, index) => (
        <Animated.View 
          key={category.title}
          entering={FadeInUp.delay(index * 100)}
          style={styles.category}
        >
          <View style={styles.categoryHeader}>
            <FontAwesome name={category.icon as keyof typeof FontAwesome.glyphMap} size={20} color="#6B4DE6" />
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {category.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={[styles.card, { width: width * 0.7 }]}
                onPress={() => {
                  navigation.navigate("gymSearch", { searchQuery: item.name });
                }}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.gymName}>{item.name}</Text>
                  <FontAwesome name="chevron-right" size={16} color="#6B4DE6" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  category: {
    marginVertical: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#000',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  card: {
    marginHorizontal: 4,
    height: 100,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gymName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
}); 