// app/security.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SecurityScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSendOTP = () => {
    if (!email.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập email của bạn.");
      return;
    }
    Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn.");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER CĂN GIỮA CHUẨN */}
      <View style={styles.header}>
        {/* Nút Back bên trái */}
        <TouchableOpacity
          style={styles.headerLeftBtn}
          onPress={() => router.back()}
        >
          <View style={styles.backBtnContent}>
            <Ionicons name="arrow-back" size={20} color="#637CFF" />
            <Text style={styles.backText}>Quay lại</Text>
          </View>
        </TouchableOpacity>

        {/* Container chứa tiêu đề - Sẽ được căn giữa tuyệt đối */}
        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Đổi Mật Khẩu</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* 2. THẺ CHÍNH (CARD) */}
          <View style={styles.mainCard}>
            <Text style={styles.stepTitle}>Bước 1: Gửi mã OTP</Text>
            <Text style={styles.stepDesc}>
              Nhập email của bạn để nhận mã OTP đổi mật khẩu
            </Text>

            {/* Ô NHẬP EMAIL */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập email..."
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* NÚT GỬI OTP */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSendOTP}
              activeOpacity={0.8}
            >
              <Text style={styles.submitBtnText}>Gửi mã OTP</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 3. NÚT MICRO ĐỒNG BỘ */}
      <View style={styles.floatingMicContainer}>
        <TouchableOpacity style={styles.micButton} activeOpacity={0.8}>
          <Ionicons name="mic" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },

  // Header styles
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 15,
    position: "relative", // Quan trọng để các con dùng absolute
  },
  headerLeftBtn: {
    zIndex: 2, // Đảm bảo nút nằm trên tiêu đề để vẫn bấm được
    paddingVertical: 5,
  },
  backBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  backText: {
    color: "#637CFF",
    fontSize: 16,
    fontWeight: "500",
  },

  // STYLE MỚI: Ép tiêu đề vào chính giữa trục ngang
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },

  scrollContent: { padding: 20, paddingTop: 30 },

  // Card styles
  mainCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    // Đổ bóng đậm đà như ảnh
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  stepDesc: { fontSize: 15, color: "#777", lineHeight: 22, marginBottom: 30 },

  inputContainer: { marginBottom: 30 },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  textInput: {
    height: 55,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#FFF",
  },

  submitBtn: {
    backgroundColor: "#637CFF", // Màu xanh tím giống trong hình
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#637CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnText: { color: "white", fontSize: 18, fontWeight: "bold" },

  // Floating Mic (đã đồng bộ kích thước 62px)
  floatingMicContainer: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  micButton: {
    width: 62,
    height: 62,
    backgroundColor: "#0088cc",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
