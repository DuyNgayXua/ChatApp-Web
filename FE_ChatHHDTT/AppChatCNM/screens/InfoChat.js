import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Modal,
  Alert,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import io from "socket.io-client";
import { getConversationById } from "../services/apiServices"; // Thêm import
import ModalAddUserToGroup from "./ModelAddUserGroup";
import ModalEditGroupInfo from "./EditGroupInfo";
import Feather from "@expo/vector-icons/Feather";
import ModalChangeLead from "./ModalChangeLead";
import Entypo from "@expo/vector-icons/Entypo";
import { ScrollView } from "react-native-web";
import {
  uploadFiles,
  getMessages,
  pinMessage,
  recallMessage as recallMessageApi,
  deleteMessageForUser,
  getListFriend,
  createConversation,
  getConversations,
} from "../services/apiServices";
import MediaMessagesViewer from "./RenderMessageMedia";

import { Video } from "expo-av";

export default function InfoChat({ route }) {
  const {
    conversation: initialConversation,
    currentUser,
    otherUser,
  } = route.params;
  const navigation = useNavigation();

  console.log("User hien tai", currentUser);

  const isGroup = initialConversation.isGroup;
  const [conversation, setConversation] = useState(initialConversation); // Thêm state cho conversation
  const [showOptionsFor, setShowOptionsFor] = useState(null);
  const [members, setMembers] = useState(initialConversation.members);
  const [deputies, setDeputies] = useState(
    initialConversation.groupDeputies || []
  );

  const socket = useRef(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(true);
  const [modalEditGroup, setModalEditGroup] = useState(false);
  const [modalLeaveGroupLead, setModalLeaveGroupLead] = useState(false);
  const [mediaMessages, setMediaMessages] = useState([]);
  const [noMediaMessage, setNoMediaMessage] = useState("");
  const [fullScreenMedia, setFullScreenMedia] = useState(null); // { type: 'image' | 'video', uri: string }

  // Lấy dữ liệu cuộc trò chuyện mới nhất
  const fetchConversation = async () => {
    try {
      const updatedConversation = await getConversationById(
        initialConversation._ids
      );
      setConversation(updatedConversation);
      setMembers(updatedConversation.members);
      setDeputies(updatedConversation.groupDeputies || []);
    } catch (error) {}
  };

  // Lấy các mesage với type file và video

  const fetchMediaMessages = async () => {
    try {
      const data = await getMessages(conversation._id);

      const mediaMessages = data
        .filter(
          (msg) =>
            (msg.messageType === "file" && msg.fileUrl) ||
            (msg.messageType === "video" && msg.videoUrl) ||
            (msg.messageType === "image" && msg.imageUrl)
        )
        .map((msg) => {
          const userInfo =
            msg.messageType === "system"
              ? { _id: "system", name: "Hệ thống" }
              : {
                  _id: msg.senderId?._id ?? "unknown",
                  name: msg.senderId?.username ?? "Không xác định",
                  avatar: msg.senderId?.avatar ?? "",
                };

          return {
            _id: msg._id ?? `${Date.now()}-${Math.random()}`,
            text: msg.isRecalled ? "Tin nhắn đã bị thu hồi" : msg.text || "",
            createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
            user: userInfo,
            file: msg.fileUrl || undefined,
            video: msg.videoUrl || undefined,
            image: msg.imageUrl || undefined,
            fileName: msg.fileName || "",
            messageType: msg.messageType,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Mới nhất lên đầu

      if (mediaMessages.length === 0) {
        setMediaMessages([]);
        setNoMediaMessage("Không có gì cả");
      } else {
        console.log("Media Message ", mediaMessages);
        setMediaMessages(mediaMessages);
        setNoMediaMessage("");
      }
    } catch (error) {
      console.error("🚨 Lỗi khi fetch media messages:", error);
      alert("Không thể tải file/video/hình ảnh. Vui lòng thử lại.");
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchConversation(); // Làm mới dữ liệu mỗi khi màn hình được focus
      fetchMediaMessages();
    }, [])
  );

  useEffect(() => {
    socket.current = io("https://bechatcnm-production.up.railway.app", {
      transports: ["websocket"],
    });

    socket.current.on("connect", () => {
      console.log("Socket connected in InfoChat:", socket.current.id);
    });

    socket.current.on(
      "groupUpdatedToggleDeputy",
      ({ conversationId, groupDeputies }) => {
        if (conversationId === conversation._id) {
          // console.log("Received groupUpdatedToggleDeputy:", { groupDeputies });
          setDeputies(groupDeputies || []);
          fetchConversation(); // Làm mới dữ liệu khi nhận sự kiện
        }
      }
    );

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [conversation._id]);

  const handleGoBack = () => {
    navigation.navigate("ChatScreen", {
      conversation, // Truyền conversation đã cập nhật về ChatScreen
      currentUser,
      otherUser,
    });
  };

  const handleCreateGroup = () => {
    setModalVisible(true);
  };

  const handleToggleDeputy = (targetUserId) => {
    socket.current.emit("toggleDeputy", {
      conversationId: conversation._id,
      targetUserId,
      byUserId: currentUser._id,
    });
    setShowOptionsFor(null);
    setTimeout(() => {
      navigation.navigate("ChatListScreen");
    }, 2000); // 2000 milliseconds = 2 seconds
  };

  const handleLeaveConversation = async () => {};

  // Giải Tán Nhóm
  const handleGroupDisbandedSocket = async () => {
    // console.log("📤 Emit sự kiện giải tán nhóm");

    socket.current.emit("disbandGroup", {
      conversationId: conversation._id,
      userId: currentUser._id,
    });

    navigation.navigate("ChatListScreen");
  };

  const handleLeaveGroup = (conversationId) => {
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
                conversationId,
                userId: currentUser._id,
              });
            } catch (error) {
              console.error("Error leaving group:", error);
            }
            navigation.navigate("ChatListScreen");
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveFromGroup = (memberId) => {
    // Gửi sự kiện lên server
    socket.current.emit("kickMember", {
      conversationId: conversation._id,
      targetUserId: memberId,
      byUserId: currentUser._id,
    });

    // Delay 2 giây rồi mới navigate
    setTimeout(() => {
      navigation.navigate("ChatListScreen");
    }, 2000); // 2000 milliseconds = 2 giây
  };

  const handleHideConversation = () => {
    // console.log("Conservation Hide ", conversation._id);
    // console.log("User Id Hide", currentUser._id);

    if (window.confirm("Bạn có chắc muốn ẩn đoạn chat này?")) {
      socket.current.emit("deleteChat", {
        conversationId: conversation._id,
        userId: currentUser._id,
      });
    }

    // Delay 2 giây rồi mới navigate
    navigation.replace("ChatListScreen"); // sẽ remount lại hoàn toàn ChatListScreen
  };

  const renderMember = ({ item }) => {
    const isLeader = conversation.groupLeader === item._id;
    const isDeputy = deputies.some((id) => id === item._id);
    const isOptionsOpen = showOptionsFor === item._id;
    const isCurrentUserLeader = conversation.groupLeader === currentUser._id;
    const isCurrentUser = currentUser._id === item._id;

    // Kiểm tra nếu không phải nhóm trưởng hoặc phó nhóm thì không cho phép hiển thị các tùy chọn
    const canManage = isLeader || isDeputy || isCurrentUserLeader;

    return (
      <View key={item._id} style={styles.memberContainer}>
        <View style={styles.memberInfo}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>
              {item.username}
              {isLeader && <Text style={styles.roleText}> 👑 Nhóm trưởng</Text>}
              {isDeputy && !isLeader && (
                <Text style={styles.roleText}> ✨ Phó nhóm</Text>
              )}
            </Text>
          </View>
        </View>

        {canManage ? (
          <TouchableOpacity
            onPress={() =>
              setShowOptionsFor((prev) => (prev === item._id ? null : item._id))
            }
          >
            <Ionicons name="ellipsis-vertical" size={20} color="gray" />
          </TouchableOpacity>
        ) : (
          <Ionicons name="ellipsis-vertical" size={20} color="gray" />
        )}

        {isOptionsOpen && canManage && (
          <View style={styles.optionsBox}>
            {isLeader ? (
              <Text style={styles.leaderText}>👑 Nhóm trưởng</Text>
            ) : isCurrentUserLeader ? (
              <>
                <TouchableOpacity onPress={() => handleToggleDeputy(item._id)}>
                  <Text style={styles.optionText}>
                    {isDeputy
                      ? "❌ Thu hồi quyền phó nhóm"
                      : "✨ Cấp quyền phó nhóm"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    console.log("Xoá khỏi cuộc trò chuyện:", item._id);
                    handleRemoveFromGroup(item._id);
                  }}
                >
                  <Text style={[styles.optionText, { color: "red" }]}>
                    ❌ Xóa khỏi cuộc trò chuyện
                  </Text>
                </TouchableOpacity>
              </>
            ) : isCurrentUser ? (
              <TouchableOpacity
                onPress={() => {
                  console.log("Xóa cuộc trò chuyện với người này");
                  // Thực hiện hành động xóa cuộc trò chuyện
                }}
              >
                <Text style={[styles.optionText, { color: "red" }]}>
                  ❌ Xóa cuộc trò chuyện
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.optionText}>Không có quyền quản lý</Text>
            )}

            {isCurrentUser && !isLeader && (
              <TouchableOpacity>
                <Text style={[styles.optionText, { color: "red" }]}>
                  ❌ Rời khỏi cuộc trò chuyện
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>
        {isGroup ? "Thông tin nhóm" : otherUser.username}
      </Text>

      {isGroup ? (
        <>
          <View style={styles.groupHeader}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Image
                source={{
                  uri:
                    conversation.groupAvatar ||
                    "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg",
                }}
                style={styles.groupImage}
              />
            </TouchableOpacity>
            <View>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setModalEditGroup(true)}
              >
                <Text style={styles.groupName}>{conversation.name}</Text>
                <Feather name="edit" size={20} color="black" />
              </TouchableOpacity>

              <ModalEditGroupInfo
                group={conversation}
                visible={modalEditGroup}
                onClose={() => {
                  setModalEditGroup(false);
                  setRefreshFlag((prev) => !prev);
                }}
              ></ModalEditGroupInfo>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Danh sách thành viên</Text>
          <FlatList
            data={members}
            keyExtractor={(item) => item._id}
            renderItem={renderMember}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <TouchableOpacity
            style={styles.addMemberBtn}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="person-add" size={24} color="#007bff" />
            <Text style={styles.addMemberText}>Thêm thành viên</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.addMemberBtn}
            onPress={handleHideConversation}
          >
            <Entypo name="eye-with-line" size={24} color="black" />
            <Text style={styles.addMemberText}>Ẩn Cuộc Trò Chuyện</Text>
          </TouchableOpacity> */}

          {/*Render Hình Ảnh Và Video Với Mỗi Đoạn Chat  */}
          <MediaMessagesViewer messages={mediaMessages}></MediaMessagesViewer>

          {/* Out  */}
          {conversation.groupLeader === currentUser._id ? (
            <View>
              <TouchableOpacity
                style={styles.leaveGroupBtn}
                onPress={() => {
                  setModalLeaveGroupLead(true);
                }}
              >
                <Ionicons name="exit-outline" size={24} color="red" />
                <Text style={styles.leaveGroupText}>Rời cuộc trò chuyện</Text>
              </TouchableOpacity>

              <ModalChangeLead
                members={members}
                idLeadOLD={currentUser._id}
                conservationID={conversation._id}
                visible={modalLeaveGroupLead}
                onClose={() => {
                  setModalLeaveGroupLead(false);
                  setRefreshFlag((prev) => !prev);
                }}
              ></ModalChangeLead>

              <TouchableOpacity
                style={[styles.leaveGroupBtn, { backgroundColor: "#ffcccc" }]}
                onPress={handleGroupDisbandedSocket}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
                <Text style={styles.leaveGroupText}>
                  Giải tán cuộc trò chuyện
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.leaveGroupBtn}
              onPress={() => {
                handleLeaveGroup(conversation._id); // Gọi hàm handleLeaveGroup và truyền conversationId
              }}
            >
              <Ionicons name="exit-outline" size={24} color="red" />
              <Text style={styles.leaveGroupText}>Rời cuộc trò chuyện</Text>
            </TouchableOpacity>
          )}

          <ModalAddUserToGroup
            visible={isModalVisible}
            typeAction="update"
            idUser={currentUser._id}
            onClose={() => {
              setModalVisible(false);
              setRefreshFlag((prev) => !prev);
            }}
            existingMembers={members}
            idGroup={conversation._id}
          >
            Thêm Thành Viên
          </ModalAddUserToGroup>
        </>
      ) : (
        <>
          {/* Thêm Nhóm VỚi Người Khác */}
          <View style={styles.singleUserInfo}>
            <Image
              source={{ uri: otherUser.avatar }}
              style={styles.avatarLarge}
            />
            <Text style={styles.username}>{otherUser.username}</Text>
          </View>

          {/* <TouchableOpacity
            style={styles.addMemberBtn}
            onPress={handleHideConversation}
          >
            <Entypo name="eye-with-line" size={24} color="black" />
            <Text style={styles.addMemberText}>Ẩn Cuộc Trò Chuyện</Text>
          </TouchableOpacity> */}

          {/* Render Message Media Chat 1-1 */}
          <MediaMessagesViewer messages={mediaMessages}></MediaMessagesViewer>

          <TouchableOpacity
            style={styles.createGroupBtn}
            onPress={handleCreateGroup}
          >
            <MaterialIcons name="group-add" size={24} color="white" />
            <Text style={styles.btnText}>Tạo nhóm với người này</Text>

            <ModalAddUserToGroup
              visible={isModalVisible}
              typeAction="create"
              idUser={currentUser._id}
              onClose={() => {
                setModalVisible(false);
                setRefreshFlag((prev) => !prev);
                navigation.navigate("ChatListScreen");
              }}
              idGroup={conversation._id}
              idUserSelect={otherUser._id}
            >
              Tạo Nhóm
            </ModalAddUserToGroup>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  memberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
  },
  singleUserInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  createGroupBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    backgroundColor: "#007bff",
    paddingVertical: 12,
    borderRadius: 8,
  },
  btnText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
  addMemberBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  addMemberText: {
    fontSize: 16,
    color: "#007bff",
    marginLeft: 6,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionsBox: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    marginLeft: 54,
  },
  optionText: {
    fontSize: 14,
    paddingVertical: 4,
  },
  leaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  roleText: {
    fontSize: 12,
    color: "#007bff",
    marginLeft: 5,
  },
  backButton: {
    padding: 8,
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  leaveGroupBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginTop: 10,
    backgroundColor: "#ffe5e5",
    borderRadius: 8,
    justifyContent: "center",
  },

  leaveGroupText: {
    color: "red",
    marginLeft: 8,
    fontWeight: "600",
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  groupImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eee",
  },
  groupName: {
    fontSize: 20,
    fontWeight: "600",
  },
  editText: {
    fontSize: 14,
    color: "blue",
  },
});
