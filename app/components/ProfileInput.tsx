import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Picker } from '@react-native-picker/picker';

const ProfileInput = () => {
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [gymPurpose, setGymPurpose] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const handleSubmit = () => {
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
});

export default ProfileInput;
