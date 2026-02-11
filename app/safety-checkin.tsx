// app/safety-checkin.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafetyCheckInService } from "../src/services/SafetyCheckInService";

const QUESTIONS = [
  "Hôm nay bạn có khỏe không?",
  "Bạn đã ăn sáng chưa?",
  "Bạn đã uống thuốc chưa?",
  "Bạn có ngủ ngon đêm qua không?",
  "Bạn có cảm thấy mệt không?",
  "Bạn đã ăn trưa chưa?",
  "Bạn có đau đầu không?",
  "Bạn có cảm thấy chóng mặt không?",
  "Bạn đã uống đủ nước chưa?",
  "Bạn có vận động hôm nay không?",
  "Bạn đã ăn tối chưa?",
  "Bạn có cảm thấy khỏe mạnh không?",
  "Bạn có đau ngực không?",
  "Bạn có khó thở không?",
  "Bạn có cảm thấy lo lắng không?",
  "Bạn đã đi dạo hôm nay chưa?",
  "Bạn có ngủ trưa không?",
  "Bạn có cảm thấy đói không?",
  "Bạn có nhớ uống thuốc không?",
  "Bạn có gặp ai hôm nay không?",
  "Bạn có xem TV hôm nay không?",
  "Bạn có đọc báo không?",
  "Bạn có gọi điện cho con cháu không?",
  "Bạn có cảm thấy cô đơn không?",
  "Bạn có đau lưng không?",
  "Bạn có đau chân không?",
  "Bạn có cảm thấy vui không?",
  "Bạn có ăn trái cây hôm nay không?",
  "Bạn có tắm rửa hôm nay chưa?",
  "Bạn có cảm thấy thoải mái không?",
];

export default function SafetyCheckIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<string>("");
  const [question, setQuestion] = useState("");
  const [hasCheckedToday, setHasCheckedToday] = useState(false);

  useEffect(() => {
    loadLastCheckIn();
    selectDailyQuestion();
  }, []);

  const selectDailyQuestion = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const questionIndex = dayOfMonth % QUESTIONS.length;
    setQuestion(QUESTIONS[questionIndex]);
  };

  const loadLastCheckIn = async () => {
    try {
      const data = await SafetyCheckInService.getHistory(1);
      if (data.length > 0) {
        const item = data[0] as any;
        if (item.timestamp) {
          const date = new Date(item.timestamp.seconds * 1000);
          setLastCheckIn(date.toLocaleString("vi-VN"));

          // Kiểm tra đã điểm danh hôm nay chưa
          const today = new Date();
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
          setHasCheckedToday(isToday);
        }
      }
    } catch (e) {
      console.log("Lỗi load:", e);
    }
  };

  const handleAnswer = async (answer: "yes" | "no") => {
    setLoading(true);
    try {
      await SafetyCheckInService.checkIn(question, answer);
      setHasCheckedToday(true);
      Alert.alert("✅ Cảm ơn bạn", "Gia đình đã nhận được thông tin!");
      loadLastCheckIn();
    } catch (e) {
      Alert.alert("Lỗi", "Không thể gửi. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {hasCheckedToday ? (
          <View style={styles.completedContainer}>
            <View style={styles.completedContent}>
              <Ionicons
                name="checkmark-done-circle"
                size={140}
                color="#4178BF"
              />

              <Text style={styles.completedTitle}>
                Bạn đã điểm danh{"\n"}hôm nay rồi!
              </Text>

              <Text style={styles.greetingText}>
                Chúc bạn một ngày mới tốt lành
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.questionContainer}>
            <TouchableOpacity
              style={styles.backBtnFloating}
              onPress={() => router.back()}
            ></TouchableOpacity>

            <Ionicons
              name="help-circle"
              size={100}
              color="#4178BF"
              style={{ marginBottom: 40 }}
            />

            <Text style={styles.questionText}>{question}</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.answerBtn, styles.yesBtn]}
                onPress={() => handleAnswer("yes")}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={50} color="white" />
                    <Text style={styles.answerText}>CÓ</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.answerBtn, styles.noBtn]}
                onPress={() => handleAnswer("no")}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={50} color="white" />
                    <Text style={styles.answerText}>KHÔNG</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {lastCheckIn && (
              <Text style={styles.lastCheckText}>Lần cuối: {lastCheckIn}</Text>
            )}
          </View>
        )}
      </ScrollView>

      {hasCheckedToday && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backHomeBtnText}>Quay về</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9ECF2" },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
  },

  // Completed state
  completedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  completedContent: {
    alignItems: "center",
  },
  completedTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0F528C",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
    lineHeight: 48,
  },
  greetingText: {
    fontSize: 20,
    color: "#0F528C",
    textAlign: "center",
    fontWeight: "500",
  },
  bottomButtonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: "#E9ECF2",
  },
  backHomeBtn: {
    backgroundColor: "#4178BF",
    paddingVertical: 20,
    borderRadius: 16,
    width: "100%",
  },
  backHomeBtnText: {
    fontSize: 19,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  // Question state
  questionContainer: {
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  backBtnFloating: {
    position: "absolute",
    top: -20,
    left: 0,
    padding: 8,
    zIndex: 10,
  },
  questionText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0F528C",
    marginBottom: 56,
    textAlign: "center",
    lineHeight: 44,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
    marginBottom: 32,
  },
  answerBtn: {
    flex: 1,
    paddingVertical: 44,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    elevation: 6,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  yesBtn: {
    backgroundColor: "#4178BF",
    shadowColor: "#4178BF",
  },
  noBtn: {
    backgroundColor: "#719ED9",
    shadowColor: "#719ED9",
  },
  answerText: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 2,
  },
  lastCheckText: {
    marginTop: 8,
    color: "#0F528C",
    fontSize: 15,
    fontWeight: "500",
  },
});
