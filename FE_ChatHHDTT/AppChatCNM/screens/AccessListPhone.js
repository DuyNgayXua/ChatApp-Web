import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
  Modal,
} from "react-native";
import { MaterialIcons, FontAwesome } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  getListFriend,
  getFriendByPhone,
  createConversation,
  unfriend,
  checkFriendStatus,
  addFriend,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  cancelFriendRequest,
} from "../services/apiServices";

import { NETWORK } from "@env";

const ContactItem = ({
  item,
  onPress,
  onUnfriend,
  isFriend,
  onAddFriend,
  onAcceptFriend,
  onRejectFriend,
  onCancelFriendRequest,
  requestInfo,
}) => (
  <TouchableOpacity
    style={styles.contactItem}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Animated.View entering={FadeInDown.duration(500)}>
      <View style={styles.contactCard}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.username}</Text>
          {item.phone && (
            <Text style={styles.contactStatus}>
              Số điện thoại: {item.phone}
            </Text>
          )}
        </View>
        {isFriend === "accepted" ? (
          <View style={styles.friendStatus}>
            <Text style={styles.friendText}>Bạn bè</Text>
          </View>
        ) : requestInfo?.senderId?._id === item._id ? ( // Kiểm tra nếu có thông tin yêu cầu đến và người gửi là item hiện tại
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() =>
                onAcceptFriend(requestInfo?._id, requestInfo?.senderId?._id)
              }
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionText}>Chấp nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => onRejectFriend(requestInfo?._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionText}>Từ chối</Text>
            </TouchableOpacity>
          </View>
        ) : isFriend === "pending" ? ( // Trường hợp bạn đã gửi yêu cầu (theo logic hiện tại của API checkFriendStatus)
          <View style={styles.actionButtonsContainer}>
            <View style={styles.sentRequestStatus}>
              <Text style={styles.sentRequestText}>Đã gửi</Text>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => onCancelFriendRequest(item._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.actionText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onAddFriend(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.actionText}>Kết bạn</Text>
          </TouchableOpacity>
        )}

        {isFriend === "accepted" && (
          <TouchableOpacity
            style={styles.unFriendButton}
            onPress={() => onUnfriend(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  </TouchableOpacity>
);

const AccessListPhone = ({ route }) => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = route.params;
  const [searchedUser, setSearchedUser] = useState(null);
  const [friendStatus, setFriendStatus] = useState(null);
  const [friendList, setFriendList] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequest, setIncomingRequest] = useState(null); // State để lưu thông tin yêu cầu đến
  const [incomingRequestsList, setIncomingRequestsList] = useState([]);
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);

  const fetchFriendList = useCallback(async () => {
    if (currentUser && currentUser._id) {
      try {
        const fetchedFriends = await getListFriend(currentUser._id);
        setFriendList(fetchedFriends);
        setFriends(fetchedFriends);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách bạn bè.");
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchFriendList();
  }, [fetchFriendList]);

  const fetchIncomingRequests = useCallback(async () => {
    if (currentUser?._id) {
      try {
        const requests = await getFriendRequests(currentUser._id);
        setIncomingRequestsList(requests);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách yêu cầu kết bạn:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách yêu cầu kết bạn.");
      }
    }
  }, [currentUser]);

  useEffect(() => {
    fetchIncomingRequests();
  }, [fetchIncomingRequests]);

  useEffect(() => {
    const search = async () => {
      const query = searchQuery.trim();

      if (!query) {
        setSearchedUser(null);
        setFriendStatus(null);
        setIncomingRequest(null);
        setFriends(friendList);
        return;
      }

      if (/^\d+$/.test(query)) {
        // Chỉ gọi API nếu số điện thoại có ít nhất 10 chữ số
        if (query.length < 10) {
          setSearchedUser(null);
          setFriendStatus(null);
          setIncomingRequest(null);
          return;
        }
        try {
          // console.log("Calling getFriendByPhone with phone:", query);
          const result = await getFriendByPhone(query);
          // console.log("getFriendByPhone result:", result);

          if (result && currentUser && currentUser._id) {
            setSearchedUser(result);
            const isAlreadyFriend = friendList.some(
              (friend) => friend._id === result._id
            );
            if (isAlreadyFriend) {
              setFriendStatus("accepted");
              setIncomingRequest(null);
            } else {
              try {
                // console.log(
                //   "Calling checkFriendStatus with:",
                //   currentUser._id,
                //   result._id
                // );
                const statusResponse = await checkFriendStatus(
                  currentUser._id,
                  result._id
                );
                // console.log("checkFriendStatus result:", statusResponse);
                setFriendStatus(statusResponse?.status || "none");
                if (
                  statusResponse?.status === "pending" &&
                  statusResponse?.requestId
                ) {
                  setSearchedUser((prevUser) => ({
                    ...prevUser,
                    requestId: statusResponse.requestId,
                  }));
                } else {
                  setSearchedUser((prevUser) => ({
                    ...prevUser,
                    requestId: null,
                  }));
                }
                const incomingRequestFound = incomingRequestsList.find(
                  (req) => req.senderId?._id === result._id
                );
                if (incomingRequestFound) {
                  setIncomingRequest(incomingRequestFound);
                  setFriendStatus("pending");
                } else {
                  setIncomingRequest(null);
                }
              } catch (statusError) {
                console.error(
                  "Error in checkFriendStatus:",
                  statusError.response?.data || statusError.message
                );
                setFriendStatus("none");
                setIncomingRequest(null);
                Alert.alert("Lỗi", "Không thể kiểm tra trạng thái bạn bè.");
              }
            }
          } else {
            setSearchedUser(null);
            setFriendStatus(null);
            setIncomingRequest(null);
            Alert.alert(
              "Thông báo",
              "Không tìm thấy người dùng với số điện thoại này."
            );
          }
        } catch (error) {
          //console.error("Error in getFriendByPhone:", error.response?.data || error.message);
          setSearchedUser(null);
          setFriendStatus(null);
          setIncomingRequest(null);
          if (error.response?.status === 404) {
            Alert.alert(
              "Thông báo",
              "Không tìm thấy người dùng với số điện thoại này."
            );
          } else {
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.");
          }
        }
      } else {
        const filteredFriends = friendList.filter((friend) =>
          friend.username.toLowerCase().includes(query.toLowerCase())
        );
        setSearchedUser(null);
        setFriendStatus(null);
        setIncomingRequest(null);
        setFriends(filteredFriends);
      }
    };

    search();
  }, [searchQuery, currentUser, friendList, incomingRequestsList]);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getConversation = async (currentUser, contact) => {
    try {
      const response = await fetch(
        `https://bechatcnm-production.up.railway.app/conversations/${currentUser._id}/search`
      );
      if (!response.ok) {
        throw new Error("Không thể tải danh sách cuộc trò chuyện");
      }
      const conversations = await response.json();

      const conversation = conversations.find((conv) => {
        const memberIds = conv.members.map((m) => m._id);
        return (
          memberIds.includes(currentUser._id) && memberIds.includes(contact._id)
        );
      });

      return conversation || null;
    } catch (error) {
      console.error("Lỗi khi lấy cuộc trò chuyện:", error);
      return null;
    }
  };

  const handleContactPress = async (contact) => {
    try {
      const conversation = await getConversation(currentUser, contact);
      navigation.navigate("ChatScreen", {
        conversation:
          conversation ||
          (await createConversation([currentUser._id, contact._id])),
        currentUser: currentUser,
        otherUser: contact,
      });
    } catch (error) {
      console.error("Lỗi khi mở chat:", error);
      Alert.alert("Lỗi", "Không thể mở cuộc trò chuyện.");
    }
  };

  const handleUnfriend = async (friendToRemove) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc chắn muốn hủy kết bạn với ${friendToRemove.username}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              if (currentUser && currentUser._id && friendToRemove._id) {
                await unfriend(currentUser._id, friendToRemove._id);
                setFriendList((prevList) =>
                  prevList.filter((friend) => friend._id !== friendToRemove._id)
                );
                setFriends((prevList) =>
                  prevList.filter((friend) => friend._id !== friendToRemove._id)
                );
                if (searchedUser && searchedUser._id === friendToRemove._id) {
                  setSearchedUser(null); // Reset searchedUser sau khi hủy kết bạn
                  setFriendStatus(null);
                  setIncomingRequest(null);
                  setSearchQuery(""); // Có thể reset luôn searchQuery để hiển thị lại toàn bộ danh sách bạn bè
                }
                Alert.alert(
                  "Thành công",
                  `Đã hủy kết bạn với ${friendToRemove.username}`
                );
              } else {
                Alert.alert(
                  "Lỗi",
                  "Không thể xác định người dùng hoặc bạn bè."
                );
              }
            } catch (error) {
              console.error("Lỗi khi hủy kết bạn:", error);
              Alert.alert("Lỗi", "Đã xảy ra lỗi khi hủy kết bạn.");
            }
          },
        },
      ]
    );
  };

  const handleAddFriend = async (userToAdd) => {
    Alert.alert(
      "Xác nhận",
      `Bạn muốn gửi lời mời kết bạn đến ${userToAdd.username}?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Gửi",
          onPress: async () => {
            try {
              if (currentUser && currentUser._id && userToAdd._id) {
                const response = await addFriend(
                  currentUser._id,
                  userToAdd._id
                );
                // console.log("Response from addFriend:", response);
                Alert.alert(
                  "Thành công",
                  `Đã gửi lời mời kết bạn đến ${userToAdd.username}`
                );
                setFriendStatus("pending"); // Cập nhật trạng thái thành 'pending' sau khi gửi yêu cầu
              } else {
                Alert.alert(
                  "Lỗi",
                  "Không thể xác định người dùng hoặc bạn bè."
                );
              }
            } catch (error) {
              console.error("Lỗi khi gửi yêu cầu kết bạn:", error);
              Alert.alert("Lỗi", "Đã xảy ra lỗi khi gửi yêu cầu kết bạn.");
            }
          },
        },
      ]
    );
  };

  const handleAcceptFriend = async (requestId, senderId) => {
    try {
      if (requestId && currentUser && currentUser._id && senderId) {
        await acceptFriendRequest(requestId, currentUser._id); // API accept cần requestId và receiverId (là bạn)
        Alert.alert(
          "Thành công",
          `Đã chấp nhận lời mời kết bạn từ ${
            searchedUser?.username || senderId
          }`
        );
        fetchFriendList();
        fetchIncomingRequests(); // Cập nhật lại danh sách yêu cầu
        setSearchedUser(null);
        setFriendStatus("accepted");
        setIncomingRequest(null);
      } else {
        Alert.alert("Lỗi", "Không thể chấp nhận yêu cầu kết bạn.");
      }
    } catch (error) {
      console.error("Lỗi khi chấp nhận yêu cầu kết bạn:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chấp nhận yêu cầu kết bạn.");
    }
  };

  const handleRejectFriend = async (requestId) => {
    try {
      if (requestId) {
        await rejectFriendRequest(requestId);
        Alert.alert(
          "Thành công",
          `Đã từ chối lời mời kết bạn từ ${searchedUser?.username}`
        );
        fetchIncomingRequests(); // Cập nhật lại danh sách yêu cầu
        setSearchedUser(null);
        setFriendStatus(null);
        setIncomingRequest(null);
      } else {
        Alert.alert("Lỗi", "Không thể từ chối yêu cầu kết bạn.");
      }
    } catch (error) {
      console.error("Lỗi khi từ chối yêu cầu kết bạn:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi từ chối yêu cầu kết bạn.");
    }
  };
  // Trong component AccessListPhone
  const handleCancelFriendRequest = async (receiverId) => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn hủy lời mời kết bạn này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy",
        onPress: async () => {
          try {
            if (receiverId && currentUser?._id) {
              // Đảm bảo bạn truyền cả receiverId và senderId (currentUser._id)
              await cancelFriendRequest(receiverId, currentUser._id);
              Alert.alert("Thành công", "Đã hủy yêu cầu kết bạn.");
              setFriendStatus("none");
              setSearchedUser((prevUser) => ({
                ...prevUser,
                friendStatus: "none",
              }));
            } else {
              Alert.alert(
                "Lỗi",
                "Không tìm thấy ID người nhận hoặc thông tin người dùng."
              );
            }
          } catch (error) {
            console.error("Lỗi khi hủy yêu cầu kết bạn:", error);
            Alert.alert("Lỗi", "Đã xảy ra lỗi khi hủy yêu cầu.");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <ContactItem
      item={item}
      onPress={() => handleContactPress(item)}
      onUnfriend={handleUnfriend}
      isFriend={"accepted"}
    />
  );

  const renderSearchResult = () => {
    if (searchedUser && friendStatus !== null) {
      return (
        <ContactItem
          item={searchedUser}
          onPress={() => handleContactPress(searchedUser)}
          isFriend={friendStatus}
          onAddFriend={handleAddFriend}
          onAcceptFriend={handleAcceptFriend}
          onRejectFriend={handleRejectFriend}
          requestInfo={incomingRequest}
          onUnfriend={friendStatus === "accepted" ? handleUnfriend : undefined}
          onCancelFriendRequest={handleCancelFriendRequest}
        />
      );
    }
    return null;
  };

  const openRequestModal = () => {
    setIsRequestModalVisible(true);
  };

  const closeRequestModal = () => {
    setIsRequestModalVisible(false);
  };

  const renderFriendRequestsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isRequestModalVisible}
      onRequestClose={closeRequestModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Lời mời kết bạn</Text>
          <FlatList
            data={incomingRequestsList}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Image
                    source={{ uri: item.senderId?.avatar }}
                    style={styles.requestAvatar}
                  />
                  <Text style={styles.requestName}>
                    {item.senderId?.username}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionButtonModal, styles.acceptButton]}
                    onPress={() =>
                      handleAcceptFriend(item._id, item.senderId?._id)
                    }
                  >
                    <Text style={styles.actionText}>Chấp nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButtonModal, styles.rejectButton]}
                    onPress={() => handleRejectFriend(item._id)}
                  >
                    <Text style={styles.actionText}>Từ chối</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeRequestModal}
          >
            <Text style={styles.closeButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonWrapper}
          onPress={handleGoBack}
        >
          <Ionicons name={"arrow-back-outline"} size={25} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contacts</Text>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.iconAddFriend}
          onPress={openRequestModal}
        >
          <MaterialIcons name="person-add" size={30} color="gray" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm bạn qua số điện thoại hoặc tên..."
          placeholderTextColor="#757575"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {renderSearchResult()}

      {/* Chỉ hiển thị danh sách bạn bè nếu không có tìm kiếm hoặc không có kết quả tìm kiếm bằng số điện thoại */}
      {(!searchQuery.trim() ||
        (!searchedUser && !searchQuery.match(/^\d+$/))) && (
        <FlatList
          data={searchQuery.trim() ? friends : friendList}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={true}
        />
      )}

      {renderFriendRequestsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#2196F3",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  backButtonWrapper: {
    position: "absolute",
    top: 20,
    left: 15,
    height: 44,
    width: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 30,
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contactList: {
    padding: 10,
    paddingBottom: 20,
  },
  contactItem: {
    marginBottom: 10,
  },
  contactCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: "#2196F3",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  contactStatus: {
    fontSize: 14,
    fontWeight: "400",
  },
  unFriendButton: {
    marginLeft: "auto",
    padding: 5,
  },
  friendStatus: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  friendText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButton: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  actionButtonModal: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 3, // Giảm padding nút
    paddingHorizontal: 5, // Giảm padding nút
    marginLeft: 5,
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    marginLeft: 10,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  rejectButton: {
    backgroundColor: "#FF6B6B",
    marginLeft: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8, // Giảm padding dọc
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  requestInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestAvatar: {
    width: 30, // Giảm kích thước avatar
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  requestName: {
    fontSize: 10, // Giảm kích thước font
    fontWeight: "500",
  },
  requestActions: {
    flexDirection: "row",
  },
  closeButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 20,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  sentRequestStatus: {
    backgroundColor: "#A9A9A9", // Màu xám nhạt
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 5,
  },
  sentRequestText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF8C00", // Màu cam
    marginLeft: 5,
  },
});

export default AccessListPhone;
