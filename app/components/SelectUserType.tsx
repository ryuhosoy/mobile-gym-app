import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Link, useRouter } from "expo-router";

export default function SelectUserType() {
  const router = useRouter();

  const handleStaffPress = () => {
    // TODO: スタッフログイン画面へ
    alert("スタッフ機能は準備中です");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ようこそ</Text>
      <Text style={styles.subtitle}>あなたの立場を選択してください</Text>

      <View style={styles.buttonContainer}>
        <Link href="/auth/login" asChild>
          <TouchableOpacity style={styles.button}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>ユーザーとして進む</Text>
              <Text style={styles.buttonDescription}>
                近くのジムを探して予約する
              </Text>
            </View>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity
          style={[styles.button, styles.staffButton]}
          onPress={handleStaffPress}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, styles.staffButtonText]}>
              ジムスタッフとして進む
            </Text>
            <Text style={[styles.buttonDescription, styles.staffButtonText]}>
              ジム情報の管理・予約確認
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
    color: "#666",
  },
  buttonContainer: {
    gap: 20,
  },
  button: {
    backgroundColor: "#6B4DE6",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  staffButton: {
    backgroundColor: "#4CAF50",
  },
  buttonContent: {
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  staffButtonText: {
    color: "#FFF",
  },
  buttonDescription: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.9,
    textAlign: "center",
  },
});
