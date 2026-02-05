// app/create-reminder.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { auth, db } from "../src/config/firebase";
import { NotificationService } from "../src/services/NotificationService";
import {
  formatTimeInput,
  isValidFutureDate,
  isValidRealDate,
} from "../src/utils/dateHelper";

export default function CreateReminderScreen() {
  const router = useRouter();

  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [selectedElderlyId, setSelectedElderlyId] = useState<string | null>(
    null,
  );

  // State quản lý Form
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("vi-VN"));
  const [time, setTime] = useState("08:00");
  const [type, setType] = useState("pill");

  // --- 1. LẤY DANH SÁCH NGƯỜI THÂN ---
  useEffect(() => {
    const fetchFamily = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const myDoc = await getDoc(doc(db, "users", user.uid));
        if (myDoc.exists()) {
          const memberIds = myDoc.data().familyMembers || [];
          if (memberIds.length > 0) {
            const membersData: any[] = [];
            for (const id of memberIds) {
              const uDoc = await getDoc(doc(db, "users", id));
              if (uDoc.exists()) {
                const data = uDoc.data();
                if (data.role === "elder") {
                  membersData.push({ id: uDoc.id, ...data });
                }
              }
            }
            setFamilyMembers(membersData);
            setSelectedElderlyId(membersData[0].id);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFamily();
  }, []);

  // --- HÀM KIỂM TRA GIỜ TRONG QUÁ KHỨ ---
  const isTimeInPast = (dateStr: string, timeStr: string) => {
    const [day, month, year] = dateStr.split("/").map(Number);
    const [hour, minute] = timeStr.split(":").map(Number);
    const inputDateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();
    return inputDateTime < now;
  };

  // --- 2. HÀM TẠO NHẮC NHỞ ---
  const handleCreate = async () => {
    // A. Kiểm tra ngày/giờ hợp lệ
    if (!isValidRealDate(date)) {
      Alert.alert("Lỗi", "Ngày không tồn tại.");
      return;
    }
    if (!isValidFutureDate(date)) {
      Alert.alert("Lỗi", "Không thể chọn ngày trong quá khứ.");
      return;
    }

    const formattedTime = formatTimeInput(time);
    if (!formattedTime) {
      Alert.alert("Lỗi", "Giờ không hợp lệ (VD: 9, 1430).");
      return;
    }

    if (isTimeInPast(date, formattedTime)) {
      Alert.alert(
        "Lỗi thời gian",
        "Thời gian này đã trôi qua. Vui lòng chọn giờ khác.",
      );
      return;
    }

    if (!title || !content || !selectedElderlyId) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn người nhận và điền đủ thông tin.",
      );
      return;
    }

    try {
      setLoading(true);

      // B. Lưu vào Firestore
      await addDoc(collection(db, "users", selectedElderlyId, "reminders"), {
        title: title.trim(),
        content: content.trim(),
        date,
        time: formattedTime,
        type,
        isDone: false,
        createdAt: serverTimestamp(),
      });

      // C. Gửi thông báo chuyên nghiệp cho người già
      let msgTitle = "Lịch nhắc nhở mới";
      if (type === "pill") msgTitle = "💊 Lịch uống thuốc mới";
      if (type === "exercise") msgTitle = "🏃 Lịch tập thể dục mới";
      if (type === "water") msgTitle = "💧 Lịch uống nước mới";

      await NotificationService.sendInAppNotification(
        selectedElderlyId,
        msgTitle,
        `Nội dung: ${title} vào lúc ${formattedTime}`,
        "reminder",
      );

      Alert.alert("Thành công", "Đã gửi nhắc nhở cho người thân!");
      router.back();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && familyMembers.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0055aa" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#0055aa" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo nhắc nhở</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.blueBanner}>
            <View style={styles.bellCircle}>
              <Ionicons name="notifications" size={30} color="white" />
            </View>
            <Text style={styles.bannerTitle}>Nhắc nhở cho người thân</Text>
            <Text style={styles.bannerSub}>
              Chăm sóc sức khỏe người thân tốt hơn
            </Text>
          </View>

          <Text style={styles.sectionLabel}>
            <Ionicons name="people" /> Chọn người nhận
          </Text>
          {familyMembers.length > 0 ? (
            familyMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.userCard,
                  selectedElderlyId === member.id && styles.userCardActive,
                ]}
                onPress={() => setSelectedElderlyId(member.id)}
              >
                <View
                  style={[
                    styles.avatarCircle,
                    {
                      backgroundColor:
                        selectedElderlyId === member.id ? "#007AFF" : "#EEE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      {
                        color:
                          selectedElderlyId === member.id ? "white" : "#666",
                      },
                    ]}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={styles.userName}>{member.name}</Text>
                  <Text style={styles.userSub}>
                    {member.age || "--"} tuổi • {member.gender || "Nam"}
                  </Text>
                </View>
                {selectedElderlyId === member.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyCard}>
              <Text style={{ color: "#999" }}>
                Chưa có danh sách người cao tuổi đã kết nối.
              </Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardHeader}>
              <Ionicons name="pencil" color="#007AFF" /> Chi tiết nhắc nhở
            </Text>
            <View style={styles.inputBox}>
              <Ionicons name="pricetag-outline" size={20} color="#999" />
              <TextInput
                placeholder="Nhập tiêu đề (VD: Uống thuốc huyết áp)"
                style={styles.input}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <View
              style={[
                styles.inputBox,
                { height: 80, alignItems: "flex-start", paddingTop: 12 },
              ]}
            >
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color="#999"
                style={{ marginTop: 5 }}
              />
              <TextInput
                placeholder="Ghi chú nội dung..."
                style={[styles.input, { height: "100%" }]}
                multiline
                value={content}
                onChangeText={setContent}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>
              <Ionicons name="time" color="#007AFF" /> Thời gian
            </Text>
            <View style={{ flexDirection: "row", gap: 15 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Ngày (DD/MM/YYYY)</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    style={styles.input}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Giờ (VD: 9 hoặc 1430)</Text>
                <View style={styles.inputBox}>
                  <TextInput
                    value={time}
                    onChangeText={setTime}
                    style={styles.input}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardHeader}>
              <Ionicons name="grid" color="#007AFF" /> Loại nhắc nhở
            </Text>
            <View style={styles.typeGrid}>
              <TypeBtn
                icon="medical"
                label="Thuốc"
                active={type === "pill"}
                onPress={() => setType("pill")}
              />
              <TypeBtn
                icon="water"
                label="Nước"
                active={type === "water"}
                onPress={() => setType("water")}
              />
              <TypeBtn
                icon="fitness"
                label="Tập luyện"
                active={type === "exercise"}
                onPress={() => setType("exercise")}
              />
              <TypeBtn
                icon="create"
                label="Khác"
                active={type === "other"}
                onPress={() => setType("other")}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
            <Ionicons name="checkmark" size={24} color="white" />
            <Text style={styles.createBtnText}>Gửi nhắc nhở</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const TypeBtn = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.typeBtn, active && styles.typeBtnActive]}
    onPress={onPress}
  >
    <View
      style={[styles.typeIconBox, active && { backgroundColor: "#007AFF" }]}
    >
      <Ionicons name={icon} size={22} color={active ? "white" : "#007AFF"} />
    </View>
    <Text style={[styles.typeLabel, active && { color: "#007AFF" }]}>
      {label}
    </Text>
    {active && (
      <Ionicons
        name="checkmark-circle"
        size={16}
        color="#007AFF"
        style={styles.checkIcon}
      />
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    paddingTop: Platform.OS === "ios" ? 10 : 40,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  scrollContent: { padding: 20 },
  blueBanner: {
    backgroundColor: "#007AFF",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },
  bellCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  bannerTitle: { color: "white", fontSize: 20, fontWeight: "bold" },
  bannerSub: {
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 5,
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 10,
    elevation: 2,
  },
  userCardActive: { borderWidth: 2, borderColor: "#007AFF", elevation: 4 },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontWeight: "bold", fontSize: 18 },
  userName: { fontWeight: "bold", fontSize: 16 },
  userSub: { color: "#999", fontSize: 12 },
  emptyCard: {
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 15,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  inputLabel: { fontSize: 12, color: "#999", marginBottom: 5 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeBtn: {
    width: "48%",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  typeBtnActive: { borderColor: "#007AFF", backgroundColor: "white" },
  typeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
    elevation: 1,
  },
  typeLabel: { fontSize: 13, fontWeight: "600", color: "#666" },
  checkIcon: { position: "absolute", top: 8, right: 8 },
  createBtn: {
    backgroundColor: "#0055aa",
    flexDirection: "row",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
    marginBottom: 40,
  },
  createBtnText: { color: "white", fontSize: 18, fontWeight: "bold" },
});
