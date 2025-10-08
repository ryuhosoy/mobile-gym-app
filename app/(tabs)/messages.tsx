import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { app } from "../config/firebase"; // Firebaseの初期化を別ファイルに移動
import { ChatRoom } from "../types/chat";

export default function Messages() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const router = useRouter();
  const auth = getAuth(app);
  const db = getDatabase(app);

  useEffect(() => {
    if (!auth.currentUser) return;

    const membersRef = ref(db, 'members');
    const unsubscribe = onValue(membersRef, (snapshot) => {
      const membersData = snapshot.val();
      if (!membersData) return;

      const userRoomIds = Object.entries(membersData)
        .filter(([_, members]: [string, any]) => members[auth.currentUser!.uid])
        .map(([roomId]) => roomId);

      const chatsRef = ref(db, 'chats');
      onValue(chatsRef, (snapshot) => {
        const chatsData = snapshot.val();
        if (!chatsData) return;

        const rooms = userRoomIds
          .filter(roomId => chatsData[roomId])
          .map(roomId => ({
            id: roomId,
            ...chatsData[roomId],
            title: chatsData[roomId].gymName, // gymNameをtitleとして使用
            timestamp: chatsData[roomId].lastMessageTime || Date.now() // lastMessageTimeをtimestampとして使用
          }))
          .sort((a, b) => b.timestamp - a.timestamp);

        setChatRooms(rooms);
      });
    });

    return () => unsubscribe();
  }, []);

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity 
      style={styles.chatRoom}
      onPress={() => router.push(`../chat/${item.id}`)}
    >
      <View style={styles.chatInfo}> 
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 20,
  },
  listContainer: {
    padding: 10,
  },
  chatRoom: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chatInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    alignSelf: 'flex-end',
  },
});
