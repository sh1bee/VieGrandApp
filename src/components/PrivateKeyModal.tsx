// src/components/PrivateKeyModal.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../constants/Colors";

interface Props {
  visible: boolean;
  privateKey: string;
  onClose: () => void;
  onContinue: () => void;
}

export default function PrivateKeyModal({
  visible,
  privateKey,
  onClose,
  onContinue,
}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header Modal */}
          <View style={styles.header}>
            <Ionicons
              name="shield-checkmark-outline"
              size={30}
              color={Colors.light.primary}
            />
            <Text style={styles.title}>Xác nhận Private Key</Text>
          </View>

          <Text style={styles.subtitle}>
            🔑 Private Key của bạn đã được sao chép vào clipboard
          </Text>

          {/* Ô hiển thị Key */}
          <View style={styles.keyBox}>
            <Text style={styles.keyLabel}>Private Key:</Text>
            <Text style={styles.keyValue}>{privateKey}</Text>
          </View>

          {/* Cảnh báo màu vàng */}
          <View style={styles.warningBox}>
            <Ionicons
              name="warning-outline"
              size={20}
              color="#E67E22"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.warningText}>
              Quan trọng: Bạn sẽ cần mã này để khôi phục tài khoản nếu quên mật
              khẩu. Hãy lưu trữ ở nơi an toàn!
            </Text>
          </View>

          {/* Hai nút dưới cùng */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.confirmBtn} onPress={onContinue}>
              <Text style={styles.confirmText}>Tiếp tục đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Màn hình đen mờ
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "100%",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.textGray,
    textAlign: "center",
    marginBottom: 20,
  },
  keyBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  keyLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  keyValue: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  warningBox: {
    backgroundColor: "#FFF3E0", // Màu nền cam nhạt
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-start", // Để icon nằm trên cùng nếu text dài
  },
  warningText: {
    color: "#D35400", // Màu chữ cam đậm
    fontSize: 13,
    flex: 1, // Để text tự xuống dòng
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontWeight: "bold",
  },
  confirmBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
  },
  confirmText: {
    color: "white",
    fontWeight: "bold",
  },
});
