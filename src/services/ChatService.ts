// src/services/ChatService.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { NotificationService } from "./NotificationService";

export const ChatService = {
  // 1. Tạo hoặc lấy phòng chat
  getOrCreateChatRoom: async (otherUserId: string, otherUserName: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    try {
      const myDoc = await getDoc(doc(db, "users", currentUser.uid));
      const myName = myDoc.exists() ? myDoc.data().name : "Người dùng";

      const chatId = [currentUser.uid, otherUserId].sort().join("_");
      const chatRef = doc(db, "chats", chatId);

      await setDoc(
        chatRef,
        {
          participants: [currentUser.uid, otherUserId],
          participantData: {
            [currentUser.uid]: { name: myName },
            [otherUserId]: { name: otherUserName },
          },
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return chatId;
    } catch (e) {
      console.error("Lỗi getOrCreateChatRoom:", e);
      return null;
    }
  },

  // 2. Gửi tin nhắn & Gửi thông báo
  sendMessage: async (
    chatId: string,
    text: string,
    type: "text" | "image" = "text",
    imageUrl: string = "",
  ) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // 1. Lấy tên của chính mình từ database để làm tiêu đề thông báo
      const myDoc = await getDoc(doc(db, "users", currentUser.uid));
      const senderName = myDoc.exists() ? myDoc.data().name : "Người thân";

      // 2. Lưu tin nhắn vào Firestore
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text,
        image: imageUrl,
        type,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // 3. Cập nhật lastMessage cho phòng chat
      const lastMsgContent = type === "image" ? "📷 Đã gửi một ảnh" : text;
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: { text: lastMsgContent, createdAt: serverTimestamp() },
      });

      // 4. Tìm người nhận
      const receiverId = chatId.replace(currentUser.uid, "").replace("_", "");
      if (receiverId) {
        // GỬI THÔNG BÁO: Tiêu đề là Tên người gửi, Nội dung là tin nhắn
        await NotificationService.sendInAppNotification(
          receiverId,
          senderName, // <--- Thay "Tin nhắn mới" bằng Tên thật
          lastMsgContent,
          "chat",
        );
      }
    } catch (e) {
      console.error(e);
    }
  },

  // 3. Xóa sạch lịch sử
  clearChatHistory: async (chatId: string) => {
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      const q = query(messagesRef);
      const snapshot = await getDocs(q);

      if (snapshot.empty) return true;

      const batch = writeBatch(db);
      snapshot.docs.forEach((msgDoc) => {
        batch.delete(msgDoc.ref);
      });
      await batch.commit();

      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: {
          text: "Lịch sử trò chuyện đã được xóa",
          createdAt: serverTimestamp(),
        },
      });

      return true;
    } catch (e) {
      console.error("Lỗi xóa lịch sử:", e);
      return false;
    }
  },

  // 4. Xóa phòng chat
  deleteChatRoom: async (chatId: string) => {
    try {
      await deleteDoc(doc(db, "chats", chatId));
    } catch (e) {
      console.error("Lỗi xóa phòng chat:", e);
    }
  },
};
