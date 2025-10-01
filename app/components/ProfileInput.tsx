import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { Picker } from '@react-native-picker/picker';

const ProfileInput = () => {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [gymPurpose, setGymPurpose] = useState("");

  const handleSubmit = () => {
    // Handle form submission
    console.log({ name, birthdate, gender, introduction, gymPurpose });
  };

  return (
    <View style={styles.container}>
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
      <Picker
        selectedValue={gender}
        onValueChange={(itemValue) => {
          console.log('Selected Gender:', itemValue);
          setGender(itemValue);
        }}
        style={styles.input}
      >
        <Picker.Item label="性別を選んでください…" value="" />
        <Picker.Item label="男性" value="男性" />
        <Picker.Item label="女性" value="女性" />
      </Picker>

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
    zIndex: 10,
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
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: "black",
    paddingRight: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
  },
});

export default ProfileInput;
