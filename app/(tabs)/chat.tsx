// app/(tabs)/chat.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore"; // Thêm doc, getDoc
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../src/config/firebase";
import { ChatService } from "../../src/services/ChatService";

export default function ChatScreen() {
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = auth.currentUser;

  // --- LOGIC 1: NHẤN GIỮ ĐỂ XÓA (GỌI SERVICE THẬT) ---
  const handleLongPressChat = (item: any) => {
    Alert.alert(
      "Quản lý trò chuyện",
      `Bạn có chắc chắn muốn xóa toàn bộ nội dung tin nhắn với ${item.otherUser.name}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa lịch sử",
          style: "destructive",
          onPress: async () => {
            try {
              const success = await ChatService.clearChatHistory(item.id);
              if (!success) {
                Alert.alert("Lỗi", "Không thể xóa lịch sử lúc này.");
              }
            } catch (e) {
              console.error(e);
            }
          },
        },
      ],
    );
  };

  // --- LOGIC MỚI: TỰ ĐỘNG TẠO PHÒNG CHAT CHO NGƯỜI THÂN ---
  // Hàm này sẽ quét danh sách gia đình và tạo phòng chat cho ai chưa có
  useEffect(() => {
    const syncFamilyChats = async () => {
      if (!currentUser) return;

      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists()) {
          const familyMembers = userSnap.data().familyMembers || [];

          // Duyệt qua từng người thân trong mảng
          for (const memberId of familyMembers) {
            const memberSnap = await getDoc(doc(db, "users", memberId));
            if (memberSnap.exists()) {
              const memberName = memberSnap.data().name || "Người thân";
              // Hàm này sẽ tự tạo phòng chat nếu chưa có, nếu có rồi thì nó bỏ qua (cập nhật tên)
              await ChatService.getOrCreateChatRoom(memberId, memberName);
            }
          }
        }
      } catch (error) {
        console.log("Lỗi đồng bộ danh sách chat:", error);
      }
    };

    syncFamilyChats();
  }, [currentUser]);

  // --- LOGIC 2: LẮNG NGHE DANH SÁCH CHAT THẬT ---
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", currentUser.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => {
          const data = doc.data();
          const otherUserId = data.participants.find(
            (id: string) => id !== currentUser.uid,
          );
          const otherUserInfo = data.participantData?.[otherUserId] || {
            name: "Người dùng",
          };

          return {
            id: doc.id,
            ...data,
            otherUser: otherUserInfo,
            initials: otherUserInfo.name
              ? otherUserInfo.name.charAt(0).toUpperCase()
              : "?",
            lastMsgText: data.lastMessage?.text || "Bắt đầu trò chuyện...",
          };
        });

        // Sắp xếp: Hội thoại có tin nhắn mới nhất lên đầu
        list.sort((a: any, b: any) => {
          const timeA = a.lastMessage?.createdAt?.seconds || 0;
          const timeB = b.lastMessage?.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setChats(list);
        setLoading(false);
      },
      (error) => {
        console.log("Lỗi tải danh sách chat:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [currentUser]);

  const renderChatItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.chatCard}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/chat-detail",
          params: { chatId: item.id, name: item.otherUser.name },
        })
      }
      onLongPress={() => handleLongPressChat(item)}
      delayLongPress={600}
    >
      <View style={[styles.avatar, { backgroundColor: "#0088cc" }]}>
        <Text style={styles.avatarText}>{item.initials}</Text>
        <View style={styles.onlineDot} />
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.otherUser.name}
          </Text>
          <Text style={styles.dateText}>
            {item.lastMessage?.createdAt
              ? new Date(
                  item.lastMessage.createdAt.seconds * 1000,
                ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : ""}
          </Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.lastMessage?.text || "Bắt đầu trò chuyện..."}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#DDD" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#0088cc" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tin Nhắn</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator size="large" color="#0088cc" />
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubbles-outline" size={80} color="#EEE" />
                <Text style={styles.emptyText}>
                  Chưa có cuộc hội thoại nào.
                </Text>
                <Text style={styles.emptySubText}>
                  Hãy kết nối với người thân bằng mã QR để bắt đầu trò chuyện.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "white" },
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F7",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#1A1A1A" },
  listContent: { paddingBottom: 120, paddingTop: 10 },
  loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },

  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F8F8FA",
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarText: { color: "white", fontSize: 22, fontWeight: "bold" },
  onlineDot: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  chatInfo: { flex: 1, marginLeft: 15 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  userName: { fontSize: 17, fontWeight: "bold", color: "#1A1A1A" },
  dateText: { fontSize: 12, color: "#999" },
  lastMsg: { fontSize: 14, color: "#666" },

  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 18, fontWeight: "bold", color: "#CCC", marginTop: 20 },
  emptySubText: {
    fontSize: 14,
    color: "#DDD",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },
});
