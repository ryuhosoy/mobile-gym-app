import { useLocalSearchParams } from 'expo-router';
import { getAuth } from 'firebase/auth';
import {
  getDatabase,
  onValue,
  push,
  ref,
  update,
} from 'firebase/database';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { app } from "../config/firebase"; // Firebaseの初期化を別ファイルから
import { Message } from '../types/chat';

export default function ChatRoom() {
  const { id: roomId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomTitle, setRoomTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const auth = getAuth(app);
  const db = getDatabase(app);

  useEffect(() => {
    if (!auth.currentUser) return;

    // チャットルームのタイトルを取得
    const roomRef = ref(db, `chats/${roomId}`);
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        setRoomTitle(roomData.title);
      }
    });

    // メッセージを取得
    const messagesRef = ref(db, `messages/${roomId}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messageList = Object.entries(data)
          .map(([id, message]: [string, any]) => ({
            id,
            ...message
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(messageList);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !auth.currentUser) return;

    const timestamp = Date.now();
    const messageData: Message = {
      id: '', // pushで生成されるIDを使用
      text: newMessage,
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.email?.split('@')[0] || 'Anonymous',
      timestamp,
    };

    const updates: {[key: string]: any} = {};
    
    const newMessageKey = push(ref(db, `messages/${roomId}`)).key;
    if (!newMessageKey) return;
    
    messageData.id = newMessageKey;
    updates[`/messages/${roomId}/${newMessageKey}`] = messageData;
    updates[`/chats/${roomId}/lastMessage`] = `${messageData.senderName}: ${messageData.text}`;
    updates[`/chats/${roomId}/lastMessageTime`] = timestamp;

    try {
      await update(ref(db), updates);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === auth.currentUser?.uid;

    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <Text style={styles.messageName}>{item.senderName}</Text>
        )}
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.myMessageText : styles.otherMessageText
        ]}>
          {item.text}
        </Text>
        <Text style={styles.messageTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Text style={styles.roomTitle}>{roomTitle}</Text>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="メッセージを入力..."
          multiline
        />
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Text style={styles.sendButtonText}>送信</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6B4DE6',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  messageName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  input: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#6B4DE6',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
}); 