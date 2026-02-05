// app/reminders.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VoiceModal from "../src/components/VoiceModal";
import { auth, db } from "../src/config/firebase";
import { NotificationService } from "../src/services/NotificationService";
import { getDateStrings } from "../src/utils/dateHelper";

export default function RemindersScreen() {
  const router = useRouter();
  const currentUser = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [todayReminders, setTodayReminders] = useState<any[]>([]);
  const [tomorrowReminders, setTomorrowReminders] = useState<any[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<any[]>([]);
  const [completedReminders, setCompletedReminders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [voiceVisible, setVoiceVisible] = useState(false);

  // --- LOGIC LẮNG NGHE REAL-TIME ---
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "users", currentUser.uid, "reminders"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const { todayStr, tomorrowStr } = getDateStrings();

      // 1. Phân loại danh sách
      setTodayReminders(
        allData.filter((r: any) => !r.isDone && r.date === todayStr),
      );
      setTomorrowReminders(
        allData.filter((r: any) => !r.isDone && r.date === tomorrowStr),
      );
      setUpcomingReminders(
        allData.filter(
          (r: any) =>
            !r.isDone && r.date !== todayStr && r.date !== tomorrowStr,
        ),
      );
      setCompletedReminders(allData.filter((r: any) => r.isDone));
      setTotalCount(allData.length);

      // 2. Lên lịch thông báo hệ thống cho các mục mới chưa hoàn thành
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          if (!data.isDone) {
            NotificationService.scheduleReminder(
              data.title,
              data.content,
              data.date,
              data.time,
              change.doc.id,
            );
          }
        }
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleComplete = async (id: string) => {
    try {
      const reminderRef = doc(
        db,
        "users",
        currentUser?.uid || "",
        "reminders",
        id,
      );
      await updateDoc(reminderRef, { isDone: true });
      if (Platform.OS !== "web") Alert.alert("Thành công", "Đã ghi nhận!");
    } catch (error) {
      alert("Lỗi cập nhật.");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", currentUser?.uid || "", "reminders"),
      );
      await getDocs(q);
    } catch (e) {
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleVoiceAction = (command: string) => {
    setVoiceVisible(false);
    switch (command) {
      case "NAV_HOME":
        router.replace("/(tabs)");
        break;
      case "NAV_CHAT":
        router.push("/(tabs)/chat");
        break;
      case "NAV_HEALTH":
        router.push("/health");
        break;
      case "NAV_SETTINGS":
        router.push("/settings");
        break;
      case "GO_BACK":
        router.back();
        break;
      case "ACTION_SOS":
        alert("Đang gọi cứu trợ!");
        break;
      default:
        Alert.alert("Thông báo", "Lệnh thoại không khớp.");
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        }}
      >
        <ActivityIndicator size="large" color="#0055aa" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0055aa" />
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>Nhắc nhở</Text>
          <Text style={styles.headerSub}>Quản lý các nhắc nhở của bạn</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={handleRefresh}>
          <Ionicons name="refresh-outline" size={24} color="#0055aa" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* TỔNG QUAN */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <View style={styles.statsTitleRow}>
              <View style={styles.iconBox}>
                <Ionicons name="stats-chart" size={20} color="white" />
              </View>
              <Text style={styles.statsMainTitle}>Tổng quan</Text>
            </View>
            <View style={styles.totalBadge}>
              <Text style={styles.totalNum}>{totalCount}</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            <StatItem
              icon="time"
              count={todayReminders.length}
              label="Hôm nay"
              color="#E3F2FD"
              iconColor="#1565C0"
            />
            <StatItem
              icon="calendar"
              count={tomorrowReminders.length}
              label="Ngày mai"
              color="#E8F5E9"
              iconColor="#2E7D32"
            />
            <StatItem
              icon="calendar-outline"
              count={upcomingReminders.length}
              label="Sắp tới"
              color="#FFF3E0"
              iconColor="#EF6C00"
            />
            <StatItem
              icon="checkmark-circle"
              count={completedReminders.length}
              label="Đã xong"
              color="#F5F5F5"
              iconColor="#999"
            />
          </View>
        </View>

        {/* LISTS */}
        <ListSection
          title="Hôm nay"
          color="#1565C0"
          list={todayReminders}
          onComplete={handleComplete}
          icon="time"
        />
        <ListSection
          title="Ngày mai"
          color="#2E7D32"
          list={tomorrowReminders}
          onComplete={handleComplete}
          icon="calendar"
        />
        <ListSection
          title="Sắp tới"
          color="#EF6C00"
          list={upcomingReminders}
          onComplete={handleComplete}
          icon="calendar-outline"
        />

        {completedReminders.length > 0 && (
          <>
            <SectionHeader
              title="Đã hoàn thành"
              count={completedReminders.length}
              icon="checkmark-circle"
              color="#999"
            />
            <View style={{ opacity: 0.7 }}>
              {completedReminders.map((item) => (
                <ReminderItem key={item.id} data={item} />
              ))}
            </View>
          </>
        )}

        {totalCount === 0 && (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons name="notifications-off-outline" size={60} color="#DDD" />
            <Text style={{ color: "#999" }}>Trống</Text>
          </View>
        )}
      </ScrollView>

      {/* MIC NÚT */}
      <View style={styles.floatingMicContainer}>
        <TouchableOpacity
          style={styles.micButton}
          activeOpacity={0.8}
          onPress={() => setVoiceVisible(true)}
        >
          <Ionicons name="mic" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <VoiceModal
        visible={voiceVisible}
        mode="command"
        onAction={handleVoiceAction}
        onClose={() => setVoiceVisible(false)}
      />
    </SafeAreaView>
  );
}

// --- HELPER COMPONENTS ---
const ListSection = ({ title, color, list, onComplete, icon }: any) => {
  if (list.length === 0) return null;
  return (
    <>
      <SectionHeader
        title={title}
        count={list.length}
        icon={icon}
        color={color}
      />
      {list.map((item: any) => (
        <ReminderItem
          key={item.id}
          data={item}
          onPress={() => onComplete(item.id)}
        />
      ))}
    </>
  );
};

const StatItem = ({ icon, count, label, color, iconColor }: any) => (
  <View style={[styles.statItem, { backgroundColor: color }]}>
    <View style={styles.statItemTop}>
      <Ionicons name={icon} size={22} color={iconColor} />
      <Text style={[styles.statItemCount, { color: iconColor }]}>{count}</Text>
    </View>
    <Text style={[styles.statItemLabel, { color: iconColor }]}>{label}</Text>
  </View>
);

const SectionHeader = ({ title, count, icon, color }: any) => (
  <View style={styles.sectionHeader}>
    <View style={[styles.sectionIconBox, { backgroundColor: color + "20" }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={[styles.countBadge, { backgroundColor: color }]}>
      <Text style={styles.countBadgeText}>{count}</Text>
    </View>
  </View>
);

const ReminderItem = ({ data, onPress }: any) => (
  <View style={styles.reminderCard}>
    <View style={styles.reminderMain}>
      <View style={styles.reminderIconBox}>
        <Ionicons
          name={
            data.type === "pill" ? "medkit-outline" : "notifications-outline"
          }
          size={24}
          color="#0088cc"
        />
        <Text style={styles.remindTag}>
          {data.type === "pill" ? "THUỐC" : "LỊCH"}
        </Text>
      </View>
      <View style={styles.reminderInfo}>
        <Text style={[styles.remindTitle, data.isDone && styles.strikethrough]}>
          {data.title}
        </Text>
        <Text style={styles.timeText}>
          {data.time} • {data.date}
        </Text>
        <Text style={[styles.remindNote, data.isDone && styles.strikethrough]}>
          {data.content}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.doneBtn, data.isDone && styles.doneBtnFinished]}
        onPress={onPress}
        disabled={data.isDone}
      >
        <Ionicons
          name={data.isDone ? "checkmark-circle" : "checkmark"}
          size={16}
          color={data.isDone ? "#1565C0" : "white"}
        />
        <Text style={[styles.doneBtnText, data.isDone && { color: "#1565C0" }]}>
          {data.isDone ? "Xong" : "Hoàn thành"}
        </Text>
      </TouchableOpacity>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  headerBtn: { backgroundColor: "#F0F5FA", padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  headerSub: { fontSize: 12, color: "#999" },
  statsCard: {
    margin: 15,
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statsTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBox: { backgroundColor: "#0055aa", padding: 8, borderRadius: 12 },
  statsMainTitle: { fontSize: 17, fontWeight: "bold" },
  totalBadge: {
    backgroundColor: "#F0F7FF",
    width: 35,
    height: 35,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1E3F8",
  },
  totalNum: { fontSize: 18, fontWeight: "bold", color: "#0055aa" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statItem: {
    width: "48%",
    padding: 12,
    borderRadius: 18,
    height: 90,
    justifyContent: "space-between",
  },
  statItemTop: { flexDirection: "row", justifyContent: "space-between" },
  statItemCount: { fontSize: 22, fontWeight: "bold" },
  statItemLabel: { fontWeight: "bold", fontSize: 13 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
  },
  sectionIconBox: { padding: 6, borderRadius: 8, marginRight: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", flex: 1, color: "#1A1A1A" },
  countBadge: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    justifyContent: "center",
    alignItems: "center",
  },
  countBadgeText: { color: "white", fontWeight: "bold", fontSize: 12 },
  reminderCard: {
    marginHorizontal: 15,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  reminderMain: { flexDirection: "row", alignItems: "center" },
  reminderIconBox: { alignItems: "center", width: 55 },
  remindTag: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#0088cc",
    marginTop: 5,
    backgroundColor: "#E1F5FE",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reminderInfo: { flex: 1, marginLeft: 12 },
  remindTitle: { fontSize: 16, fontWeight: "bold", color: "#333" },
  timeText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
    marginVertical: 4,
  },
  remindNote: { fontSize: 13, color: "#666", lineHeight: 18 },
  strikethrough: { textDecorationLine: "line-through", color: "#CCC" },
  doneBtn: {
    flexDirection: "row",
    backgroundColor: "#0055aa",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 22,
    alignItems: "center",
    gap: 5,
  },
  doneBtnFinished: {
    backgroundColor: "#E3F2FD",
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  doneBtnText: { color: "white", fontSize: 11, fontWeight: "bold" },
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
