// src/components/FamilyConnectModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Clipboard from "expo-clipboard";
import {
    arrayUnion,
    collection,
    doc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { auth, db } from "../config/firebase";

const { width } = Dimensions.get("window");

interface FamilyConnectModalProps {
  visible: boolean;
  onClose: () => void;
  myPrivateKey: string;
  isLoading: boolean; // Prop mới để nhận trạng thái đang tải từ trang chủ
}

export default function FamilyConnectModal({
  visible,
  onClose,
  myPrivateKey,
  isLoading,
}: FamilyConnectModalProps) {
  const [mode, setMode] = useState<"view" | "scan">("view");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);

  // 1. Hàm sao chép Private Key
  const copyToClipboard = async () => {
    if (myPrivateKey && !myPrivateKey.startsWith("ERR")) {
      await Clipboard.setStringAsync(myPrivateKey);
      Alert.alert("Thành công", "Đã sao chép Private Key vào bộ nhớ tạm.");
    } else {
      Alert.alert("Lỗi", "Không có mã để sao chép.");
    }
  };

  // 2. Hàm xử lý khi quét trúng mã của người khác
  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanning) return;
    setScanning(true);

    try {
      // Tìm user có Private Key trùng với nội dung mã QR vừa quét
      const q = query(collection(db, "users"), where("privateKey", "==", data));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Lỗi", "Mã QR không hợp lệ hoặc người dùng không tồn tại.");
        setScanning(false);
        return;
      }

      const otherUser = querySnapshot.docs[0].data();
      const currentUser = auth.currentUser;

      if (otherUser.uid === currentUser?.uid) {
        Alert.alert("Lỗi", "Bạn đang quét mã của chính mình!");
        setScanning(false);
        return;
      }

      // Tiến hành kết nối 2 tài khoản vào mảng familyMembers
      const myRef = doc(db, "users", currentUser!.uid);
      const otherRef = doc(db, "users", otherUser.uid);

      await updateDoc(myRef, { familyMembers: arrayUnion(otherUser.uid) });
      await updateDoc(otherRef, {
        familyMembers: arrayUnion(currentUser!.uid),
      });

      Alert.alert("Thành công", `Đã kết nối với ${otherUser.name}!`);
      onClose();
    } catch (e) {
      Alert.alert("Lỗi", "Kết nối thất bại. Vui lòng thử lại.");
    } finally {
      setScanning(false);
    }
  };

  const startScan = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Lỗi", "Bạn cần cấp quyền Camera để quét mã.");
        return;
      }
    }
    setMode("scan");
  };

  const handleClose = () => {
    setMode("view"); // Reset về trang xem mã khi đóng
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === "view" ? "Private Key" : "Quét mã QR"}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          {mode === "view" ? (
            // --- GIAO DIỆN HIỆN MÃ QR ---
            <View style={{ alignItems: "center" }}>
              <View style={styles.qrWrapper}>
                {isLoading ? (
                  // Trạng thái đang tải từ Firestore
                  <View style={styles.noKeyBox}>
                    <ActivityIndicator size="large" color="#007AFF" />
                    <Text style={{ color: "#999", marginTop: 10 }}>
                      Đang tạo mã...
                    </Text>
                  </View>
                ) : myPrivateKey && !myPrivateKey.startsWith("ERR") ? (
                  // Hiện mã QR thật
                  <QRCode
                    value={myPrivateKey}
                    size={width * 0.45}
                    color="#0055aa"
                    backgroundColor="white"
                  />
                ) : (
                  // Lỗi không lấy được Key
                  <View style={styles.noKeyBox}>
                    <Ionicons name="alert-circle" size={60} color="#FF9800" />
                    <Text
                      style={{
                        color: "#999",
                        textAlign: "center",
                        marginTop: 10,
                      }}
                    >
                      {myPrivateKey === "ERR_NETWORK"
                        ? "Lỗi kết nối mạng"
                        : "Không tìm thấy mã"}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.qrDesc}>
                Mã này dùng để kết nối người thân
              </Text>

              <View style={styles.keyDisplayBox}>
                <Text style={styles.keyLabel}>Mã của bạn:</Text>
                <Text style={styles.keyValue} numberOfLines={1}>
                  {isLoading ? "Đang tải..." : myPrivateKey || "..."}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.mainScanBtn}
                  onPress={startScan}
                >
                  <Ionicons name="qr-code-outline" size={20} color="white" />
                  <Text style={styles.btnTextWhite}>Quét mã</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryCopyBtn}
                  onPress={copyToClipboard}
                >
                  <Ionicons name="copy-outline" size={20} color="#007AFF" />
                  <Text style={styles.btnTextBlue}>Sao chép</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // --- GIAO DIỆN CAMERA QUÉT MÃ ---
            <View style={styles.cameraWrapper}>
              <CameraView
                style={StyleSheet.absoluteFill}
                onBarcodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              />
              <View style={styles.cameraOverlay}>
                <View style={styles.scanTarget} />
                <TouchableOpacity
                  style={styles.cancelScanBtn}
                  onPress={() => setMode("view")}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Quay lại mã của tôi
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.warningFooter}>
            <Ionicons name="shield-checkmark" size={18} color="#E67E22" />
            <Text style={styles.warningText}>
              Giữ Private Key an toàn! Đây là chìa khóa để khôi phục hoặc kết
              nối tài khoản.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 25,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  closeBtn: { padding: 5, backgroundColor: "#F5F5F5", borderRadius: 20 },

  qrWrapper: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 25,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    minHeight: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  noKeyBox: {
    alignItems: "center",
  },
  qrDesc: { color: "#8E8E93", fontSize: 14, marginVertical: 15 },

  keyDisplayBox: {
    width: "100%",
    backgroundColor: "#F8F9FF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EBF0FF",
  },
  keyLabel: { fontSize: 12, color: "#666", fontWeight: "bold" },
  keyValue: { fontSize: 16, color: "#0055aa", fontWeight: "500", marginTop: 4 },

  actionRow: { flexDirection: "row", gap: 12, width: "100%", marginBottom: 15 },
  mainScanBtn: {
    flex: 1.2,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    padding: 16,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 3,
  },
  secondaryCopyBtn: {
    flex: 1,
    backgroundColor: "#EBF5FB",
    flexDirection: "row",
    padding: 16,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#AED6F1",
  },
  btnTextWhite: { color: "white", fontWeight: "bold", fontSize: 16 },
  btnTextBlue: { color: "#007AFF", fontWeight: "bold", fontSize: 16 },

  warningFooter: {
    backgroundColor: "#FFF4E5",
    padding: 15,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  warningText: { flex: 1, color: "#E67E22", fontSize: 12, lineHeight: 18 },

  cameraWrapper: {
    width: "100%",
    height: 350,
    borderRadius: 25,
    overflow: "hidden",
    backgroundColor: "black",
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  scanTarget: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  cancelScanBtn: {
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.4)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
