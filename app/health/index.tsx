import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HealthMain() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Cần quyền truy cập camera để chụp ảnh");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setLoading(true);
      router.push({
        pathname: "/health/result",
        params: {
          imageUri: result.assets[0].uri,
          base64: result.assets[0].base64,
        },
      });
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setLoading(true);
      router.push({
        pathname: "/health/result",
        params: {
          imageUri: result.assets[0].uri,
          base64: result.assets[0].base64,
        },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0088cc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra sức khỏe</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Card Hướng dẫn */}
      <View style={styles.mainCard}>
        <View style={styles.cameraIconCircle}>
          <Ionicons name="camera-outline" size={60} color="#CCC" />
        </View>
        <Text style={styles.mainTitle}>Chụp hoặc chọn ảnh máy đo</Text>
        <Text style={styles.subTitle}>
          Chụp ảnh mới hoặc chọn ảnh có sẵn từ thư viện để phân tích
        </Text>
      </View>

      {/* Hàng nút bấm */}
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.btnPrimary, loading && { opacity: 0.6 }]} 
          onPress={takePhoto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.btnTextWhite}>Chụp ảnh</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btnSecondary, loading && { opacity: 0.6 }]} 
          onPress={pickImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#0088cc" />
          ) : (
            <>
              <Ionicons name="images" size={20} color="#0088cc" />
              <Text style={styles.btnTextBlue}>Chọn ảnh</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {loading && (
        <Text style={styles.loadingText}>Đang chuyển đến phân tích...</Text>
      )}

      <TouchableOpacity
        style={styles.chartLink}
        onPress={() => router.push("/health/chart")}
      >
        <Ionicons name="stats-chart" size={20} color="#0088cc" />
        <Text style={styles.btnTextBlue}>Biểu đồ sức khỏe</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  backBtn: { backgroundColor: "#F0F8FF", padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  mainCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 25,
    padding: 40,
    alignItems: "center",
    marginVertical: 20,
  },
  cameraIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonRow: { flexDirection: "row", gap: 15, marginBottom: 20 },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#007AFF",
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnTextWhite: { color: "white", fontWeight: "bold", fontSize: 16 },
  btnTextBlue: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },
  chartLink: {
    alignSelf: "center",
    flexDirection: "row",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    width: "80%",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: { textAlign: "center", color: "#0088cc", marginTop: 15, fontSize: 14 },
});
