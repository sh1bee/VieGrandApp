// app/health/chart.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LineChart } from "react-native-gifted-charts";
import { HealthService } from "../../src/services/HealthService";

const { width } = Dimensions.get("window");

export default function HealthChart() {
  const router = useRouter();

  // 1. Quản lý trạng thái lọc
  const [dataType, setDataType] = useState("BP"); // BP: Huyết áp, HR: Nhịp tim, ALL: Tất cả
  const [timeRange, setTimeRange] = useState(7); // 1, 7, 30 ngày

  // 2. State chứa dữ liệu biểu đồ
  const [sysData, setSysData] = useState<any[]>([]);
  const [diaData, setDiaData] = useState<any[]>([]);
  const [pulseData, setPulseData] = useState<any[]>([]);

  // 3. Hàm lấy dữ liệu thật từ Firebase
  const loadRealData = async () => {
    try {
      const records = await HealthService.getRecords(timeRange);
      const sorted = [...records].reverse();

      const sys = sorted.map((r: any) => ({
        value: r.sys,
        label: r.createdAt
          ? `${new Date(r.createdAt.seconds * 1000).getDate()}/${new Date(r.createdAt.seconds * 1000).getMonth() + 1}`
          : "",
        dataPointText: r.sys.toString(),
      }));

      const dia = sorted.map((r: any) => ({ value: r.dia }));

      const pulse = sorted.map((r: any) => ({
        value: r.pulse,
        label: r.createdAt
          ? `${new Date(r.createdAt.seconds * 1000).getDate()}/${new Date(r.createdAt.seconds * 1000).getMonth() + 1}`
          : "",
        dataPointText: r.pulse.toString(),
      }));

      setSysData(sys);
      setDiaData(dia);
      setPulseData(pulse);
    } catch (error) {
      console.log("Lỗi load chart:", error);
    }
  };

  // Cập nhật dữ liệu mỗi khi thay đổi thời gian
  useEffect(() => {
    loadRealData();
  }, [timeRange]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8F9FA" }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#0088cc" />
          </TouchableOpacity>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.headerTitle}>Biểu đồ sức khỏe</Text>
            <Text style={styles.headerSub}>Theo dõi sức khỏe của bạn</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Loại dữ liệu Tabs */}
        <View style={styles.tabRow}>
          <CategoryTab
            title="Huyết áp"
            icon="pulse"
            active={dataType === "BP"}
            onPress={() => setDataType("BP")}
          />
          <CategoryTab
            title="Nhịp tim"
            icon="heart-outline"
            active={dataType === "HR"}
            onPress={() => setDataType("HR")}
          />
          <CategoryTab
            title="Tất cả"
            icon="stats-chart-outline"
            active={dataType === "ALL"}
            onPress={() => setDataType("ALL")}
          />
        </View>

        {/* Thời gian Tabs */}
        <Text style={styles.label}>Thời gian:</Text>
        <View style={styles.timeRow}>
          {[1, 7, 30, 90].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.timeBtn, timeRange === d && styles.timeBtnActive]}
              onPress={() => setTimeRange(d)}
            >
              <Text
                style={[
                  styles.timeText,
                  timeRange === d && styles.timeTextActive,
                ]}
              >
                {d} ngày
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Thẻ Biểu đồ trắng */}
        <View style={styles.chartCard}>
          <LineChart
            thickness={3}
            color1={dataType === "HR" ? "#6200EE" : "#FF4D4D"}
            color2="#FFA500"
            color3="#6200EE"
            data={dataType === "HR" ? pulseData : sysData}
            data2={dataType === "HR" ? [] : diaData}
            data3={dataType === "ALL" ? pulseData : []}
            height={250}
            width={width - 80}
            initialSpacing={20}
            spacing={40}
            noOfSections={4}
            yAxisColor="#EEE"
            xAxisColor="#EEE"
            yAxisTextStyle={{ color: "#999" }}
            xAxisLabelTextStyle={{ color: "#999", fontSize: 10 }}
            curved
            hideDataPoints={false}
            dataPointsRadius={4}
            textFontSize={10}
            textColor="#666"
          />

          {/* Chú thích (Legend) dưới biểu đồ */}
          <View style={styles.legendContainer}>
            {(dataType === "BP" || dataType === "ALL") && (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: "#FF4D4D" }]} />
                  <Text style={styles.legendLabel}>Tâm thu</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: "#FFA500" }]} />
                  <Text style={styles.legendLabel}>Tâm trương</Text>
                </View>
              </>
            )}
            {(dataType === "HR" || dataType === "ALL") && (
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: "#6200EE" }]} />
                <Text style={styles.legendLabel}>Nhịp tim</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-components
const CategoryTab = ({ title, icon, active, onPress }: any) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.tabActive]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={20} color={active ? "white" : "#0088cc"} />
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 20,
    elevation: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#333" },
  headerSub: { fontSize: 13, color: "#999" },

  tabRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  tab: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    elevation: 2,
  },
  tabActive: { backgroundColor: "#007AFF" },
  tabText: { fontWeight: "bold", color: "#007AFF" },
  tabTextActive: { color: "white" },

  label: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  timeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#EEE",
  },
  timeBtnActive: { backgroundColor: "#007AFF", borderColor: "#007AFF" },
  timeText: { color: "#333", fontWeight: "500" },
  timeTextActive: { color: "white" },

  chartCard: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 20,
    paddingBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  legendContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    flexWrap: "wrap",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: "#666", fontWeight: "500" },
});
