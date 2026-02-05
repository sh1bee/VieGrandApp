// app/medicine-management.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import AddMedicineModal from "../src/components/AddMedicineModal";
import { MedicineService } from "../src/services/MedicineService";

const USERS = [
  {
    id: "QVHClSZU11PBGl50WYGkoyPXgrw2",
    name: "Nguyễn Văn A",
    age: 75,
    initials: "NVA",
  },
  { id: "user_002", name: "Trần Thị B", age: 68, initials: "TTB" },
];

export default function MedicineManagement() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = MedicineService.subscribeMedicines(
      selectedUser.id,
      (data) => {
        setMedicines(data);
      },
    );
    return () => unsubscribe();
  }, [selectedUser]);

  // --- LOGIC XÓA THUỐC ---
  const handleConfirmDelete = (medicine: any) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa thuốc ${medicine.name} khỏi danh sách?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            const success = await MedicineService.deleteMedicine(
              selectedUser.id,
              medicine.id,
            );
            if (!success) alert("Không thể xóa thuốc. Vui lòng thử lại.");
          },
        },
      ],
    );
  };

  const handleAddMedicine = async (formData: any) => {
    const success = await MedicineService.addMedicine(
      selectedUser.id,
      formData,
    );
    if (success) setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý thuốc</Text>
        <TouchableOpacity
          style={styles.addIconBtn}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        <Text style={styles.sectionLabel}>Chọn người dùng</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.userRow}
        >
          {USERS.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.userCard,
                selectedUser.id === user.id && styles.userCardActive,
              ]}
              onPress={() => setSelectedUser(user)}
            >
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor:
                      selectedUser.id === user.id ? "#007AFF" : "#EEE",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: selectedUser.id === user.id ? "white" : "#666" },
                  ]}
                >
                  {user.initials}
                </Text>
              </View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userAge}>{user.age} tuổi</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listHeader}>
          <Text style={styles.sectionLabel}>Danh sách thuốc</Text>
          <Text style={styles.countText}>{medicines.length} thuốc</Text>
        </View>

        {medicines.map((item) => (
          <View key={item.id} style={styles.medCard}>
            <View style={styles.medHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.medName}>{item.name}</Text>
                <Text style={styles.medDosage}>{item.dosage}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Đang dùng</Text>
              </View>

              {/* --- GẮN HÀM XÓA VÀO ĐÂY --- */}
              <TouchableOpacity
                onPress={() => handleConfirmDelete(item)}
                style={{ padding: 5 }}
              >
                <Ionicons name="ellipsis-vertical" size={22} color="#999" />
              </TouchableOpacity>
            </View>

            <View style={styles.medInfo}>
              <InfoLine icon="time-outline" text={item.frequency} />
              <InfoLine icon="calendar-outline" text={item.duration} />
              {item.note ? (
                <InfoLine icon="reader-outline" text={item.note} />
              ) : null}
            </View>

            <View style={styles.divider} />

            <View style={styles.medFooter}>
              <View>
                <Text style={styles.footerLabel}>Tuân thủ</Text>
                <Text style={styles.complianceText}>{item.compliance}%</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.footerLabel}>Liều tiếp theo</Text>
                <Text style={styles.nextTimeText}>
                  {item.times?.split(",")[0] || "--:--"}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <AddMedicineModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddMedicine}
      />
    </SafeAreaView>
  );
}

const InfoLine = ({ icon, text }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 8,
    }}
  >
    <Ionicons name={icon} size={18} color="#999" />
    <Text style={{ color: "#666" }}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    paddingTop: 40,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  addIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  userRow: { flexDirection: "row", marginBottom: 25 },
  userCard: {
    width: 120,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    marginRight: 15,
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 3,
  },
  userCardActive: { borderColor: "#007AFF" },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  avatarText: { fontWeight: "bold" },
  userName: { fontSize: 13, fontWeight: "bold", textAlign: "center" },
  userAge: { fontSize: 11, color: "#999" },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  countText: { color: "#999", fontSize: 13 },
  medCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginTop: 15,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
  },
  medHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  medName: { fontSize: 18, fontWeight: "bold", color: "#333" },
  medDosage: { color: "#999", fontSize: 14 },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  statusText: { color: "#4CAF50", fontWeight: "bold", fontSize: 10 },
  medInfo: { marginVertical: 10 },
  divider: { height: 1, backgroundColor: "#F5F5F5" },
  medFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  footerLabel: { fontSize: 11, color: "#999", marginBottom: 5 },
  complianceText: { fontSize: 16, fontWeight: "bold", color: "#4CAF50" },
  nextTimeText: { fontSize: 16, fontWeight: "bold", color: "#333" },
});
