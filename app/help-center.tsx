// app/help-center.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Dữ liệu câu hỏi thường gặp
const FAQS = [
  {
    id: 1,
    q: "Làm thế nào để sử dụng tính năng gọi khẩn cấp?",
    tag: "Khẩn cấp",
  },
  { id: 2, q: "Cách kết nối với người thân?", tag: "Kết nối" },
  { id: 3, q: "Làm sao để sử dụng lệnh thoại?", tag: "Lệnh thoại" },
  { id: 4, q: "Cách đọc sách và chơi game?", tag: "Giải trí" },
  { id: 5, q: "Làm thế nào để kiểm tra sức khỏe?", tag: "Sức khỏe" },
  { id: 6, q: "Cách cài đặt nhắc nhở?", tag: "Nhắc nhở" },
  { id: 7, q: "Làm sao để nâng cấp lên Premium?", tag: "Premium" },
  { id: 8, q: "Cách thay đổi mật khẩu?", tag: "Bảo mật" },
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. HEADER CĂN GIỮA TUYỆT ĐỐI */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeftBtn}
          onPress={() => router.back()}
        >
          <View style={styles.backBtnCircle}>
            <Ionicons name="chevron-back" size={22} color="#007AFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer} pointerEvents="none">
          <Text style={styles.headerTitle}>Trung tâm hỗ trợ</Text>
          <Text style={styles.headerSub}>
            Tìm kiếm câu trả lời và liên hệ với chúng tôi
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* LIÊN HỆ HỖ TRỢ */}
        <Text style={styles.sectionHeading}>Liên hệ hỗ trợ</Text>
        <View style={styles.card}>
          <SupportRow
            icon="call"
            title="Gọi điện hỗ trợ"
            sub="1900-xxxx"
            color="#007AFF"
          />
          <SupportRow
            icon="mail"
            title="Email hỗ trợ"
            sub="support@viegrand.app"
            color="#007AFF"
          />
          <SupportRow
            icon="chatbubble"
            title="Chat trực tuyến"
            sub="Trò chuyện với nhân viên"
            color="#007AFF"
            isLast
          />
        </View>

        {/* TÀI NGUYÊN HỖ TRỢ */}
        <Text style={styles.sectionHeading}>Tài nguyên hỗ trợ</Text>
        <View style={styles.card}>
          <SupportRow
            icon="play-circle"
            title="Hướng dẫn sử dụng"
            sub="Xem video hướng dẫn chi tiết"
            color="#007AFF"
          />
          <SupportRow
            icon="cloud-download"
            title="Cập nhật ứng dụng"
            sub="Kiểm tra phiên bản mới"
            color="#007AFF"
            isLast
          />
        </View>

        {/* CÂU HỎI THƯỜNG GẶP */}
        <Text style={styles.sectionHeading}>Câu hỏi thường gặp</Text>
        <View style={styles.card}>
          {FAQS.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.faqRow,
                index === FAQS.length - 1 && { borderBottomWidth: 0 },
              ]}
              onPress={() => toggleFAQ(item.id)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.faqQuestion}>{item.q}</Text>
                <Text style={styles.faqTag}>{item.tag}</Text>
                {expandedId === item.id && (
                  <Text style={styles.faqAnswer}>
                    Đây là nội dung hướng dẫn chi tiết cho phần {item.tag}. Bạn
                    có thể cập nhật nội dung thật tại đây.
                  </Text>
                )}
              </View>
              <Ionicons
                name={expandedId === item.id ? "chevron-up" : "chevron-down"}
                size={20}
                color="#007AFF"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* THANH TAB BAR GIẢ - ĐỒNG BỘ 100% VỚI HỆ THỐNG */}
      <View style={styles.tabBarContainer}>
        <View style={styles.fakeTabBar}>
          {/* Cột 1: Home */}
          <View style={styles.tabColumn}>
            <TouchableOpacity
              style={styles.tabIconWrapper}
              onPress={() => router.replace("/(tabs)")}
            >
              <Ionicons name="home-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Cột 2: Chat */}
          <View style={styles.tabColumn}>
            <TouchableOpacity
              style={styles.tabIconWrapper}
              onPress={() => router.replace("/(tabs)/chat")}
            >
              <Ionicons name="chatbubble-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Cột 3: Mic - Nút trung tâm nhô cao */}
          <View style={styles.tabColumn}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.micButtonContainer}
            >
              <View style={styles.micButton}>
                <Ionicons name="mic" size={28} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Cột 4: Yêu thích */}
          <View style={styles.tabColumn}>
            <TouchableOpacity style={styles.tabIconWrapper}>
              <Ionicons name="heart-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Cột 5: Cài đặt (Active - Có ô vuông xanh) */}
          <View style={styles.tabColumn}>
            <TouchableOpacity
              style={[styles.tabIconWrapper, styles.activeTabBox]}
              onPress={() => router.back()}
            >
              <Ionicons name="settings" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// COMPONENT CON CHO HÀNG MENU
const SupportRow = ({ icon, title, sub, color, isLast }: any) => (
  <TouchableOpacity style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
    <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <View style={{ flex: 1, marginLeft: 15 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowSub}>{sub}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#CCC" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    height: 90,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 15,
    position: "relative",
    justifyContent: "center",
  },
  headerLeftBtn: { position: "absolute", left: 15, zIndex: 2, top: 25 },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    top: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A" },
  headerSub: { fontSize: 13, color: "#999", marginTop: 4 },

  scrollContent: { padding: 20, paddingBottom: 150 },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 15,
    marginTop: 10,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  iconCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
  rowTitle: { fontSize: 17, fontWeight: "bold", color: "#333" },
  rowSub: { fontSize: 14, color: "#999", marginTop: 2 },

  // FAQ Styles
  faqRow: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    flexDirection: "row",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    lineHeight: 22,
  },
  faqTag: { fontSize: 12, color: "#007AFF", fontWeight: "bold", marginTop: 5 },
  faqAnswer: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    backgroundColor: "#F9F9F9",
    padding: 10,
    borderRadius: 8,
  },

  // Tab Bar
  tabBarContainer: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  fakeTabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    // Đổ bóng đậm đà đồng bộ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  tabColumn: {
    flex: 1, // Chia đều 5 cột tuyệt đối
    alignItems: "center",
    justifyContent: "center",
  },
  tabIconWrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
  activeTabBox: {
    backgroundColor: "#0088cc",
    shadowColor: "#0088cc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  micButtonContainer: {
    justifyContent: "center",
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
    marginTop: -25, // Nhô lên chính xác tỉ lệ
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
