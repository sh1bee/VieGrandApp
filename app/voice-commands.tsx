// app/voice-commands.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function VoiceCommandsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER CĂN GIỮA CHUẨN */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0088cc" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Lệnh thoại</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. CARD HƯỚNG DẪN CÁCH DÙNG */}
        <View style={styles.instructionCard}>
          <View style={styles.micIconCircle}>
            <Ionicons name="mic" size={24} color="#0088cc" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.instructionTitle}>Cách sử dụng</Text>
            <Text style={styles.instructionDesc}>
              Nhấn vào nút micro ở giữa thanh điều hướng và nói lệnh của bạn
            </Text>
          </View>
        </View>

        {/* 3. TIÊU ĐỀ NHÓM CHỨC NĂNG */}
        <View style={styles.sectionHeader}>
          <View style={styles.homeIconCircle}>
            <Ionicons name="home" size={20} color="white" />
          </View>
          <Text style={styles.sectionMainTitle}>Chức năng chính</Text>
        </View>

        {/* 4. DANH SÁCH LỆNH (TRONG MỘT THẺ TRẮNG LỚN) */}
        <View style={styles.commandsContainer}>
          <CommandGroup
            title="Đi đến trang chủ"
            tags={['"home"', '"trang chủ"', '"màn hình chính"']}
          />

          <CommandGroup
            title="Đi đến trang chủ"
            tags={['"về trang chủ"', '"trang chủ"', '"màn hình chính"']}
          />

          <CommandGroup
            title="Xem thông tin thời tiết"
            tags={['"weather"', '"thời tiết"', '"xem thời tiết"']}
          />

          <CommandGroup
            title="Quay lại màn hình trước"
            tags={['"back"', '"quay lại"', '"trở lại"']}
          />

          <CommandGroup
            title="Đóng màn hình hiện tại"
            tags={['"close"', '"đóng"', '"thoát"']}
            isLast
          />
        </View>
      </ScrollView>

      {/* 5. NÚT MICRO ĐỒNG BỘ */}
      <View style={styles.floatingMicContainer}>
        <TouchableOpacity style={styles.micButton} activeOpacity={0.8}>
          <Ionicons name="mic" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- COMPONENT CON CHO TỪNG NHÓM LỆNH ---
const CommandGroup = ({ title, tags, isLast }: any) => (
  <View style={[styles.groupWrapper, isLast && { borderBottomWidth: 0 }]}>
    <Text style={styles.groupTitle}>{title}</Text>
    <View style={styles.tagContainer}>
      {tags.map((tag: string, index: number) => (
        <View key={index} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },

  // Header
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 15,
  },
  backBtn: { zIndex: 2, padding: 5 },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },

  scrollContent: { padding: 20, paddingBottom: 150 },

  // Instruction Card
  instructionCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    alignItems: "center",
    gap: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  micIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  instructionDesc: {
    fontSize: 14,
    color: "#777",
    lineHeight: 20,
    marginTop: 4,
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 15,
  },
  homeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionMainTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },

  // Commands Container (The big white card)
  commandsContainer: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
  },
  groupWrapper: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
  },

  // Tags/Chips
  tagContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tag: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  tagText: { color: "#8E8E93", fontSize: 15, fontWeight: "500" },

  // Floating Mic
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
