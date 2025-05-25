import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import axios from "axios"; // Thêm axios để gửi request

export default function RecoverPasswordApp() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const API_BASE_URL = `https://bechatcnm-production.up.railway.app`;

  const handleReset = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1/auth/forgot-password`,
        {
          email,
        }
      );
      setModalMessage(response.data.message);
      setModalVisible(true);
    } catch (error) {
      setModalMessage(error.response?.data?.message || "Đã có lỗi xảy ra!");
      setModalVisible(true);
    }
  };

  return (
    <LinearGradient
      colors={["#9AB9F5", "#FFFFFF"]}
      locations={[0, 0.25]}
      start={{ x: 0, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <MaterialIcons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={[
          styles.input,
          { borderColor: isEmailFocused ? "#007AFF" : "#E8E8E8" },
        ]}
        placeholder="Enter email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#A9A9A9"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setIsEmailFocused(true)}
        onBlur={() => setIsEmailFocused(false)}
      />

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.buttonText}>Send Email Reset</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                if (modalMessage.includes("thành công")) {
                  navigation.navigate("ForgotPasswordApp"); // Chuyển tới màn hình đặt lại mật khẩu
                }
              }}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Styles giữ nguyên như bạn đã cung cấp

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#F8F8F8",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  title: {
    fontSize: 34,
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  resetButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalMessage: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
