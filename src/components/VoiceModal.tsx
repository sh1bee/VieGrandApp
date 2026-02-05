// src/components/VoiceModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { VoiceService } from "../services/VoiceService";

interface VoiceModalProps {
  visible: boolean;
  onClose: () => void;
  onAction?: (command: string) => void;
  onSpeechText?: (text: string) => void;
  mode?: "command" | "text";
}

export default function VoiceModal({
  visible,
  onClose,
  onAction,
  onSpeechText,
  mode = "command",
}: VoiceModalProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [status, setStatus] = useState("Đang nghe...");
  const [userText, setUserText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- 1. HIỆU ỨNG VÒNG TRÒN ĐỒNG TÂM ---
  useEffect(() => {
    if (recording || isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recording, isSpeaking]);

  useEffect(() => {
    if (visible) {
      resetState();
      startRecording();
    } else {
      stopRecording();
      Speech.stop();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible]);

  const resetState = () => {
    setUserText("");
    setAiResponse("");
    setIsProcessing(false);
    setIsSpeaking(false);
    setIsFailed(false);
    setStatus("Cháu đang nghe...");
  };

  // --- 2. GHI ÂM ---
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") return;
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(recording);
      setIsFailed(false);
      setStatus("Cháu đang nghe...");

      // Tự động dừng sau 4 giây để phân tích
      timerRef.current = setTimeout(() => stopAndAnalyze(recording), 4000);
    } catch (err) {}
  }

  // --- 3. PHÂN TÍCH THÔNG MINH (GIẤU RAW TEXT) ---
  async function stopAndAnalyze(currentRec: Audio.Recording) {
    if (!currentRec) return;
    if (timerRef.current) clearTimeout(timerRef.current);

    setStatus("Đang suy nghĩ...");
    setIsProcessing(true);

    try {
      await currentRec.stopAndUnloadAsync();
      const uri = currentRec.getURI();
      setRecording(null);

      if (uri) {
        // Bước A: Chuyển giọng nói thành chữ
        const rawText = await VoiceService.transcribeAudio(uri);

        if (!rawText.trim()) {
          handleAIError("Cháu chưa nghe rõ ạ...");
          return;
        }

        // Chế độ Tin nhắn: Hiện văn bản để người dùng kiểm tra
        if (mode === "text") {
          setUserText(`"${rawText}"`);
          setTimeout(() => {
            if (onSpeechText) onSpeechText(rawText);
            onClose();
          }, 1000);
          return;
        }

        // Chế độ Lệnh thoại: Không hiện rawText ngay, gửi qua Llama để lọc/đoán ý
        const result = await VoiceService.processUserRequest(rawText);

        if (result.type === "ACTION") {
          // Hiện câu đã được AI sửa đúng (VD: Mở Cài đặt)
          handleAIResponse(
            "ACTION",
            result.message || "Dạ vâng ạ",
            result.content,
          );
        } else if (result.type === "CHAT" && result.content !== "UNKNOWN") {
          // Tâm sự
          handleAIResponse("CHAT", result.content);
        } else {
          handleAIError("Cháu không nghe rõ, bác nói lại nhé?");
        }
      }
    } catch (e) {
      handleAIError("Có lỗi kết nối, bác thử lại giúp cháu.");
    }
  }

  const handleAIResponse = (
    type: "ACTION" | "CHAT",
    message: string,
    actionCommand?: string,
  ) => {
    setIsProcessing(false);
    setAiResponse(message);
    setIsSpeaking(true);

    Speech.speak(message, {
      language: "vi-VN",
      rate: 0.9,
      onDone: () => {
        setIsSpeaking(false);
        if (type === "ACTION" && onAction && actionCommand) {
          onAction(actionCommand);
        }
        if (type === "CHAT") {
          setStatus("Bác muốn nói gì nữa không ạ?");
          // startRecording(); // Bật dòng này nếu muốn trò chuyện liên tục
        }
      },
    });
  };

  const handleAIError = (msg: string) => {
    setIsProcessing(false);
    setIsFailed(true);
    setAiResponse(msg);
    setStatus("Bác nói lại nhé?");
  };

  async function stopRecording() {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch (e) {}
      setRecording(null);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, isSpeaking && styles.cardSpeaking]}>
          <Text style={styles.title}>{status}</Text>

          <View style={styles.micArea}>
            <View style={styles.iconContainer}>
              {/* Vòng tròn Animation đồng tâm 100% */}
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: recording || isSpeaking ? 1 : 0,
                    backgroundColor: isSpeaking
                      ? "rgba(76, 175, 80, 0.3)"
                      : "rgba(0, 136, 204, 0.3)",
                  },
                ]}
              />

              <TouchableOpacity
                style={[
                  styles.micCircle,
                  recording
                    ? { backgroundColor: "#FF3B30" }
                    : isSpeaking
                      ? { backgroundColor: "#4CAF50" }
                      : isFailed
                        ? { backgroundColor: "#999" }
                        : null,
                ]}
                onPress={() => {
                  if (recording) stopAndAnalyze(recording);
                  else if (isSpeaking) {
                    Speech.stop();
                    setIsSpeaking(false);
                  } else {
                    resetState();
                    startRecording();
                  }
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <Ionicons
                    name={
                      recording
                        ? "stop"
                        : isSpeaking
                          ? "volume-high"
                          : isFailed
                            ? "refresh"
                            : "mic"
                    }
                    size={45}
                    color="white"
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* HIỂN THỊ HỘI THOẠI */}
          <View style={styles.chatContainer}>
            {/* Raw text chỉ hiện ở mode tin nhắn */}
            {mode === "text" && userText ? (
              <Text style={styles.userText}>{userText}</Text>
            ) : null}

            {/* Luôn hiện câu trả lời/xác nhận sạch sẽ từ AI */}
            {aiResponse ? (
              <View style={[styles.aiBubble, isFailed && styles.aiBubbleError]}>
                <Text style={[styles.aiText, isFailed && { color: "#E74C3C" }]}>
                  {aiResponse}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>

            {isFailed && (
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  resetState();
                  startRecording();
                }}
              >
                <Text style={styles.retryText}>Nói lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "white",
    width: "85%",
    borderRadius: 30,
    padding: 25,
    alignItems: "center",
    elevation: 20,
  },
  cardSpeaking: { borderColor: "#4CAF50", borderWidth: 2 },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0055aa",
    marginBottom: 20,
    textAlign: "center",
  },

  micArea: { height: 140, justifyContent: "center", alignItems: "center" },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  micCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#0088cc",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    elevation: 10,
  },
  pulseCircle: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    zIndex: 1,
  },

  chatContainer: { width: "100%", marginVertical: 10, minHeight: 60 },
  userText: {
    textAlign: "right",
    color: "#999",
    fontStyle: "italic",
    fontSize: 14,
    marginBottom: 8,
  },
  aiBubble: {
    backgroundColor: "#F0F5FA",
    padding: 15,
    borderRadius: 15,
    width: "100%",
  },
  aiBubbleError: { backgroundColor: "#FFF5F5" },
  aiText: {
    fontSize: 17,
    color: "#333",
    fontWeight: "bold",
    textAlign: "center",
  },

  footer: {
    flexDirection: "row",
    gap: 20,
    marginTop: 20,
    alignItems: "center",
  },
  retryBtn: {
    backgroundColor: "#0088cc",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: { color: "white", fontWeight: "bold" },
  closeBtn: { padding: 10 },
  closeText: { fontSize: 16, color: "#999", fontWeight: "bold" },
});
