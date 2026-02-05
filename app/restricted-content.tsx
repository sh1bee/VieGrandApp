// app/restricted-content.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import CustomAlert from "../src/components/CustomAlert";

export default function RestrictedContentScreen() {
  const router = useRouter();

  // State quản lý danh sách từ khóa và ô nhập
  const [keywords, setKeywords] = useState<string[]>(["war"]);
  const [inputText, setInputText] = useState("");

  // State cho thông báo
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  // Load dữ liệu cũ khi vào trang
  useEffect(() => {
    const loadKeywords = async () => {
      const saved = await AsyncStorage.getItem("restricted_keywords");
      if (saved) setKeywords(JSON.parse(saved));
    };
    loadKeywords();
  }, []);

  // Hàm thêm từ khóa mới
  const addKeyword = () => {
    const trimmed = inputText.trim().toLowerCase();
    if (trimmed === "") return;
    if (keywords.includes(trimmed)) {
      setAlertConfig({
        visible: true,
        type: "error",
        title: "Trùng lặp",
        message: "Từ khóa này đã tồn tại trong danh sách.",
      });
      return;
    }
    setKeywords([...keywords, trimmed]);
    setInputText("");
  };

  // Hàm xóa từ khóa
  const removeKeyword = (index: number) => {
    const newList = keywords.filter((_, i) => i !== index);
    setKeywords(newList);
  };

  // Hàm lưu chính thức
  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(
        "restricted_keywords",
        JSON.stringify(keywords),
      );
      setAlertConfig({
        visible: true,
        type: "success",
        title: "Thành công",
        message: "Cài đặt nội dung hạn chế đã được lưu.",
      });
    } catch (e) {
      setAlertConfig({
        visible: true,
        type: "error",
        title: "Lỗi",
        message: "Không thể lưu dữ liệu.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER CHUẨN MẪU */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Nội dung hạn chế</Text>
        </View>

        <TouchableOpacity style={styles.saveHeaderBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* CARD 1: HƯỚNG DẪN */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quản lý nội dung hạn chế</Text>
            <Text style={styles.cardDesc}>
              Thêm từ khóa để lọc bỏ video không phù hợp. Những video chứa từ
              khóa này sẽ không hiển thị trong kết quả tìm kiếm.
            </Text>
          </View>

          {/* CARD 2: THÊM MỚI (Đã cập nhật logic màu sắc) */}
          <View style={styles.card}>
            <Text style={styles.label}>Thêm từ khóa mới</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Nhập từ khóa..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={addKeyword}
              />

              {/* Nút bấm tự động đổi màu dựa trên inputText */}
              <TouchableOpacity
                style={[
                  styles.addBtn,
                  inputText.trim().length > 0
                    ? styles.addBtnActive
                    : styles.addBtnInactive,
                ]}
                onPress={addKeyword}
                disabled={inputText.trim().length === 0} // Vô hiệu hóa khi không có chữ
              >
                <Ionicons
                  name="add"
                  size={32}
                  color={inputText.trim().length > 0 ? "white" : "#CCC"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CARD 3: DANH SÁCH HIỆN TẠI */}
          <View style={styles.card}>
            <Text style={styles.label}>
              Từ khóa hiện tại ({keywords.length})
            </Text>

            {keywords.map((word, index) => (
              <View key={index} style={styles.keywordRow}>
                <Text style={styles.keywordText}>{word}</Text>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeKeyword(index)}
                >
                  <Ionicons name="close" size={18} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}

            {keywords.length === 0 && (
              <Text style={styles.emptyText}>Chưa có từ khóa hạn chế nào.</Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* THÔNG BÁO TÙY CHỈNH */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />

      {/* NÚT MIC ĐỒNG BỘ */}
      <View style={styles.floatingMic}>
        <TouchableOpacity style={styles.micCircle}>
          <Ionicons name="mic" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },

  // Header
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#F9F9F9",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },
  saveHeaderBtn: {
    backgroundColor: "#21B1F2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    zIndex: 2,
  },
  saveBtnText: { color: "white", fontWeight: "bold", fontSize: 16 },

  scrollContent: { padding: 20, paddingBottom: 120 },

  // Card Styles
  card: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  cardDesc: { fontSize: 15, color: "#8E8E93", lineHeight: 22 },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },

  // Input row
  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: "#EEE",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },
  addBtn: {
    width: 55,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    transition: "0.2s", // Tạo hiệu ứng đổi màu mượt nếu chạy trên web
  },
  addBtnInactive: {
    backgroundColor: "#F0F0F0", // Màu xám khi trống
  },
  addBtnActive: {
    backgroundColor: "#21B1F2", // Màu xanh khi có chữ (khớp màu nút Lưu)
    // Thêm bóng đổ nhẹ khi nút kích hoạt
    shadowColor: "#21B1F2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // Keyword list
  keywordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  keywordText: { fontSize: 16, color: "#333", fontWeight: "500" },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFDADA",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginVertical: 10,
  },

  // Mic
  floatingMic: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
  },
  micCircle: {
    width: 62,
    height: 62,
    backgroundColor: "#0088cc",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
