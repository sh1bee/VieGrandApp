// app/(relative-tabs)/reports.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { BarChart, LineChart, PieChart } from "react-native-gifted-charts";
import { auth, db } from "../../src/config/firebase";

const { width } = Dimensions.get("window");

export default function ReportsScreen() {
  const router = useRouter();

  // -- Quản lý danh sách người thân --
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [selectedElderly, setSelectedElderly] = useState<any>(null);
  const [loadingFamily, setLoadingFamily] = useState(true);

  // -- Quản lý Filter --
  const [selectedTime, setSelectedTime] = useState(7);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingData, setLoadingData] = useState(false);

  // -- States dữ liệu thật (Đã thêm <any> để fix lỗi 2322) --
  const [healthStats, setHealthStats] = useState<any>({
    sys: [],
    dia: [],
    pulse: [],
    latest: null,
    avgSys: 0,
    avgPulse: 0,
    statusDist: [],
  });
  const [medStats, setMedStats] = useState<any>({
    list: [],
    avgCompliance: 0,
    missedCount: 0,
  });
  const [activityStats, setActivityStats] = useState<any>({
    list: [],
    totalDone: 0,
    ratio: 0,
  });

  // 1. LẤY DANH SÁCH NGƯỜI CAO TUỔI THẬT
  useEffect(() => {
    const fetchFamily = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const myDoc = await getDoc(doc(db, "users", user.uid));
        if (myDoc.exists()) {
          const memberIds = myDoc.data().familyMembers || [];
          const membersData = [];
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
          if (membersData.length > 0) setSelectedElderly(membersData[0]);
        }
      } catch (e) {
        console.log("Lỗi tải gia đình:", e);
      } finally {
        setLoadingFamily(false);
      }
    };
    fetchFamily();
  }, []);

  // 2. LẤY DỮ LIỆU TỔNG HỢP THẬT
  useEffect(() => {
    if (selectedElderly) fetchAllRealData(selectedElderly.id);
  }, [selectedElderly, selectedTime]);

  const fetchAllRealData = async (uid: string) => {
    setLoadingData(true);
    try {
      const timeThreshold = new Date();
      timeThreshold.setDate(timeThreshold.getDate() - selectedTime);
      const firestoreThreshold = Timestamp.fromDate(timeThreshold);

      // --- A. Dữ liệu Sức khỏe ---
      const qHealth = query(
        collection(db, "users", uid, "health_records"),
        where("createdAt", ">=", firestoreThreshold),
        orderBy("createdAt", "desc"),
      );
      const snapHealth = await getDocs(qHealth);
      const recsHealth = snapHealth.docs.map((d) => d.data());

      if (recsHealth.length > 0) {
        const sorted = [...recsHealth].reverse();
        const avgS = Math.round(
          recsHealth.reduce((acc, curr) => acc + curr.sys, 0) /
            recsHealth.length,
        );
        const avgP = Math.round(
          recsHealth.reduce((acc, curr) => acc + curr.pulse, 0) /
            recsHealth.length,
        );

        const good = recsHealth.filter((r) => r.sys <= 120).length;
        const warn = recsHealth.filter(
          (r) => r.sys > 120 && r.sys <= 140,
        ).length;
        const bad = recsHealth.filter((r) => r.sys > 140).length;

        setHealthStats({
          latest: recsHealth[0],
          avgSys: avgS,
          avgPulse: avgP,
          sys: sorted.map((r, i) => ({ value: r.sys, label: `L${i + 1}` })),
          dia: sorted.map((r) => ({ value: r.dia })),
          pulse: sorted.map((r, i) => ({ value: r.pulse, label: `L${i + 1}` })),
          statusDist: [
            { value: good, color: "#4CAF50" },
            { value: warn, color: "#FF9800" },
            { value: bad, color: "#F44336" },
          ],
        });
      } else {
        setHealthStats({
          sys: [],
          dia: [],
          pulse: [],
          latest: null,
          avgSys: 0,
          avgPulse: 0,
          statusDist: [],
        });
      }

      // --- B. Dữ liệu Thuốc men ---
      const qMeds = query(collection(db, "users", uid, "medications"));
      const snapMeds = await getDocs(qMeds);
      const recsMeds = snapMeds.docs.map((d) => d.data());
      if (recsMeds.length > 0) {
        const avgC = Math.round(
          recsMeds.reduce((acc, curr) => acc + (curr.compliance || 0), 0) /
            recsMeds.length,
        );
        setMedStats({
          list: recsMeds.map((m) => ({
            value: m.compliance || 0,
            label: m.name.slice(0, 3),
          })),
          avgCompliance: avgC,
          missedCount: recsMeds.filter((m) => (m.compliance || 0) < 80).length,
        });
      } else {
        setMedStats({ list: [], avgCompliance: 0, missedCount: 0 });
      }

      // --- C. Dữ liệu Hoạt động ---
      const qAct = query(
        collection(db, "users", uid, "reminders"),
        where("createdAt", ">=", firestoreThreshold),
      );
      const snapAct = await getDocs(qAct);
      const recsAct = snapAct.docs.map((d) => d.data());
      if (recsAct.length > 0) {
        const done = recsAct.filter((a) => a.isDone).length;
        setActivityStats({
          list: recsAct
            .slice(0, 7)
            .map((a, i) => ({ value: a.isDone ? 10 : 2, label: `N${i + 1}` })),
          totalDone: done,
          ratio: Math.round((done / recsAct.length) * 100),
        });
      } else {
        setActivityStats({ list: [], totalDone: 0, ratio: 0 });
      }
    } catch (e) {
      console.log("Lỗi fetch data:", e);
    } finally {
      setLoadingData(false);
    }
  };

  // --- RENDERS ---

  const renderOverview = () => (
    <View>
      <Text style={styles.sectionTitle}>Tổng quan sức khỏe</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          icon="heart"
          color="#FF5252"
          value={
            healthStats.latest
              ? `${healthStats.latest.sys}/${healthStats.latest.dia}`
              : "0/0"
          }
          label="Huyết áp"
        />
        <MetricCard
          icon="pulse"
          color="#007AFF"
          value={healthStats.latest ? healthStats.latest.pulse : "0"}
          label="Nhịp tim"
        />
        <MetricCard
          icon="calendar"
          color="#4CAF50"
          value={healthStats.latest ? "Mới đây" : "---"}
          label="Lần đo cuối"
        />
      </View>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Diễn biến huyết áp</Text>
        {healthStats.sys.length > 0 ? (
          <LineChart
            data={healthStats.sys}
            data2={healthStats.dia}
            height={180}
            width={width - 80}
            color1="#FF4D4D"
            color2="#007AFF"
            curved
            areaChart
            initialSpacing={20}
          />
        ) : (
          <Text style={styles.emptyText}>
            Chưa có dữ liệu đo trong {selectedTime} ngày qua
          </Text>
        )}
      </View>
    </View>
  );

  const renderHealth = () => (
    <View>
      <Text style={styles.sectionTitle}>Báo cáo chi tiết</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          icon="thermometer"
          color="#FF9800"
          value={healthStats.avgSys > 0 ? healthStats.avgSys + " mmHg" : "---"}
          label="Huyết áp TB"
        />
        <MetricCard
          icon="heart-half"
          color="#E91E63"
          value={
            healthStats.avgPulse > 0 ? healthStats.avgPulse + " bpm" : "---"
          }
          label="Nhịp tim TB"
        />
      </View>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Phân bổ trạng thái</Text>
        {healthStats.statusDist.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-around",
              width: "100%",
            }}
          >
            <PieChart
              data={healthStats.statusDist}
              radius={70}
              innerRadius={50}
            />
            <View>
              <LegendItem color="#4CAF50" label="Tốt" />
              <LegendItem color="#FF9800" label="Chú ý" />
              <LegendItem color="#F44336" label="Can thiệp" />
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>Không có dữ liệu phân tích</Text>
        )}
      </View>
    </View>
  );

  const renderActivity = () => (
    <View>
      <Text style={styles.sectionTitle}>Báo cáo hoạt động</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          icon="checkmark-done"
          color="#00BCD4"
          value={activityStats.totalDone}
          label="Việc hoàn thành"
        />
        <MetricCard
          icon="trending-up"
          color="#4CAF50"
          value={activityStats.ratio + "%"}
          label="Tỷ lệ tuân thủ"
        />
      </View>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Hoạt động hàng ngày</Text>
        {activityStats.list.length > 0 ? (
          <BarChart
            data={activityStats.list}
            barWidth={20}
            frontColor={"#D1E3F8"}
            height={180}
            width={width - 80}
          />
        ) : (
          <Text style={styles.emptyText}>Chưa có lịch sử nhắc nhở</Text>
        )}
      </View>
    </View>
  );

  const renderMedicine = () => (
    <View>
      <Text style={styles.sectionTitle}>Báo cáo thuốc men</Text>
      <View style={styles.metricsRow}>
        <MetricCard
          icon="checkmark-circle"
          color="#4CAF50"
          value={medStats.avgCompliance + "%"}
          label="Tỷ lệ uống thuốc"
        />
        <MetricCard
          icon="alert-circle"
          color="#FF9800"
          value={medStats.missedCount}
          label="Thuốc hay quên"
        />
      </View>
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>
          Tỉ lệ tuân thủ theo loại thuốc (%)
        </Text>
        {medStats.list.length > 0 ? (
          <BarChart
            data={medStats.list}
            barWidth={20}
            frontColor={"#E8F5E9"}
            height={180}
            width={width - 80}
            maxValue={100}
          />
        ) : (
          <Text style={styles.emptyText}>Chưa có danh sách thuốc</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Thông báo", "Tính năng chia sẻ đang phát triển")
          }
        >
          <Ionicons name="share-social-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionLabel}>Chọn người dùng</Text>
        {loadingFamily ? (
          <ActivityIndicator color="#007AFF" />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.userPicker}
          >
            {familyMembers.map((member) => (
              <TouchableOpacity
                key={member.id}
                onPress={() => setSelectedElderly(member)}
                style={[
                  styles.userCard,
                  selectedElderly?.id === member.id && styles.userCardActive,
                ]}
              >
                <View
                  style={[
                    styles.miniAvatar,
                    {
                      backgroundColor:
                        selectedElderly?.id === member.id ? "#007AFF" : "#EEE",
                    },
                  ]}
                >
                  <Text
                    style={{
                      color:
                        selectedElderly?.id === member.id ? "white" : "#666",
                      fontWeight: "bold",
                    }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.miniName} numberOfLines={1}>
                  {member.name}
                </Text>
                <Text style={{ fontSize: 9, color: "#999" }}>
                  {member.age || "--"} tuổi
                </Text>
              </TouchableOpacity>
            ))}
            {familyMembers.length === 0 && (
              <Text style={{ color: "#999", marginLeft: 10 }}>
                Chưa kết nối ai
              </Text>
            )}
          </ScrollView>
        )}

        <Text style={styles.sectionLabel}>Thời gian</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {[1, 7, 30, 90, 365].map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.pillBtn,
                selectedTime === d && styles.pillBtnActive,
              ]}
              onPress={() => setSelectedTime(d)}
            >
              <Text
                style={[
                  styles.pillText,
                  selectedTime === d && styles.pillTextActive,
                ]}
              >
                {d === 365 ? "1 năm" : `${d} ngày`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionLabel}>Loại báo cáo</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabRow}
        >
          <TabItem
            icon="stats-chart"
            label="Tổng quan"
            active={activeTab === "overview"}
            onPress={() => setActiveTab("overview")}
          />
          <TabItem
            icon="heart"
            label="Sức khỏe"
            active={activeTab === "health"}
            onPress={() => setActiveTab("health")}
          />
          <TabItem
            icon="walk"
            label="Hoạt động"
            active={activeTab === "activity"}
            onPress={() => setActiveTab("activity")}
          />
          <TabItem
            icon="medkit"
            label="Thuốc men"
            active={activeTab === "medicine"}
            onPress={() => setActiveTab("medicine")}
          />
        </ScrollView>

        {loadingData ? (
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={{ marginTop: 50 }}
          />
        ) : (
          <View>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "health" && renderHealth()}
            {activeTab === "activity" && renderActivity()}
            {activeTab === "medicine" && renderMedicine()}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS & STYLES ---
const TabItem = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.tabItem, active && styles.tabItemActive]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={18} color={active ? "white" : "#007AFF"} />
    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const MetricCard = ({ icon, color, value, label }: any) => (
  <View style={styles.metricCard}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={styles.metricValue}>{value || "0"}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const LegendItem = ({ color, label }: any) => (
  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={{ fontSize: 12, color: "#666" }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "white",
    paddingTop: 45,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  iconBtn: { padding: 5 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 10,
    color: "#333",
  },
  userPicker: { flexDirection: "row", marginBottom: 20 },
  userCard: {
    width: 100,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    marginRight: 15,
    elevation: 3,
  },
  userCardActive: { borderWidth: 2, borderColor: "#007AFF" },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  miniName: { fontSize: 11, fontWeight: "bold" },
  filterRow: { flexDirection: "row", marginBottom: 20 },
  pillBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  pillBtnActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  pillText: { color: "#666" },
  pillTextActive: { color: "white", fontWeight: "bold" },
  tabRow: { flexDirection: "row", marginBottom: 20 },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "white",
    marginRight: 10,
    elevation: 2,
  },
  tabItemActive: { backgroundColor: "#007AFF" },
  tabLabel: { marginLeft: 8, color: "#666", fontWeight: "bold", fontSize: 13 },
  tabLabelActive: { color: "white" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  metricCard: {
    width: "31%",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
    elevation: 3,
    marginBottom: 10,
  },
  metricValue: { fontSize: 16, fontWeight: "bold", marginVertical: 5 },
  metricLabel: { fontSize: 9, color: "#999", textAlign: "center" },
  chartCard: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    alignItems: "center",
    minHeight: 150,
    justifyContent: "center",
    width: "100%",
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  emptyText: { color: "#999", fontStyle: "italic", fontSize: 13 },
});
