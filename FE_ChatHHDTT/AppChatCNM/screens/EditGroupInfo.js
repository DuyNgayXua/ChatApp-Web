import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Loading from "../loading";

export default function ModalEditGroupInfo({ group, visible, onClose }) {
  const [groupName, setGroupName] = useState(group?.name || "");
  const [groupAvatar, setGroupAvatar] = useState(group?.groupAvatar || null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (group) {
      setGroupName(group.name || "");
      setGroupAvatar(group.groupAvatar || null);
      setNewAvatar(null);
    }
  }, [group]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewAvatar(result.assets[0].uri);
    }
  };

  const handleEditGroup = async () => {
    const isNameChanged = groupName.trim() !== group?.name?.trim();
    const isImageChanged = !!newAvatar;

    if (!isNameChanged && !isImageChanged) {
      Alert.alert("Thông báo", "Vui lòng nhập tên nhóm mới hoặc chọn ảnh mới.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", groupName);
      if (newAvatar) {
        const fileName = newAvatar.split("/").pop();
        const fileType = fileName.split(".").pop();

        formData.append("groupAvatar", {
          uri: newAvatar,
          name: fileName,
          type: `image/${fileType}`,
        });
      }

      await axios.put(
        `https://bechatcnm-production.up.railway.app/conversations/group/${group._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert("Thành công", "Thông tin nhóm đã được cập nhật.");
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        navigation.navigate("ChatListScreen");
      }, 500);
    } catch (err) {
      console.log("Lỗi cập nhật nhóm:", err);
      setIsLoading(false);
      Alert.alert("Lỗi", "Không thể cập nhật nhóm.");
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.text}>Chỉnh sửa thông tin nhóm</Text>
          <TouchableOpacity onPress={pickImage} style={styles.avatarSection}>
            <Image
              source={{ uri: newAvatar || groupAvatar }}
              style={styles.avatarPreview}
            />
            <Text style={styles.pickImageText}>Chọn ảnh mới</Text>
          </TouchableOpacity>
          <Text style={styles.currentName}>
            Tên nhóm hiện tại: {group?.name || "Không có"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên nhóm mới..."
            value={groupName}
            onChangeText={setGroupName}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.btnText}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEditGroup} style={styles.saveBtn}>
              <Text style={styles.btnText}>Lưu</Text>
            </TouchableOpacity>
          </View>
          <Loading loadingState={isLoading}></Loading>
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
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: 360,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    position: "relative",
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ccc",
    backgroundColor: "#eee",
  },
  pickImageText: {
    textAlign: "center",
    color: "#555",
    marginTop: 5,
    fontSize: 14,
  },
  currentName: {
    marginBottom: 8,
    fontSize: 16,
    color: "#444",
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    borderRadius: 20,
  },
});
