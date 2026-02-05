// app/notifications.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { auth, db } from "../src/config/firebase";
import { NotificationService } from "../src/services/NotificationService";

export default function NotificationScreen() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifs(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePress = (item: any) => {
    if (!item.isRead && user) {
      NotificationService.markAsRead(user.uid, item.id);
    }
    if (item.type === "chat") router.push("/(tabs)/chat");
    if (item.type === "reminder") router.push("/reminders");
  };

  const renderItem = ({ item }: any) => {
    const date = item.createdAt
      ? new Date(item.createdAt.seconds * 1000)
      : new Date();
    return (
      <TouchableOpacity
        style={[styles.item, !item.isRead && styles.unreadItem]}
        onPress={() => handlePress(item)}
      >
        <View
          style={[
            styles.iconBox,
            { backgroundColor: item.type === "chat" ? "#E3F2FD" : "#FFF3E0" },
          ]}
        >
          <Ionicons
            name={item.type === "chat" ? "chatbubble" : "alarm"}
            size={24}
            color={item.type === "chat" ? "#0088cc" : "#EF6C00"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, !item.isRead && { fontWeight: "bold" }]}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
          <Text style={styles.time}>{date.toLocaleString("vi-VN")}</Text>
        </View>
        {!item.isRead && <View style={styles.dot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#0088cc"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#999", marginTop: 50 }}>
              Không có thông báo nào
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    paddingTop: 40,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  item: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    alignItems: "center",
  },
  unreadItem: { backgroundColor: "#F0F9FF" },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  title: { fontSize: 16, color: "#333", marginBottom: 4 },
  body: { fontSize: 14, color: "#666" },
  time: { fontSize: 11, color: "#999", marginTop: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#0088cc" },
});
