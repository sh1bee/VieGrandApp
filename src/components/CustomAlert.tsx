// src/components/CustomAlert.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface Props {
  visible: boolean;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  onClose: () => void;
}

export default function CustomAlert({
  visible,
  type,
  title,
  message,
  onClose,
}: Props) {
  // Cấu hình màu sắc và icon theo loại thông báo
  const config = {
    success: { icon: "checkmark-circle", color: "#4CAF50", bg: "#E8F5E9" },
    error: { icon: "alert-circle", color: "#FF5252", bg: "#FFEBEE" },
    warning: { icon: "warning", color: "#FFA000", bg: "#FFF8E1" },
  };

  const current = config[type];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          {/* Icon Header */}
          <View style={[styles.iconCircle, { backgroundColor: current.bg }]}>
            <Ionicons
              name={current.icon as any}
              size={40}
              color={current.color}
            />
          </View>

          {/* Nội dung */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Nút bấm */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: current.color }]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Đồng ý</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  alertBox: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
