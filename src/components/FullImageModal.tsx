// src/components/FullImageModal.tsx
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import React from "react";
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

const { width, height } = Dimensions.get("window");

interface Props {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
}

export default function FullImageModal({ visible, imageUri, onClose }: Props) {
  if (!imageUri) return null;

  const handleDownload = async () => {
    try {
      // 1. Xin quyền truy cập thư viện ảnh
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Cần cấp quyền để lưu ảnh.");
        return;
      }

      // 2. Tải ảnh về file tạm
      const fileUri = FileSystem.documentDirectory + "viegrand_temp.jpg";
      const { uri } = await FileSystem.downloadAsync(imageUri, fileUri);

      // 3. Lưu vào thư viện
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync("VieGrand", asset, false);

      Alert.alert("Thành công", "Đã lưu ảnh vào thư viện!");
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải ảnh.");
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        {/* Nút Đóng */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>

        {/* Nút Tải xuống */}
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Ionicons name="download-outline" size={26} color="white" />
        </TouchableOpacity>

        {/* Ảnh Full Màn Hình */}
        <Image
          source={{ uri: imageUri }}
          style={styles.fullImage}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: width,
    height: height,
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
  },
  downloadBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 25,
  },
});
