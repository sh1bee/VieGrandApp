// app/chat-detail.tsx
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FullImageModal from "../src/components/FullImageModal";
import VoiceModal from "../src/components/VoiceModal";
import { auth, db } from "../src/config/firebase";
import { ChatService } from "../src/services/ChatService";

const { width } = Dimensions.get("window");

// --- HÀM HỖ TRỢ XỬ LÝ THỜI GIAN ---
const formatTime = (timestamp: any) => {
  if (!timestamp) return "";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateHeader = (timestamp: any) => {
  if (!timestamp) return "";
  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return "Hôm nay";
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

const isSameDay = (current: any, previous: any) => {
  if (!previous || !current) return false;
  const d1 = new Date(current.seconds * 1000);
  const d2 = new Date(previous.seconds * 1000);
  return d1.toDateString() === d2.toDateString();
};

export default function ChatDetail() {
  const router = useRouter();
  const { chatId, name } = useLocalSearchParams();

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [isTypingMode, setIsTypingMode] = useState(false);

  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const currentUser = auth.currentUser;

  // 1. Lắng nghe tin nhắn Realtime từ Firebase
  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "chats", chatId as string, "messages"),
      orderBy("createdAt", "asc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      // Cuộn xuống cuối khi có tin mới
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        300,
      );
    });
    return () => unsubscribe();
  }, [chatId]);

  // Cuộn xuống cuối khi vừa mở chat
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: false }),
        500,
      );
    }
  }, [messages.length > 0]);

  // 2. Hàm gửi tin nhắn văn bản
  const handleSend = async () => {
    if (inputText.trim().length === 0) return;
    await ChatService.sendMessage(chatId as string, inputText);
    setInputText("");
    setIsTypingMode(false);
    Keyboard.dismiss();
  };

  // 3. Hàm gửi hình ảnh
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      const imageBase64 = `data:image/jpeg;base64,${result.assets[0].base64}`;
      await ChatService.sendMessage(chatId as string, "", "image", imageBase64);
    }
  };

  // 4. Hàm nhận văn bản từ giọng nói (STT)
  const handleVoiceInput = (text: string) => {
    setInputText(text); // Điền văn bản nhận được vào ô nhập
    setIsTypingMode(true); // Chuyển sang chế độ hiện nút gửi
    setVoiceVisible(false);
  };

  const onImageClick = (uri: string) => {
    setSelectedImageUri(uri);
    setModalImageVisible(true);
  };

  const renderItem = ({ item, index }: any) => {
    const isUser = item.senderId === currentUser?.uid;
    const prevMessage = messages[index - 1];
    const showDateHeader =
      !prevMessage || !isSameDay(item.createdAt, prevMessage.createdAt);

    return (
      <View>
        {/* HIỂN THỊ NGÀY THÁNG Ở GIỮA NẾU SANG NGÀY MỚI */}
        {showDateHeader && item.createdAt && (
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>
              {formatDateHeader(item.createdAt)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.messageRow,
            isUser
              ? { justifyContent: "flex-end" }
              : { justifyContent: "flex-start" },
          ]}
        >
          <View style={{ alignItems: isUser ? "flex-end" : "flex-start" }}>
            {item.type === "image" ? (
              <TouchableOpacity
                onPress={() => onImageClick(item.image)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.chatImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.otherBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    isUser ? { color: "white" } : { color: "#333" },
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            )}

            {/* THỜI GIAN NẰM NGOÀI BOX - TINH TẾ HƠN */}
            <Text style={styles.timeOutside}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#0088cc" />
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {typeof name === "string" ? name[0] : "?"}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.headerName}>{name || "Người dùng"}</Text>
          <Text style={styles.headerStatus}>Đang hoạt động</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 15 }}>
          <Ionicons name="call-outline" size={24} color="#0088cc" />
          <Ionicons name="videocam-outline" size={24} color="#0088cc" />
        </View>
      </View>

      {/* DANH SÁCH TIN NHẮN */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 15, paddingBottom: 20 }}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      />

      {/* THANH NHẬP LIỆU (FOOTER) - CÓ KHẢ NĂNG NÉ BÀN PHÍM */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.footerContainer}>
          {isTypingMode ? (
            // CHẾ ĐỘ NHẬP VĂN BẢN
            <View style={styles.inputModeRow}>
              <TouchableOpacity
                onPress={() => {
                  setIsTypingMode(false);
                  Keyboard.dismiss();
                }}
              >
                <Ionicons name="chevron-forward" size={28} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.textInputExpanded}
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChangeText={setInputText}
                autoFocus
                multiline
              />
              <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                <Ionicons name="send" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            // CHẾ ĐỘ 3 NÚT MẶC ĐỊNH (GIỐNG ẢNH MẪU 1)
            <View style={styles.defaultModeRow}>
              <TouchableOpacity
                style={styles.roundGrayBtn}
                onPress={() => setIsTypingMode(true)}
              >
                <Text
                  style={{ fontSize: 18, color: "#666", fontWeight: "bold" }}
                >
                  T
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.bigMicBtn}
                onPress={() => setVoiceVisible(true)}
              >
                <Ionicons name="mic" size={28} color="white" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.roundGrayBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* MODAL GIỌNG NÓI CHẾ ĐỘ VĂN BẢN */}
      <VoiceModal
        visible={voiceVisible}
        mode="text" // Chuyển sang mode nhập text
        onClose={() => setVoiceVisible(false)}
        onSpeechText={handleVoiceInput}
      />

      {/* MODAL XEM ẢNH FULL */}
      <FullImageModal
        visible={modalImageVisible}
        imageUri={selectedImageUri}
        onClose={() => setModalImageVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingTop: Platform.OS === "ios" ? 10 : 40,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  avatarText: { fontWeight: "bold", fontSize: 18, color: "#555" },
  headerName: { fontWeight: "bold", fontSize: 16 },
  headerStatus: { fontSize: 12, color: "#4CAF50" },

  messageRow: { flexDirection: "row", marginBottom: 12, width: "100%" },
  dateHeaderContainer: { alignItems: "center", marginVertical: 15 },
  dateHeaderText: { color: "#999", fontSize: 12, fontWeight: "500" },

  bubble: { padding: 12, borderRadius: 20, maxWidth: width * 0.75 },
  userBubble: { backgroundColor: "#0088cc", borderBottomRightRadius: 2 },
  otherBubble: { backgroundColor: "#F0F0F0", borderBottomLeftRadius: 2 },
  bubbleText: { fontSize: 16, lineHeight: 22 },

  timeOutside: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    marginHorizontal: 5,
  },

  chatImage: {
    width: width * 0.65,
    height: width * 0.85,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
  },

  footerContainer: {
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 10,
  },
  defaultModeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    width: "100%",
  },

  roundGrayBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  bigMicBtn: {
    width: 110,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#0055aa",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  inputModeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    gap: 10,
  },
  textInputExpanded: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    paddingHorizontal: 20,
    height: 45,
    fontSize: 16,
  },
  sendBtn: {
    width: 45,
    height: 45,
    backgroundColor: "#0088cc",
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
});
