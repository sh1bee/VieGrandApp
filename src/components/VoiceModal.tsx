// src/components/VoiceModal.tsx
import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Cháu đang nghe...");
  const [userText, setUserText] = useState("");
  const [interimText, setInterimText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFailed, setIsFailed] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const hasProcessedRef = useRef(false);

  // --- 1. HIỆU ỨNG VÒNG TRÒN ĐỒNG TÂM ---
  useEffect(() => {
    if (isListening || isSpeaking) {
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
  }, [isListening, isSpeaking]);

  // --- 2. SPEECH RECOGNITION EVENTS (REAL-TIME) ---
  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript || "";

    if (event.isFinal) {
      // Kết quả cuối cùng - xử lý ngay
      setInterimText("");
      if (transcript.trim()) {
        processTranscript(transcript.trim());
      } else {
        handleAIError("Cháu chưa nghe rõ ạ...");
      }
    } else {
      // Kết quả tạm thời - hiển thị real-time cho người dùng thấy
      setInterimText(transcript);
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.log("STT error:", event.error, event.message);
    setIsListening(false);

    if (event.error === "no-speech") {
      handleAIError("Cháu chưa nghe thấy gì, bác nói lại nhé?");
    } else if (event.error === "not-allowed") {
      handleAIError("Bác cần cấp quyền micro cho ứng dụng ạ.");
    } else {
      handleAIError("Cháu chưa nghe rõ, bác nói lại nhé?");
    }
  });

  // --- 3. BẮT ĐẦU / DỪNG NGHE ---
  const startListening = useCallback(async () => {
    try {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) {
        handleAIError("Bác cần cấp quyền micro cho ứng dụng ạ.");
        return;
      }

      hasProcessedRef.current = false;

      ExpoSpeechRecognitionModule.start({
        lang: "vi-VN",
        interimResults: true,
        continuous: false,
        addsPunctuation: true,
        // Tùy chọn: ưu tiên on-device nếu có thể
        requiresOnDeviceRecognition: false,
        androidIntentOptions: {
          EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 3000,
        },
      });
    } catch (err) {
      console.log("Start listening error:", err);
      handleAIError("Không thể bắt đầu nghe, bác thử lại nhé.");
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch (e) {}
  }, []);

  // --- 4. XỬ LÝ KẾT QUẢ STT ---
  const processTranscript = useCallback(
    async (rawText: string) => {
      // Tránh xử lý trùng lặp
      if (hasProcessedRef.current) return;
      hasProcessedRef.current = true;

      // Chế độ Tin nhắn: Trả về text trực tiếp
      if (mode === "text") {
        setUserText(`"${rawText}"`);
        setTimeout(() => {
          if (onSpeechText) onSpeechText(rawText);
          onClose();
        }, 1000);
        return;
      }

      // Chế độ Lệnh thoại: Gửi qua AI phân tích ý định
      setStatus("Đang suy nghĩ...");
      setIsProcessing(true);

      try {
        const result = await VoiceService.processUserRequest(rawText);

        if (result.type === "ACTION") {
          handleAIResponse(
            "ACTION",
            result.message || "Dạ vâng ạ",
            result.content,
          );
        } else if (result.type === "CHAT" && result.content !== "UNKNOWN") {
          handleAIResponse("CHAT", result.content);
        } else {
          handleAIError("Cháu không nghe rõ, bác nói lại nhé?");
        }
      } catch (e) {
        handleAIError("Có lỗi kết nối, bác thử lại giúp cháu.");
      }
    },
    [mode, onSpeechText, onClose, onAction],
  );

  // --- 5. XỬ LÝ PHẢN HỒI AI ---
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

  const resetState = () => {
    setUserText("");
    setInterimText("");
    setAiResponse("");
    setIsProcessing(false);
    setIsSpeaking(false);
    setIsFailed(false);
    setStatus("Cháu đang nghe...");
    hasProcessedRef.current = false;
  };

  // --- 6. LIFECYCLE: Mở/đóng modal ---
  useEffect(() => {
    if (visible) {
      resetState();
      // Delay nhỏ để modal hiển thị xong rồi mới bắt đầu nghe
      const timer = setTimeout(() => startListening(), 300);
      return () => clearTimeout(timer);
    } else {
      stopListening();
      Speech.stop();
    }
  }, [visible]);

  // --- 7. RENDER ---
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, isSpeaking && styles.cardSpeaking]}>
          <Text style={styles.title}>{status}</Text>

          <View style={styles.micArea}>
            <View style={styles.iconContainer}>
              {/* Vòng tròn Animation đồng tâm */}
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity: isListening || isSpeaking ? 1 : 0,
                    backgroundColor: isSpeaking
                      ? "rgba(76, 175, 80, 0.3)"
                      : "rgba(0, 136, 204, 0.3)",
                  },
                ]}
              />

              <TouchableOpacity
                style={[
                  styles.micCircle,
                  isListening
                    ? { backgroundColor: "#FF3B30" }
                    : isSpeaking
                      ? { backgroundColor: "#4CAF50" }
                      : isFailed
                        ? { backgroundColor: "#999" }
                        : null,
                ]}
                onPress={() => {
                  if (isListening) {
                    stopListening();
                  } else if (isSpeaking) {
                    Speech.stop();
                    setIsSpeaking(false);
                  } else {
                    resetState();
                    startListening();
                  }
                }}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <Ionicons
                    name={
                      isListening
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
            {/* Hiện text real-time khi đang nghe */}
            {isListening && interimText ? (
              <Text style={styles.interimText}>{interimText}...</Text>
            ) : null}

            {/* Raw text chỉ hiện ở mode tin nhắn */}
            {mode === "text" && userText ? (
              <Text style={styles.userText}>{userText}</Text>
            ) : null}

            {/* Luôn hiện câu trả lời/xác nhận sạch sẽ từ AI */}
            {aiResponse ? (
              <View style={[styles.aiBubble, isFailed && styles.aiBubbleError]}>
                <Text
                  style={[styles.aiText, isFailed && { color: "#E74C3C" }]}
                >
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
                  startListening();
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
  interimText: {
    textAlign: "center",
    color: "#0088cc",
    fontStyle: "italic",
    fontSize: 16,
    marginBottom: 8,
  },
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
