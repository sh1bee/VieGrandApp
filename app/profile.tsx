// app/profile.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../src/config/firebase";

export default function ProfileScreen() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  // 1. Khởi tạo State rỗng để chờ dữ liệu từ Firebase
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    relativePhone: "",
    age: "",
    gender: "",
    address: "",
    role: "", // Dữ liệu từ DB (elder/relative)
    status: "active",
    bloodType: "",
    allergy: "",
    chronicDisease: "",
    hypertension: "",
    heartDisease: "",
    stroke: "",
    maritalStatus: "",
    jobType: "",
    residence: "",
    glucose: "",
    bmi: "",
    smoking: "",
  });

  // 2. Hàm lấy dữ liệu thật từ Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        const savedRole = await AsyncStorage.getItem("userRole");
        setUserRole(savedRole || "elder");

        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Gộp dữ liệu mặc định với dữ liệu từ DB
            setProfile((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const updateField = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  // 3. Hàm Lưu dữ liệu lên Firebase
  const handleSave = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), profile);
        setIsEditing(false);
        Alert.alert("Thành công", "Thông tin hồ sơ đã được cập nhật.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && profile.name === "") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0055aa" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER CĂN GIỮA CHUẨN */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeftBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#0055aa" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <TouchableOpacity
          style={styles.headerRightBtn}
          onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
        >
          <Text style={styles.editBtnText}>
            {isEditing ? "Lưu" : "Chỉnh sửa"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* AVATAR & INFO TÓM TẮT */}
        <View style={styles.profileSummaryCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={65} color="#0055aa" />
            </View>
            <TouchableOpacity style={styles.cameraBtn}>
              <Ionicons name="camera" size={18} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>
            {profile.name || "Chưa có tên"}
          </Text>
          <Text style={styles.profileEmail}>{profile.email}</Text>

          <TouchableOpacity
            style={styles.pillBtn}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons
              name="pencil"
              size={18}
              color="#0055aa"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.pillBtnText}>Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>

        {/* --- CÁC PHẦN THÔNG TIN CHI TIẾT --- */}
        <Text style={styles.sectionHeading}>Thông tin cá nhân</Text>
        <View style={styles.infoBox}>
          <InfoRow
            label="Số điện thoại"
            value={profile.phone}
            field="phone"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="SĐT người thân"
            value={profile.relativePhone}
            field="relativePhone"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Tuổi"
            value={profile.age}
            field="age"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Giới tính"
            value={profile.gender}
            field="gender"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Địa chỉ"
            value={profile.address}
            field="address"
            isEditing={isEditing}
            onUpdate={updateField}
            isMultiline
            isLast
          />
        </View>

        <Text style={styles.sectionHeading}>Thông tin tài khoản</Text>
        <View style={styles.infoBox}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Vai trò</Text>
            <Text style={styles.rowValueLocked}>
              {profile.role === "elder" ? "Người cao tuổi" : "Người thân"}
            </Text>
          </View>
          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.rowLabel}>Trạng thái</Text>
            <View style={styles.statusContainer}>
              <View
                style={[styles.statusDot, { backgroundColor: "#4CAF50" }]}
              />
              <Text style={styles.statusLabel}>Đang hoạt động</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Thông tin y tế</Text>
        <View style={styles.infoBox}>
          <InfoRow
            label="Nhóm máu"
            value={profile.bloodType}
            field="bloodType"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Dị ứng"
            value={profile.allergy}
            field="allergy"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Bệnh mãn tính"
            value={profile.chronicDisease}
            field="chronicDisease"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Tăng huyết áp"
            value={profile.hypertension}
            field="hypertension"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Bệnh tim"
            value={profile.heartDisease}
            field="heartDisease"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Đột quỵ"
            value={profile.stroke}
            field="stroke"
            isEditing={isEditing}
            onUpdate={updateField}
            isLast
          />
        </View>

        <Text style={styles.sectionHeading}>Thông tin bổ sung</Text>
        <View style={styles.infoBox}>
          <InfoRow
            label="Tình trạng hôn nhân"
            value={profile.maritalStatus}
            field="maritalStatus"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Loại công việc"
            value={profile.jobType}
            field="jobType"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Nơi cư trú"
            value={profile.residence}
            field="residence"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Mức glucose TB"
            value={profile.glucose}
            field="glucose"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Chỉ số BMI"
            value={profile.bmi}
            field="bmi"
            isEditing={isEditing}
            onUpdate={updateField}
          />
          <InfoRow
            label="Tình trạng hút thuốc"
            value={profile.smoking}
            field="smoking"
            isEditing={isEditing}
            onUpdate={updateField}
            isLast
          />
        </View>

        <TouchableOpacity style={styles.footerAction}>
          <Ionicons name="download-outline" size={22} color="#0055aa" />
          <Text style={styles.footerActionText}>Xuất dữ liệu</Text>
          <Ionicons name="chevron-forward" size={18} color="#CCC" />
        </TouchableOpacity>
      </ScrollView>

      {/* THANH TAB BAR GIẢ ĐỒNG BỘ 100% */}
      <View style={styles.tabBarContainer}>
        <View style={styles.fakeTabBar}>
          <View style={styles.tabColumn}>
            <TouchableOpacity
              onPress={() =>
                router.replace(
                  userRole === "relative" ? "/(relative-tabs)" : "/(tabs)",
                )
              }
            >
              <Ionicons name="home-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={styles.tabColumn}>
            <TouchableOpacity
              onPress={() =>
                router.replace(
                  userRole === "relative"
                    ? "/(relative-tabs)/chat"
                    : "/(tabs)/chat",
                )
              }
            >
              <Ionicons name="chatbubble-outline" size={24} color="#999" />
            </TouchableOpacity>
          </View>
          <View style={styles.tabColumn}>
            <View style={styles.micButtonContainer}>
              <View style={styles.micButton}>
                <Ionicons name="mic" size={28} color="white" />
              </View>
            </View>
          </View>
          <View style={styles.tabColumn}>
            <Ionicons name="heart-outline" size={24} color="#999" />
          </View>
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

// Component phụ Row
const InfoRow = ({
  label,
  value,
  isEditing,
  onUpdate,
  field,
  isMultiline,
  isLast,
}: any) => (
  <View style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowValueArea}>
      {isEditing ? (
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={(v) => onUpdate(field, v)}
          multiline={isMultiline}
        />
      ) : (
        <Text style={styles.rowValueText}>{value || "---"}</Text>
      )}
      {!isEditing && (
        <Ionicons
          name="chevron-forward"
          size={14}
          color="#DDD"
          style={{ marginLeft: 5 }}
        />
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingHorizontal: 15,
  },
  headerLeftBtn: { position: "absolute", left: 15, zIndex: 1 },
  headerRightBtn: { position: "absolute", right: 15, zIndex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  editBtnText: { color: "#0055aa", fontWeight: "bold", fontSize: 16 },
  scrollContent: { padding: 20, paddingBottom: 150 },
  profileSummaryCard: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F0F5FA",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2b5297",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  profileName: { fontSize: 24, fontWeight: "bold", color: "#1A1A1A" },
  profileEmail: { fontSize: 14, color: "#999", marginTop: 4 },
  pillBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F7FF",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#AED6F1",
  },
  pillBtnText: { color: "#0055aa", fontWeight: "bold", fontSize: 16 },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 15,
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 25,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  rowLabel: { fontSize: 16, color: "#333", fontWeight: "600", flex: 1 },
  rowValueArea: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  rowValueText: { fontSize: 16, color: "#7f8c8d", textAlign: "right" },
  rowValueLocked: { fontSize: 16, color: "#AAA", fontStyle: "italic" },
  textInput: {
    fontSize: 16,
    color: "#0055aa",
    borderBottomWidth: 1,
    borderBottomColor: "#0055aa",
    textAlign: "right",
    minWidth: 100,
  },
  statusContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: 14, fontWeight: "bold", color: "#4CAF50" },
  footerAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
  },
  footerActionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 15,
  },

  // Tab Bar Giả Đồng Bộ
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    borderTopWidth: 0,
  },
  tabColumn: { flex: 1, alignItems: "center", justifyContent: "center" },
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
  micButtonContainer: { justifyContent: "center", alignItems: "center" },
  micButton: {
    width: 62,
    height: 62,
    backgroundColor: "#0088cc",
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    marginTop: -25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
