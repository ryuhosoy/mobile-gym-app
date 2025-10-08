import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
// import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { child, get, getDatabase, ref, set } from "firebase/database";
import { app } from "../config/firebase";

const ProfileInput = () => {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [gymPurpose, setGymPurpose] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const auth = getAuth(app);
  const user = auth.currentUser;

  // const pickImage = async () => {
  //   // No permissions request is necessary for launching the image library
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   console.log(result);

  //   if (!result.canceled && result.assets.length > 0) {
  //     setImage(result.assets[0].uri);
  //   }
  // };

  useFocusEffect(
    useCallback(() => {
      console.log("プロフィール画面がフォーカスされました");

      const fetchData = async () => {
        try {
          console.log('データ取得開始');
          const dbRef = ref(getDatabase(app));
          console.log('DBリファレンス取得:', dbRef);
          const snapshot = await get(child(dbRef, `users/${user?.uid}`));
          console.log('スナップショット取得:', snapshot);
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log('取得したデータ:', data);
            setName(data.name || "");
            console.log("name", data.name);
            setBirthdate(data.birthdate || "");
            console.log("birthdate", data,birthdate);
            setGender(data.gender || "");
            console.log("gender", data.gender);
            setIntroduction(data.introduction || "");
            console.log("introduction", data.introduction);
            setGymPurpose(data.gymPurpose || "");
            console.log("gymPurpose", data.gymPurpose);
            console.log('データをステートに設定完了');
          } else {
            console.log('該当ユーザーのデータが存在しません');
          }
        } catch (error) {
          console.error("データの取得中にエラーが発生しました: ", error);
        }
      };

      fetchData();

      return () => {
        console.log("プロフィール画面のフォーカスが外れました");
      };
    }, [])
  );

  useEffect(() => {
    console.log("プロフィール画面更新");
  }, [name, birthdate, gender, introduction, gymPurpose]);

  const handleSubmit = async () => {
    if (!name || !birthdate || !gender) {
      Alert.alert("エラー", "名前、生年月日、性別は必須項目です。");
      return;
    }

    try {
      const db = getDatabase(app);
      const userRef = ref(db, 'users/' + user?.uid);
      await set(userRef, {
        name,
        birthdate,
        gender,
        introduction,
        gymPurpose,
      });
      Alert.alert("成功", "プロフィールが保存されました。");
    } catch (error) {
      console.error(error);
      Alert.alert("エラー", "プロフィールの保存中にエラーが発生しました。");
    }
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.label}>プロフィール画像</Text> */}
      {/* <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.imagePickerText}>画像を選択</Text>
        )}
      </TouchableOpacity> */}

      <Text style={styles.label}>名前</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="名前を入力してください"
      />

      <Text style={styles.label}>生年月日</Text>
      <TextInput
        style={styles.input}
        value={birthdate}
        onChangeText={setBirthdate}
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.label}>性別</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.pickerButton}>
        <Text style={styles.pickerText}>{gender || "性別を選んでください…"}</Text>
      </TouchableOpacity>

      <Modal visible={showPicker} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={gender}
              onValueChange={(itemValue) => {
                setGender(itemValue);
              }}
              style={styles.picker}
            >
              <Picker.Item label="性別を選んでください…" value="" />
              <Picker.Item label="男性" value="男性" />
              <Picker.Item label="女性" value="女性" />
            </Picker>
            <Button title="閉じる" onPress={() => setShowPicker(false)} />
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>自己紹介</Text>
      <TextInput
        style={styles.input}
        value={introduction}
        onChangeText={setIntroduction}
        placeholder="自己紹介を入力してください"
        multiline
      />

      <Text style={styles.label}>ジムを利用する目的</Text>
      <TextInput
        style={styles.input}
        value={gymPurpose}
        onChangeText={setGymPurpose}
        placeholder="目的を入力してください"
        multiline
      />

      <Button title="保存" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  pickerButton: {
    height: 40,
    justifyContent: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
  },
  pickerText: {
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  picker: {
    height: 150,
  },
  imagePickerButton: {
    height: 100,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 50,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imagePickerText: {
    color: '#666',
  },
  image: {
    height: 100,
    width: 100,
  },
});

export default ProfileInput;
