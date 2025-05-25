import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";

export default function ForgotPasswordApp() {
  const navigation = useNavigation();
  const route = useRoute();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [token, setToken] = useState("");

  const API_BASE_URL = `https://bechatcnm-production.up.railway.app`;

  useEffect(() => {
    // Lấy token từ route.params (được truyền qua deep linking)
    const resetToken = route.params?.token;
    if (resetToken) {
      setToken(resetToken);
    } else {
      setModalMessage("Không tìm thấy token. Vui lòng thử lại.");
      setModalVisible(true);
    }
  }, [route.params]);

  const toggleNewPasswordVisibility = () => {
    setIsNewPasswordVisible(!isNewPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleReset = async () => {
    if (password !== confirmPassword) {
      setModalMessage("Mật khẩu và mật khẩu xác nhận không khớp!");
      setModalVisible(true);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1/auth/reset-password/${token}`,
        {
          newPassword: password,
          confirmPassword,
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

      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.inputPassword,
            { borderColor: isPasswordFocused ? "#007AFF" : "#E8E8E8" },
          ]}
          placeholder="New password"
          secureTextEntry={!isNewPasswordVisible}
          placeholderTextColor="#A9A9A9"
          value={password}
          onChangeText={setPassword}
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
        />
        <TouchableOpacity
          onPress={toggleNewPasswordVisibility}
          style={styles.showPasswordIcon}
        >
          <MaterialIcons
            name={isNewPasswordVisible ? "visibility-off" : "visibility"}
            size={24}
            color="#ACB5BB"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={[
            styles.inputPassword,
            { borderColor: isConfirmPasswordFocused ? "#007AFF" : "#E8E8E8" },
          ]}
          placeholder="Confirm password"
          secureTextEntry={!isConfirmPasswordVisible}
          placeholderTextColor="#A9A9A9"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          onFocus={() => setIsConfirmPasswordFocused(true)}
          onBlur={() => setIsConfirmPasswordFocused(false)}
        />
        <TouchableOpacity
          onPress={toggleConfirmPasswordVisibility}
          style={styles.showPasswordIcon}
        >
          <MaterialIcons
            name={isConfirmPasswordVisible ? "visibility-off" : "visibility"}
            size={24}
            color="#ACB5BB"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.buttonText}>Submit</Text>
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
                  navigation.navigate("Login");
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  inputPassword: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  showPasswordIcon: {
    position: "absolute",
    right: 10,
    padding: 10,
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
