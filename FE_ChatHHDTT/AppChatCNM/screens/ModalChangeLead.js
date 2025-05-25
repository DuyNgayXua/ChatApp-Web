import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { CheckBox } from "react-native-elements";
import { io } from "socket.io-client";
import Loading from "../loading";

const ModalChangeLead = ({
  members,
  visible,
  onClose,
  conservationID,
  idLeadOLD,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const socket = useRef(null);
  const navigation = useNavigation();
  const [stateLoading, setStateLoading] = useState(false);

  useEffect(() => {
    socket.current = io("https://bechatcnm-production.up.railway.app", {
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("Socket connected in InfoChat:", socket.current.id);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  });

  const handleSelect = (itemId) => {
    setSelectedId(itemId);
  };

  const renderItem = ({ item }) => {
    const isChecked = item._id === selectedId;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleSelect(item._id)}
      >
        <CheckBox
          checked={isChecked}
          onPress={() => handleSelect(item._id)}
          containerStyle={{ padding: 0, marginRight: 10 }}
        />
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{item.username}</Text>
      </TouchableOpacity>
    );
  };

  const handleChangeLeadInGroup = () => {
    // console.log("Selected Leader ID:", selectedId);

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn rời nhóm này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: () => {
            try {
              socket.current.emit("leaveGroup", {
                conversationId: conservationID,
                userId: idLeadOLD,
                newLeaderId: selectedId, // chỉ gửi nếu là nhóm trưởng
              });

              setTimeout(() => {
                onClose();
                navigation.navigate("ChatListScreen");
              }, 2000);
            } catch (error) {
              console.log("Error leaving group:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Chọn trưởng nhóm mới</Text>

          <FlatList
            data={members.filter((item) => item._id !== idLeadOLD)}
            keyExtractor={(item) => item._id.toString()}
            renderItem={renderItem}
            extraData={selectedId}
          />

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleChangeLeadInGroup}>
              <Text style={styles.closeText}>Xác Nhận</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>|</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ModalChangeLead;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxHeight: "70%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    marginHorizontal: 15,
    color: "#999",
  },
  closeText: {
    color: "blue",
    fontSize: 16,
  },
});
