import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
// import * as ImagePicker from 'expo-image-picker';
// import { Picker } from '@react-native-picker/picker';
import Loading from "../loading";

export default function SignUp() {
  const navigation = useNavigation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalVisible, setModalVisible] = useState(false);
  // const [imageUri, setImageUri] = useState(null);
  // const [imageFile, setImageFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleRegister = async () => {
    setErrorMessage("");
    setIsLoading(true);

    // Kiểm tra các trường bắt buộc
    if (!phone || !password || !email) {
      setErrorMessage("Vui lòng nhập đầy đủ thông tin.");
      setModalVisible(true);
      return;
    }

    // Kiểm tra định dạng phone (chỉ chứa số)
    if (!/^\d+$/.test(phone)) {
      setErrorMessage("Số điện thoại chỉ được chứa chữ số.");
      setModalVisible(true);
      return;
    }

    // Kiểm tra độ dài phone (10-11 số)
    if (phone.length < 10 || phone.length > 11) {
      setErrorMessage("Số điện thoại phải từ 10 đến 11 số.");
      setModalVisible(true);
      return;
    }

    // Kiểm tra định dạng email
    if (!validateEmailFormat(email)) {
      setErrorMessage("Email sai định dạng.");
      setModalVisible(true);
      return;
    }

    // Tạo object dữ liệu để gửi lên server
    const userData = {
      phone,
      email,
      password,
    };

    // Thay localhost thanh ip cua may khi chay tren mobile
    try {
      const response = await axios.post(
        "https://bechatcnm-production.up.railway.app/v1/auth/register",
        userData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setErrorMessage(
          "✅ Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản."
        );
        setModalVisible(true);
        setIsLoading(false);
        // Sau khi đăng ký thành công, có thể điều hướng về trang đăng nhập sau khi đóng modal
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000); // Chuyển hướng sau 2 giây
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage(
            error.response.data.message ||
              "Email hoặc số điện thoại đã tồn tại."
          );
        } else if (error.response.status === 500) {
          setErrorMessage("Gửi email xác minh thất bại. Vui lòng thử lại.");
        } else {
          setErrorMessage("Đăng ký thất bại. Vui lòng thử lại.");
        }
      } else {
        setErrorMessage("Không thể kết nối đến server. Vui lòng kiểm tra lại.");
      }
      setModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm kiểm tra định dạng email
  const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <LinearGradient
      colors={["#9AB9F5", "#FFFFFF"]}
      locations={[0, 0.25]}
      start={{ x: 0, y: 1 }}
      end={{ x: 0.5, y: 0 }}
      style={styles.container}
    >
      <Text style={styles.title}>Register</Text>
      <Text style={styles.subtitle}>Create an account to continue!</Text>

      <TextInput
        style={[
          styles.input,
          { borderColor: isPhoneFocused ? "#007AFF" : "#E8E8E8" },
        ]}
        placeholder="Phone"
        keyboardType="default"
        autoCapitalize="none"
        placeholderTextColor="#A9A9A9"
        onFocus={() => setIsPhoneFocused(true)}
        onBlur={() => setIsPhoneFocused(false)}
        value={phone}
        onChangeText={setPhone}
      />

      {/* Email Input */}
      <TextInput
        style={[
          styles.input,
          { borderColor: isEmailFocused ? "#007AFF" : "#E8E8E8" },
        ]}
        placeholder="Email"
        keyboardType="default"
        autoCapitalize="none"
        placeholderTextColor="#A9A9A9"
        onFocus={() => setIsEmailFocused(true)}
        onBlur={() => setIsEmailFocused(false)}
        value={email}
        onChangeText={setEmail}
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
          onFocus={() => setIsPasswordFocused(true)}
          onBlur={() => setIsPasswordFocused(false)}
          value={password}
          onChangeText={setPassword}
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

      {/* Button to select an image */}
      {/* <TouchableOpacity style={styles.imagePickerButton}>
                <Text style={styles.imagePickerText}>Upload Image</Text>
            </TouchableOpacity>
            {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
            )} */}

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text
            style={styles.footerTextLink}
            onPress={() => navigation.navigate("Login")}
          >
            Log in
          </Text>
        </Text>
      </View>

      <Loading loadingState={isLoading}></Loading>

      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {errorMessage || "Đăng ký thành công"}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
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
  title: {
    fontSize: 34,
    color: "#333333",
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
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
  //   imagePickerButton: {
  //     height: 50,
  //     borderRadius: 10,
  //     backgroundColor: "#007AFF",
  //     justifyContent: "center",
  //     alignItems: "center",
  //     marginBottom: 20,
  //   },
  //   imagePickerText: {
  //     color: 'white',
  //     fontWeight: 'bold',
  //   },
  //   previewImage: {
  //     width: 100,
  //     height: 100,
  //     borderRadius: 10,
  //     marginBottom: 20,
  //   },
  registerButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
  },
  footerText: {
    fontSize: 12,
  },
  footerTextLink: {
    color: "#007AFF",
  },
  modalContainer: {
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
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
});
