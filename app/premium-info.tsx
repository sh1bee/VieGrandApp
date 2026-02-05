// app/premium-info.tsx
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

export default function PremiumInfoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER CĂN GIỮA TUYỆT ĐỐI */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeftBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0055aa" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Thông tin Premium</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* THẺ: THÔNG TIN CỦA BẠN */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={20} color="#0055aa" />
            <Text style={styles.cardMainTitle}>Thông tin của bạn</Text>
          </View>
          <View style={styles.divider} />

          <DataRow label="Tên:" value="Trần Văn Giàu" isBold />
          <DataRow label="Email:" value="ss@gmail.com" isLink />
          <DataRow label="Số điện thoại:" value="0123456789" isBold />
          <DataRow label="Tuổi:" value="70 tuổi" />
          <DataRow label="Giới tính:" value="Nam" />
          <DataRow label="Mã người dùng:" value="0pu3ulfw" isLink isLast />
        </View>

        {/* THẺ: TRẠNG THÁI PREMIUM */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color="#4CAF50"
            />
            <Text style={styles.cardMainTitle}>Trạng thái Premium</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.statusBox}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Đang hoạt động</Text>
            </View>
          </View>
        </View>

        {/* THẺ: CHI TIẾT GÓI PREMIUM */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="star-outline" size={20} color="#FBC02D" />
            <Text style={styles.cardMainTitle}>Chi tiết gói Premium</Text>
          </View>
          <View style={styles.divider} />

          <DataRow label="Mã Premium:" value="0800000000010825" isLink />
          <DataRow label="Ngày bắt đầu:" value="05:27, 08/08/2025" />
          <DataRow label="Ngày kết thúc:" value="05:27, 08/09/2025" />
          <DataRow label="Số ngày còn lại:" value="10 ngày" isGreen isLast />
        </View>

        {/* THẺ: SỐ NGƯỜI THÂN */}
        <View style={styles.card}>
          <DataRow label="Số người thân:" value="3 người" isBold isLast />
        </View>

        {/* THẺ: NGƯỜI THÂN CHĂM SÓC */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="people-outline" size={20} color="#0055aa" />
            <Text style={styles.cardMainTitle}>Người thân chăm sóc</Text>
          </View>
          <View style={styles.divider} />

          <DataRow label="Tên:" value="Huy" isBold />
          <DataRow label="Email:" value="z@gmail.com" isLink />
          <DataRow label="Số điện thoại:" value="0000465723" isBold />
          <DataRow label="Tuổi:" value="20 tuổi" />
          <DataRow label="Giới tính:" value="Nam" isLast />
        </View>
      </ScrollView>

      {/* NÚT MICRO LƠ LỬNG ĐỒNG BỘ */}
      <View style={styles.floatingMicContainer}>
        <TouchableOpacity style={styles.micButton} activeOpacity={0.8}>
          <Ionicons name="mic" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- COMPONENT PHỤ CHO DÒNG DỮ LIỆU ---
const DataRow = ({ label, value, isBold, isLink, isGreen, isLast }: any) => (
  <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text
      style={[
        styles.rowValue,
        isBold && styles.textBold,
        isLink && styles.textLink,
        isGreen && styles.textGreen,
      ]}
    >
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F2F7" },

  // Header
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingHorizontal: 15,
    position: "relative",
  },
  headerLeftBtn: { zIndex: 2, padding: 5 },
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1C1C1E" },

  scrollContent: { padding: 15, paddingBottom: 120 },

  // Card Styles
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  cardMainTitle: { fontSize: 17, fontWeight: "bold", color: "#1C1C1E" },
  divider: { height: 1, backgroundColor: "#F2F2F7", marginBottom: 5 },

  // Row Styles
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  rowLabel: { fontSize: 15, color: "#8E8E93" },
  rowValue: {
    fontSize: 15,
    color: "#1C1C1E",
    textAlign: "right",
    flex: 1,
    marginLeft: 20,
  },

  // Text variations
  textBold: { fontWeight: "bold" },
  textLink: { color: "#007AFF", textDecorationLine: "underline" },
  textGreen: { color: "#4CAF50", fontWeight: "bold" },

  // Status Badge
  statusBox: { alignItems: "center", paddingVertical: 10 },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  statusText: { color: "#4CAF50", fontWeight: "bold", fontSize: 16 },

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
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
