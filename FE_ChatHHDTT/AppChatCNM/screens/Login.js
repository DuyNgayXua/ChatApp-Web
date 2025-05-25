import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loading from "../loading";

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRememberMe, setIsRememberMe] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleRememberMe = () => {
    setIsRememberMe(!isRememberMe);
  };

  const handleSignUpNavigation = () => {
    navigation.navigate("SignUp");
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        "https://bechatcnm-production.up.railway.app/v1/auth/login",
        {
          email,
          password,
        }
      );

      if (response.data.accessToken) {
        if (response.data.isVerified) {
          await AsyncStorage.setItem("user", JSON.stringify(response.data));
          setModalMessage(" Đăng nhập thành công ✅");
          setModalVisible(true);
          setIsLoading(false);
          setTimeout(() => navigation.navigate("ChatListScreen"), 1000);
        } else {
          setModalMessage(" Tài Khoản Chưa Được Xác Minh ❌");
          setModalVisible(true);
        }
      } else {
        setIsLoading(false);
        setModalMessage("Đăng nhập thất bại. Vui lòng thử lại. ❌");
        setModalVisible(true);
      }
    } catch (error) {
      if (error.message.includes("Network Error")) {
        setModalMessage(
          "Lỗi kết nối đến server. Kiểm tra CORS hoặc API đang chạy."
        );
      } else {
        setModalMessage(
          error.response?.data?.message || "Đăng nhập thất bại. ❌"
        );
      }
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#9AB9F5", "#FFFFFF"]}
        locations={[0, 0.25]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Image
            source={require("../assets/Data/char1.png")}
            style={styles.logo}
          />

          <TextInput
            style={[
              styles.input,
              { borderColor: isEmailFocused ? "#007AFF" : "#E8E8E8" },
            ]}
            placeholder="Enter email"
            keyboardType="default"
            autoCapitalize="none"
            placeholderTextColor="#A9A9A9"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.inputPassword,
                { borderColor: isPasswordFocused ? "#007AFF" : "#E8E8E8" },
              ]}
              placeholder="Password"
              secureTextEntry={!isPasswordVisible}
              placeholderTextColor="#A9A9A9"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.showPasswordIcon}
            >
              <MaterialIcons
                name={isPasswordVisible ? "visibility-off" : "visibility"}
                size={24}
                color="#ACB5BB"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.rememberForgotContainer}>
            <TouchableOpacity
              onPress={toggleRememberMe}
              style={styles.checkboxContainer}
            >
              <View
                style={[
                  styles.checkbox,
                  isRememberMe && styles.checkboxChecked,
                ]}
              >
                {isRememberMe && (
                  <MaterialIcons
                    name="check"
                    size={10}
                    color="#FFFFFF"
                    style={styles.checkIcon}
                  />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate("RecoverPasswordApp")}
            >
              <Text style={styles.linkText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <Loading loadingState={isLoading} />
        </ScrollView>

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
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.footerTextNormal}>Don't have an account? </Text>
            <Text
              style={styles.footerTextLink}
              onPress={handleSignUpNavigation}
            >
              Sign Up
            </Text>
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 100, // Đảm bảo đủ không gian để cuộn khi bàn phím mở
  },
  logo: {
    width: 350,
    height: 233,
    alignSelf: "center",
    resizeMode: "contain",
    marginBottom: 16,
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
  rememberForgotContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#B4B4B4",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#494948",
  },
  checkIcon: {
    marginTop: 2,
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#333333",
  },
  forgotPassword: {
    alignItems: "flex-end",
  },
  loginButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "transparent",
  },
  footerText: {
    fontSize: 12,
  },
  footerTextNormal: {
    color: "#6C7278",
  },
  footerTextLink: {
    color: "#007AFF",
  },
});
