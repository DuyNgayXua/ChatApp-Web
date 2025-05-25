import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
} from "react-native";
import { getListFriend, createConversation } from "../services/apiServices";
import * as ImagePicker from "expo-image-picker";
import Entypo from "@expo/vector-icons/Entypo";
import { CheckBox } from "react-native-elements";
import axios from "axios";
import io from "socket.io-client";
import { useNavigation } from "@react-navigation/native";
import Loading from "../loading";

const ModalAddUserToGroup = ({
  visible,
  onClose,
  idUser,
  children, // children: nếu typeAction là 'update' thì đây là conversationId
  typeAction, // 'create' hoặc 'update'
  existingMembers = [],
  idUserSelect = "",
  idGroup = "",
}) => {
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [nameGroup, setNameGroup] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyInGroup, setAlreadyInGroup] = useState(new Set());
  const [friendNotToGroup, setFriendNotToGroup] = useState([]);
  const [loadingState, setLoadingState] = useState(false);

  const socket = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    socket.current = io("https://bechatcnm-production.up.railway.app", {
      transports: ["websocket"],
    });

    return () => {
      if (socket.current) socket.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      fetchFriends();
      setAlreadyInGroup(new Set(existingMembers)); // existingMembers là danh sách thành viên hiện tại
    }
  }, [visible]);

  useEffect(() => {
    console.log("Cac User Trong Group ", alreadyInGroup);

    const groupMembersIds = Array.from(alreadyInGroup).map(
      (member) => member._id
    );

    const friendsNotInGroup = friends.filter(
      (friend) => !groupMembersIds.includes(friend._id)
    );

    setFriendNotToGroup(friendsNotInGroup);
  }, [friends, alreadyInGroup]); // Re-run when friends or alreadyInGroup changes

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const friendsList = await getListFriend(idUser);
      setFriends(friendsList);
    } catch (err) {
      console.error("Lỗi lấy danh sách bạn:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (friends.length > 0 && idUserSelect) {
      const found = friends.find((friend) => friend._id === idUserSelect);
      if (found) {
        setSelectedFriends((prev) => {
          if (!prev.includes(idUserSelect)) {
            return [...prev, idUserSelect];
          }
          return prev;
        });
      }
    }
  }, [friends, idUserSelect]);

  const toggleFriendSelection = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const searchFriendByPhone = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert("Vui lòng nhập số điện thoại.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(
        `https://bechatcnm-production.up.railway.app/friends/search?phone=${phoneNumber}`
      );

      const foundFriend = res.data;
      if (foundFriend) {
        setFriends((prev) => {
          // Kiểm tra nếu đã có thì không thêm lại
          const exists = prev.some((f) => f._id === foundFriend._id);
          if (exists) return prev;
          return [...prev, foundFriend];
        });
      }
    } catch (err) {
      console.error("Không tìm thấy bạn:", err.response?.data || err.message);
      Alert.alert("Không tìm thấy bạn với số điện thoại này.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType, // Use 'All' or 'Images' directly
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleCreateGroupChat = async () => {
    setLoadingState(true);
    if (!nameGroup.trim()) {
      Alert.alert("Vui lòng nhập tên nhóm.");
      setLoadingState(false); // <--- Thêm dòng này
      return;
    }
    if (selectedFriends.length < 2) {
      Alert.alert("Cần ít nhất 3 thành viên (bao gồm bạn).");
      setLoadingState(false); // <--- Thêm dòng này
      return;
    }

    const fullMembers = [...new Set([...selectedFriends, idUser])];

    try {
      const formData = new FormData();
      formData.append("name", nameGroup);
      formData.append("isGroup", "true");
      formData.append("groupLeaderId", idUser);
      formData.append("members", JSON.stringify(fullMembers));

      // Kiểm tra nếu có avatar thì upload
      if (avatar) {
        const fileName = avatar.split("/").pop();
        const fileType = "image/jpeg"; // fallback type

        console.log(avatar);

        formData.append("groupAvatar", {
          uri: avatar,
          name: fileName,
          type: fileType,
        });
      }

      const res = await axios.post(
        "https://bechatcnm-production.up.railway.app/conversations/createwithimage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Group Info", res.data);

      socket.current.emit("createGroup", {
        conversationId: res.data._id,
        userId: idUser,
      });

      resetState();
      onClose();
    } catch (err) {
      console.error("Tạo nhóm thất bại:", err.response?.data || err.message);
      setLoadingState(false); // <--- Thêm dòng này
      Alert.alert("Không thể tạo nhóm.");
    }
  };

  const resetState = () => {
    setNameGroup("");
    setAvatar(null);
    setSelectedFriends([]);
    setPhoneNumber("");
    setLoadingState(false);
  };

  const handleAddUsersToGroup = async () => {
    console.log(selectedFriends);
    setLoadingState(true);

    socket.current.emit("addMembersToGroup", {
      conversationId: idGroup,
      newMemberIds: selectedFriends,
      addedBy: idUser,
    });

    // Reset và đóng modal trước khi điều hướng
    resetState();
    onClose();

    // Đảm bảo modal đã được đóng trước khi điều hướng
    setTimeout(() => {
      navigation.navigate("ChatListScreen");
    }, 300); // Chờ một chút để đảm bảo modal đã đóng
  };

  const renderPhoneInput = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <TextInput
        placeholder="Nhập SĐT để thêm bạn"
        style={[styles.input, { flex: 1 }]}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        onSubmitEditing={searchFriendByPhone} // Khi nhấn Enter, sẽ gọi hàm tìm kiếm
        returnKeyType="search" // Đặt loại nút bàn phím là "search" (hỗ trợ Enter)
      />
    </View>
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.text}>
            {typeAction === "create" ? "Tạo Nhóm Mới" : "Thêm Thành Viên"}
          </Text>

          {typeAction === "create" && (
            <>
              <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                <Entypo name="image-inverted" size={24} color="black" />
              </TouchableOpacity>

              {avatar && (
                <Image source={{ uri: avatar }} style={styles.avatarPreview} />
              )}

              <TextInput
                placeholder="Tên Nhóm"
                style={styles.input}
                value={nameGroup}
                onChangeText={setNameGroup}
              />

              {renderPhoneInput()}
            </>
          )}

          {typeAction === "update" && renderPhoneInput()}

          <FlatList
            style={{ maxHeight: 300 }}
            data={friendNotToGroup}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={() => (
              <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
                Danh sách bạn:
              </Text>
            )}
            renderItem={({ item }) => {
              const isExisting = alreadyInGroup.has(item._id);
              const isSelectedUser = item._id === idUserSelect;

              return (
                <View style={styles.friendItem}>
                  {isExisting ? (
                    <Text style={styles.friendName}>
                      {item.username}{" "}
                      <Text style={{ color: "gray" }}>(Đã có)</Text>
                    </Text>
                  ) : (
                    <>
                      <CheckBox
                        checked={selectedFriends.includes(item._id)}
                        onPress={() => {
                          if (item._id !== idUserSelect)
                            toggleFriendSelection(item._id);
                        }}
                        disabled={item._id === idUserSelect}
                        containerStyle={{ padding: 0, margin: 0 }}
                      />

                      <Text style={styles.friendName}>
                        {item.username}{" "}
                        {isSelectedUser && (
                          <Text style={{ color: "gray" }}>(Đã chọn)</Text>
                        )}
                      </Text>
                    </>
                  )}
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.friendAvatar}
                  />
                </View>
              );
            }}
          />

          <View style={styles.buttonRow}>
            {typeAction === "create" && (
              <Button title="Tạo Nhóm" onPress={handleCreateGroupChat} />
            )}
            {typeAction === "update" && (
              <Button title="Thêm" onPress={handleAddUsersToGroup} />
            )}
            <Button title="Đóng" onPress={onClose} />
          </View>
        </View>
        <Loading loadingState={loadingState}></Loading>
      </View>
    </Modal>
  );
};

export default ModalAddUserToGroup;

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
  },
  text: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  editIcon: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#eee",
    padding: 8,
    borderRadius: 20,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    alignSelf: "center",
  },
  input: {
    width: "100%",
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
    backgroundColor: "#f8f8f8",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 10,
    backgroundColor: "#ddd",
  },
  friendName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
