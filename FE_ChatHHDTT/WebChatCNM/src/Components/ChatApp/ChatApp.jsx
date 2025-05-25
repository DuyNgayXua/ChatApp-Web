import { React, useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";
import {
  FaPaperPlane,
  FaSearch,
  FaPhone,
  FaVideo,
  FaStarHalfAlt,
  FaExclamationCircle,
  FaEllipsisV,
  FaComments,
  FaUsers,
  FaPaperclip,
  FaMicrophone,
  FaImage,
  FaSmile,
  FaClock,
  FaCheck,
  FaTimes,
  FaAddressBook,
  FaCog,
  FaUser,
  FaUserPlus,
  FaUserCheck, // Icon Groups
  FaEllipsisH, // Icon More
  FaCamera,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiMoreVertical,
} from "react-icons/fi"; // ✅ Đúng

import "./chatApp.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiTrash2, FiEyeOff } from "react-icons/fi"; // Thùng rác nét mảnh, hiện đại

import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { set } from "mongoose";
// import { image } from "../../../../../BE_ChatHHDTT/config/cloudConfig";
// Test
const socket = io("https://bechatcnm-production.up.railway.app", {
  transports: ["websocket"],
});

Modal.setAppElement("#root");

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarView, setSidebarView] = useState("chat-list"); // Mặc định hiển thị danh sách chat
  const [selectedHeader, setSelectedHeader] = useState("");
  const navigate = useNavigate();
  const messageRefs = useRef({});

  dayjs.extend(relativeTime);
  dayjs.locale("vi");
  const [selectedtitle, setSelectedTitle] = useState(
    "Chào mừng bạn đến với ứng dụng chat! "
  );
  const [selectedtitle2, setSelectedTitle2] = useState(
    "Chào mừng bạn đến với ứng dụng chat! "
  );
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null); // Tham chiếu đến menu
  const friendMenuRef = useRef({}); // Tham chiếu đến menu xóa bạn
  const friendRef = useRef(null); // Tham chiếu đến phần tử bạn
  const membersListRef = useRef(null); // danh sách thành viên nhóm

  const location = useLocation();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : location.state?.user;
  });

  //Update user
  const [showModal, setShowModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    username: "",
    phone: "",
    password: "",
    avatar: "",
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [inputText, setInputText] = useState("");
  const inputRef = useRef(null);
  const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);

  const [friendRequests, setFriendRequests] = useState([]); //Lưu danh sách lời mời kết bạn
  const [showFriendRequests, setShowFriendRequests] = useState(false); // Hiển thị ds lời mời kết bạn
  const [friends, setFriends] = useState([]); // Lưu danh sách bạn bè
  const [selectedFriend, setSelectedFriend] = useState(null); // xóa bạn bè
  const [chatSearch, setChatSearch] = useState([]);
  const [chats, setChats] = useState([]);
  const [mediaSender, setMediaSender] = useState(null); // Lưu thông tin người gửi media
  const [showAllMedia, setShowAllMedia] = useState(false); // Xem tất cả, trong phần xem lại video, image
  const [showAllFiles, setShowAllFiles] = useState(false); // cho file
  const [showMembersList, setShowMembersList] = useState(false); // hiển thị danh sách thành viên
  const [showAddMembersModal, setShowAddMembersModal] = useState(false); // Thêm vào thành viên vào nhóm
  const [selectedMembers, setSelectedMembers] = useState([]); // Lưu danh sách thành viên được chọn
  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPhoneUsers, setSelectedPhoneUsers] = useState([]);
  const [showMenuId, setShowMenuId] = useState(null); // menu rời nhóm từ ds nhóm
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null); // ảnh upload
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false); // Tạo nhóm chat với bạn bè chọn

  const [showForwardModal, setShowForwardModal] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null); // Set khi ấn "Chuyển tiếp"
  const [selectedChatsToForward, setSelectedChatsToForward] = useState([]);
  const [openOptionsMemberId, setOpenOptionsMemberId] = useState(null);
  const [hasNewFriendRequest, setHasNewFriendRequest] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);

  const [groupImageFile, setGroupImageFile] = useState(null);
  const [groupImagePreview, setGroupImagePreview] = useState(null);

  const [showSelectNewLeaderModal, setShowSelectNewLeaderModal] =
    useState(false);
  const [pendingLeaveGroup, setPendingLeaveGroup] = useState(null);
  {
    /* Lấy danh sách conversation từ server và cập nhật vào state */
  }
  const fetchConversations = async () => {
    try {
      // Bước 1: Lấy danh sách conversation
      const res = await axios.get(
        `https://bechatcnm-production.up.railway.app/conversations/${user._id}`
      );
      let conversations = res.data;
      const conversationbyId = res.data;

      // Bước 2: Lọc bỏ conversations có messages rỗng
      // conversations = conversations.filter(

      //   (conv) => conv.messages.length > 0 || conv.isGroup === true
      // );
      // Bước 3: Lọc bỏ conversations đã bị xóa bởi tôi
      conversations = conversations.filter(
        (conv) =>
          !conv.deleteBy.some((id) => id.toString() === user._id.toString())
      );

      const chatPromises = conversations.map(async (conv) => {
        // Bước 2: Lấy userId từ members (trừ currentUser)
        const unreadCountForUser =
          conv.unreadCounts.find(
            (item) => item.userId.toString() === user._id.toString()
          )?.count || 0;
        if (conv.isGroup) {
          // 🟢 Đây là conversation nhóm
          const memberIds = conv.members.filter((_id) => _id !== user._id);

          // Gửi yêu cầu API để lấy thông tin của tất cả thành viên trong nhóm
          const memberDetails = await Promise.all(
            memberIds.map(async (memberId) => {
              try {
                const res = await axios.get(
                  `https://bechatcnm-production.up.railway.app/users/get/${memberId}`
                );
                return res.data; // { _id, username, avatar }
              } catch (err) {
                console.error("Lỗi khi lấy thông tin thành viên:", err);
                return {
                  _id: memberId,
                  username: "Không xác định",
                  avatar: "/default-avatar.png",
                };
              }
            })
          );
          // const leftMemberDetails = await Promise.all(
          //   (conv.leftMembers || []).map(async (member) => {
          //     try {
          //       const res = await axios.get(
          //         `https://bechatcnm-production.up.railway.app/users/get/${member.userId}`
          //       );
          //       return {
          //         userId: member.userId,
          //         username: res.data.username, // Lấy username
          //         leftAt: member.leftAt, // Giữ nguyên thời gian rời nhóm
          //         lastMessageId: member.lastMessageId, // Lưu lại ID của tin nhắn cuối cùng
          //       };
          //     } catch (err) {
          //       console.error("Lỗi khi lấy thông tin thành viên rời nhóm:", err);
          //       return { userId: member.userId, username: "Không xác định", leftAt: member.leftAt };
          //     }
          //   })
          // );

          return {
            isGroup: conv.isGroup,
            conversationId: conv._id,
            lastMessageSenderId: conv.lastMessageSenderId,
            lastMessageId: conv.lastMessageId,
            name: conv.name, // Lấy tên nhóm
            image:
              conv.groupAvatar ||
              "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg", // Avatar nhóm
            lastMessage: conv.latestmessage || "",
            timestamp: conv.updatedAt,
            active: false, // Nhóm không có trạng thái online
            unreadCount: unreadCountForUser,
            lastMessageTime: conv.lastMessageTime,
            members: memberDetails, // Lưu danh sách thành viên
            deleteBy: conv.deleteBy, // Lưu danh sách người đã xóa
            // leftMembers: leftMemberDetails, // Lưu danh sách người đã rời nhóm
            groupLeader: conv.groupLeader, // Lưu danh sách người đã thêm vào nhóm
            groupDeputies: conv.groupDeputies, // Lưu danh sách người đã thêm vào nhóm
            isDissolved: conv.isDissolved, // Kiểm tra nhóm đã bị xóa hay chưa
          };
        } else {
          // 🟢 Đây là conversation giữa 2 người
          const otherUserId = conv.members.find((_id) => _id !== user._id);
          const userRes = await axios.get(
            `https://bechatcnm-production.up.railway.app/users/get/${otherUserId}`
          );
          const otherUser = userRes.data;

          return {
            isGroup: conv.isGroup,
            conversationId: conv._id,
            lastMessageSenderId: conv.lastMessageSenderId,
            lastMessageId: conv.lastMessageId,
            name: otherUser.username,
            image: otherUser.avatar,
            userIdSelectedchat: otherUser._id,
            lastMessage: conv.latestmessage || "",
            timestamp: conv.updatedAt,
            active: otherUser.isOnline,
            unreadCount: unreadCountForUser,
            lastMessageTime: conv.lastMessageTime,
            deleteBy: conv.deleteBy, // Lưu danh sách người đã xóa
          };
        }
      });
      // Chờ tất cả promises hoàn thành
      const chatList = await Promise.all(chatPromises);
      setChats(chatList);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchConversations();
    socket.on("conversationUpdated", (data) => {
      fetchConversations(); // Chỉ fetch lại khi có sự thay đổi
    });

    return () => {
      socket.off("conversationUpdated");
    };
  }, [user._id]);

  {
    /* Lắng nghe sự kiện nhận tin nhắn từ server */
  }
  useEffect(() => {
    if (selectedChat) {
      const conversationId = selectedChat.conversationId;
      socket.on(`receiveMessage-${conversationId}`, (msg) => {
        setMessages((prev) => [...prev, msg]);
      });
      return () => {
        socket.off(`receiveMessage-${conversationId}`);
      };
    }
  }, [selectedChat]);

  {
    /* Nhắn tin */
  }
  const sendMessage = (fileUrl = null, fileName = null) => {
    if (!inputText.trim() && !fileUrl) {
      console.log("❌ Tin nhắn rỗng, không gửi");
      return;
    }

    let fileType = "text"; // Mặc định là tin nhắn văn bản
    let messageData = {
      conversationId: selectedChat.conversationId,
      senderId: user._id,
      messageType: "text",
      text: inputText || "",
      replyTo: replyingMessage ? replyingMessage._id : null,
    };
    if (fileUrl && fileName) {
      const imageExtensions = ["jpg", "jpeg", "png", "gif"];
      const videoExtensions = ["mp4", "mov"];
      const fileExtensions = [
        "pdf",
        "docx",
        "xlsx",
        "doc",
        "pptx",
        "txt",
        "zip",
        "rar",
      ];

      const fileExtension = fileName.split(".").pop().toLowerCase();

      if (imageExtensions.includes(fileExtension)) {
        fileType = "image";
        messageData.imageUrl = fileUrl;
      } else if (videoExtensions.includes(fileExtension)) {
        fileType = "video";
        messageData.videoUrl = fileUrl;
      } else if (fileExtensions.includes(fileExtension)) {
        fileType = "file";
        messageData.fileUrl = fileUrl;
      }

      messageData.messageType = fileType;
      messageData.fileName = fileName;
    }

    // Gửi lên socket
    socket.emit("sendMessage", messageData);
    setReplyingMessage(null); // Clear sau khi gửi
    setInputText("");
  };

  {
    /* Pin tin nhắn */
  }
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const scrollToPinnedMessage = () => {
    const pinnedElement = messageRefs.current[pinnedMessage._id];
    if (pinnedElement) {
      pinnedElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setHighlightedMessageId(pinnedMessage._id);
    // Bỏ highlight sau 2 giây
    setTimeout(() => setHighlightedMessageId(null), 2000);
  };

  {
    /* Cuộn tới tin nhắn */
  }
  const scrollToMessage = (messageId) => {
    const messageElement = messageRefs.current[messageId];
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Highlight tin nhắn được cuộn tới
      setHighlightedMessageId(messageId);
      setTimeout(() => setHighlightedMessageId(null), 2000); // xóa highlight sau 2s
    }
  };

  {
    /* Lấy tin nhắn theo conversationId */
  }
  const fetchMessagesByConversationId = async (conversationId) => {
    try {
      const response = await fetch(
        `https://bechatcnm-production.up.railway.app/messages/get/${conversationId}`
      );
      const data = await response.json();
      const pinnedMessage = data.find((msg) => msg.isPinned === true);
      setPinnedMessage(pinnedMessage);
      return data; // data sẽ là mảng messages
    } catch (error) {
      console.error("Lỗi khi lấy messages:", error);
      return [];
    }
  };

  {
    /* Lắng nghe sự kiện khi chọn chat */
  }
  const handleSelectChat = async (chat) => {
    const messages = await fetchMessagesByConversationId(chat.conversationId);

    let createGroupData = null;

    try {
      const res1 = await axios.get(
        `https://bechatcnm-production.up.railway.app/conversations/get/${chat.conversationId}`
      );
      const conversation = res1.data;

      // Kiểm tra nếu có trường createGroup (nghĩa là group chat)
      if (conversation.createGroup?.userId) {
        const res2 = await axios.get(
          `https://bechatcnm-production.up.railway.app/users/get/${conversation.createGroup.userId}`
        );
        const userAdd = res2.data;

        createGroupData = {
          conversationId: chat.conversationId,
          userId: userAdd._id,
          username: userAdd.username,
          lastMessageId: conversation.createGroup.lastMessageId,
        };
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin nhóm:", error);
    }

    setSelectedChat({
      ...chat,
      ...(createGroupData && { createGroup: createGroupData }), // Thêm nếu là group
    });

    socket.emit("markAsSeen", {
      conversationId: chat.conversationId,
      userId: user._id,
    });

    if (chat.lastMessageSenderId !== user._id) {
      socket.emit("messageSeen", {
        messageId: chat.lastMessageId,
        userId: user._id,
      });
    }

    setMessages(messages);
    inputRef.current?.focus();
    setShowFriendRequests(false);
  };

  const showContacts = () => {
    setSearchTerm(""); // Xóa nội dung ô tìm kiếm
    setSearchResult(null);
    setSidebarView("contacts");
    setSelectedChat("");
  };
  const showChatlists = () => {
    setSearchResult(null);
    setSearchTerm(""); // Xóa nội dung ô tìm kiếm
    setSidebarView("chat-list");
    setSelectedTitle("Chào mừng bạn đến với ứng dụng chat! ");
    setSelectedTitle2("Chào mừng bạn đến với ứng dụng chat! ");
    setSelectedHeader("");
  };

  // Hàm bật/tắt menu
  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      // Đóng menu đăng xuất
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
      if (
        membersListRef.current &&
        !membersListRef.current.contains(event.target)
      ) {
        setShowMembersList(null); // Đóng menu thành viên
      }

      // Kiểm tra nếu click nằm ngoài TẤT CẢ các friend menu
      const clickedOutsideAllFriendMenus = Object.values(
        friendMenuRef.current
      ).every((ref) => !ref?.contains(event.target));

      if (clickedOutsideAllFriendMenus) {
        setSelectedFriend(null); // Đóng tất cả menu xóa bạn
      }
    };

    document.addEventListener("mousedown", handleClickOutsideMenu);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideMenu);
    };
  }, []);

  // Hàm xử lý đăng xuất

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `https://bechatcnm-production.up.railway.app/v1/auth/logout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user._id }),
        }
      );

      if (response.ok) {
        console.log("Đã đăng xuất thành công!");
        localStorage.removeItem("user");
        navigate("/login"); // Điều hướng về trang đăng nhập
      } else {
        console.log("Đăng xuất không thành công!");
        toast.error("Đăng xuất không thành công!");
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Có lỗi xảy ra khi đăng xuất!");
    }
  };

  // Hàm xử lý format thời gian tin nhắn
  const formatTimeMessage = (timestamp) => {
    const now = dayjs();
    const messageTime = dayjs(timestamp);
    const diffMinutes = now.diff(messageTime, "minute");
    const diffHours = now.diff(messageTime, "hour");
    const diffDays = now.diff(messageTime, "day");

    if (diffMinutes < 1) {
      return "Vừa xong";
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ`;
    } else if (diffDays === 1) {
      return "Hôm qua";
    } else if (diffDays <= 7) {
      return `${diffDays} ngày`;
    } else {
      return messageTime.format("DD/MM/YYYY");
    }
  };

  {
    /* Hover vào menu tin nhắn và menu chat */
  }
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [menuMessageId, setMenuMessageId] = useState(null);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [menuChatId, setMenuChatId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.closest(".message-menu") &&
        !e.target.closest(".three-dots-icon") &&
        !e.target.closest(".chat-popup-menu") &&
        !e.target.closest(".chat-three-dots-icon")
      ) {
        setMenuMessageId(null);
        setMenuChatId(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  {
    /* Xử lý pin tin nhắn */
  }
  const handlePinMessage = async (messageId, isPinned) => {
    await fetch(
      `https://bechatcnm-production.up.railway.app/messages/pin/${messageId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned }),
      }
    );
    // Gửi tín hiệu tới socket để cập nhật tin nhắn bên người nhận
    socket.emit("messageUpdated", {
      conversationId: selectedChat.conversationId,
    });
    handleSelectChat(selectedChat);
    setMenuMessageId(null);
  };

  {
    /* Xử lý xóa tin nhắn phía tôi */
  }
  const handleDeleteMessageFrom = async (messageId) => {
    await fetch(
      `https://bechatcnm-production.up.railway.app/messages/deletefrom/${messageId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      }
    );
    handleSelectChat(selectedChat);
    setMenuMessageId(null);
  };

  {
    /* Xử lý thu hồi tin nhắn */
  }
  const handleRecallMessage = async (messageId) => {
    try {
      const response = await fetch(
        `https://bechatcnm-production.up.railway.app/messages/recall/${messageId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: selectedChat.conversationId }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        toast.warning(data.message || "Không thể thu hồi tin nhắn");
        return;
      }
      // Gửi tín hiệu tới socket để cập nhật tin nhắn bên người nhận
      socket.emit("messageUpdated", {
        conversationId: selectedChat.conversationId,
      });
      await handleSelectChat(selectedChat); // Refresh messages
    } catch (error) {
      console.error("Recall error:", error);
      toast.error("Đã có lỗi xảy ra khi thu hồi tin nhắn");
    } finally {
      setMenuMessageId(null);
    }
  };
  useEffect(() => {
    socket.on("refreshMessages", ({ conversationId }) => {
      if (selectedChat?.conversationId === conversationId) {
        handleSelectChat(selectedChat);
      }
    });

    return () => socket.off("refreshMessages");
  }, [selectedChat]);

  {
    /* Xử lý trả lời tin nhắn */
  }
  const [replyingMessage, setReplyingMessage] = useState(null);
  const handleReplyMessage = (msg) => {
    setReplyingMessage(msg);
    inputRef.current?.focus();
  };

  const handleDeleteChat = async (chatId) => {
    if (window.confirm("Bạn có chắc muốn ẩn đoạn chat này?")) {
      socket.emit("deleteChat", { conversationId: chatId, userId: user._id });
      if (selectedChat && selectedChat.conversationId === chatId) {
        setSelectedChat(null);
      }
    }
  };
  useEffect(() => {
    socket.on("chatDeleted", ({ conversationId, userId }) => {
      fetchConversations(); // Cập nhật danh sách cuộc trò chuyện
      // Nếu đang ở đoạn chat bị xóa thì điều hướng về trang chat-list
    });

    return () => {
      socket.off("chatDeleted");
    };
  }, [selectedChat]);

  {
    /* Rời nhóm */
  }
  const handleLeaveGroup = async (conversationId) => {
    const res = await axios.get(
      `https://bechatcnm-production.up.railway.app/conversations/get/${conversationId}`
    );
    if (!res) return;
    const group = res.data;
    console.log("Group data:", group);

    // Kiểm tra nếu user là nhóm trưởng
    if (user._id === group.groupLeader) {
      console.log("Bạn là nhóm trưởng, vui lòng chọn người thay thế.");
      // Mở modal chọn nhóm trưởng mới
      setPendingLeaveGroup(group);
      setShowSelectNewLeaderModal(true);
      return;
    }

    // Nếu không phải nhóm trưởng thì xử lý rời nhóm như bình thường
    confirmAndLeaveGroup(conversationId);
  };
  const handleSelectNewLeader = (newLeaderId) => {
    if (!pendingLeaveGroup) return;

    confirmAndLeaveGroup(pendingLeaveGroup._id, newLeaderId);
    setShowSelectNewLeaderModal(false);
    setPendingLeaveGroup(null);
  };

  const confirmAndLeaveGroup = async (conversationId, newLeaderId = null) => {
    if (!window.confirm("Bạn có chắc muốn rời nhóm này?")) return;
    console.log("nhóm trưởng mới:", newLeaderId);
    console.log("conversationId:", conversationId);
    try {
      socket.emit("leaveGroup", {
        conversationId,
        userId: user._id,
        newLeaderId, // chỉ gửi nếu là nhóm trưởng
      });

      setSelectedChat(null);
      setShowMenuId(null);
    } catch (error) {
      console.error("Error leaving group:", error);
    }
  };

  //Thêm thành viên mới vào nhóm
  const handleAddMembersSocket = async () => {
    const alreadyInGroupIds = selectedChat?.members?.map((m) => m._id) || [];

    // Gộp các ID từ checkbox và người được chọn qua phone search (nếu hợp lệ)
    const updatedMembers = [
      ...selectedMembers,
      ...selectedPhoneUsers.filter(
        (id) => id && !alreadyInGroupIds.includes(id)
      ),
    ].filter((id, index, self) => self.indexOf(id) === index); // loại bỏ trùng

    if (!selectedChat?.conversationId || updatedMembers.length === 0) return;

    // Gửi socket yêu cầu thêm thành viên
    socket.emit("addMembersToGroup", {
      conversationId: selectedChat.conversationId,
      newMemberIds: updatedMembers,
      addedBy: user._id,
    });

    try {
      // Lấy thông tin chi tiết các thành viên mới
      const memberDetails = await Promise.all(
        updatedMembers.map(async (id) => {
          try {
            const res = await axios.get(
              `https://bechatcnm-production.up.railway.app/users/get/${id}`
            );
            return res.data;
          } catch (err) {
            console.error("Lỗi khi lấy user:", id);
            return {
              _id: id,
              username: "Không xác định",
              avatar: "/default-avatar.png",
            };
          }
        })
      );

      // Cập nhật selectedChat để hiển thị thành viên mới
      setSelectedChat((prev) => {
        const existingIds = new Set(prev.members.map((m) => m._id));
        const uniqueNewMembers = memberDetails.filter(
          (m) => !existingIds.has(m._id)
        );
        return {
          ...prev,
          members: [...prev.members, ...uniqueNewMembers],
        };
      });

      toast.success("Đã thêm thành viên!");

      // Reset lại modal
      setSelectedMembers([]);
      setShowAddMembersModal(false);
      setPhoneSearchTerm("");
      setSearchResults([]);
      setSelectedPhoneUsers([]);
    } catch (err) {
      console.error("Lỗi khi xử lý thêm thành viên:", err);
    }
  };

  //Rời nhóm

  useEffect(() => {
    if (!socket) return;

    socket.off("groupUpdated");

    socket.on(
      "groupUpdated",
      async ({ conversationId, leftMembers, latestmessage }) => {
        console.log("Người rời nhóm:", leftMembers);

        // Cập nhật danh sách cuộc trò chuyện
        fetchConversations?.();

        // Nếu không phải đoạn chat đang xem thì bỏ qua
        if (!selectedChat || selectedChat.conversationId !== conversationId)
          return;

        try {
          // Gọi API để lấy lại thông tin cuộc trò chuyện mới nhất
          const res = await axios.get(
            `https://bechatcnm-production.up.railway.app/conversations/get/${conversationId}`
          );
          const conversation = res.data;

          // Gọi lại handleSelectChat để đồng bộ lại thông tin
          handleSelectChat({
            conversationId: conversation._id,
            lastMessageId: conversation.lastMessageId?._id,
            lastMessageSenderId: conversation.lastMessageSenderId?._id,
            members: conversation.members,
            groupLeader: conversation.groupLeader,
            groupDeputies: conversation.groupDeputies,
            isGroup: conversation.isGroup,
            image:
              conversation.groupAvatar ||
              "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg",
            name: conversation.name,
            lastMessage: conversation.latestmessage,
            addedMembers: conversation.addMembers,
          });

          // Thêm system message nếu chưa có
          setMessages((prev) => {
            const isDuplicated = prev.some(
              (msg) =>
                msg.text === latestmessage && msg.messageType === "system"
            );
            if (isDuplicated) return prev;

            const sysMessage = {
              _id: `${Date.now()}-${Math.random()}`,
              text: latestmessage,
              messageType: "system",
              createdAt: new Date(),
              sender: null,
            };

            return [...prev, sysMessage];
          });
        } catch (error) {
          console.error("Lỗi khi load lại cuộc trò chuyện:", error);
        }
      }
    );

    return () => {
      socket.off("groupUpdated");
    };
  }, [socket, selectedChat, fetchConversations]);

  // Thêm thành viên vào nhóm
  useEffect(() => {
    if (!socket) return;

    // Hủy đăng ký listener cũ (nếu có)
    socket.off("groupUpdatedAdd");

    socket.on(
      "groupUpdatedAdd",
      async ({ conversationId, newMembers, latestmessage }) => {
        // Cập nhật lại danh sách cuộc trò chuyện
        fetchConversations();

        // Nếu không phải cuộc trò chuyện đang được chọn, bỏ qua
        if (!selectedChat || selectedChat.conversationId !== conversationId)
          return;

        // Lấy thông tin thành viên mới và người thêm
        const enrichedMembers = await Promise.all(
          newMembers.map(async (member) => {
            try {
              const userRes = await axios.get(
                `https://bechatcnm-production.up.railway.app/users/get/${member.userId}`
              );
              const addByRes = await axios.get(
                `https://bechatcnm-production.up.railway.app/users/get/${member.addBy}`
              );
              return {
                ...member,
                username: userRes.data.username || "Không rõ",
                addByName: addByRes.data.username || "Không rõ",
              };
            } catch (err) {
              return {
                ...member,
                username: "Không rõ",
                addByName: "Không rõ",
              };
            }
          })
        );

        // Gọi lại handleSelectChat để cập nhật lại thông tin cuộc trò chuyện
        try {
          const res = await axios.get(
            `https://bechatcnm-production.up.railway.app/conversations/get/${conversationId}`
          );
          const conversation = res.data;

          handleSelectChat({
            conversationId: conversation._id,
            lastMessageId: conversation.lastMessageId?._id,
            lastMessageSenderId: conversation.lastMessageSenderId?._id,
            members: conversation.members,
            groupLeader: conversation.groupLeader,
            groupDeputies: conversation.groupDeputies,
            isGroup: conversation.isGroup,
            image:
              conversation.groupAvatar ||
              "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg",
            name: conversation.name,
            lastMessage: conversation.latestmessage,
            addedMembers: [
              ...(conversation.addMembers || []),
              ...enrichedMembers,
            ],
          });
        } catch (error) {
          console.error("Lỗi khi load lại cuộc trò chuyện:", error);
        }

        // Push 1 tin nhắn system vào messages nếu chưa có
        setMessages((prev) => {
          const isDuplicated = prev.some(
            (msg) => msg.text === latestmessage && msg.messageType === "system"
          );
          if (isDuplicated) return prev;

          const sysMessage = {
            _id: `${Date.now()}-${Math.random()}`,
            text: latestmessage,
            messageType: "system",
            createdAt: new Date(),
            sender: null,
          };

          return [...prev, sysMessage];
        });
      }
    );

    // Dọn dẹp khi component unmount hoặc dependency thay đổi
    return () => {
      socket.off("groupUpdatedAdd");
    };
  }, [socket, selectedChat, fetchConversations]);

  // Xử lý làm mới tìm kiếm sđt để thêm thành viên

  useEffect(() => {
    if (showAddMembersModal) {
      setPhoneSearchTerm("");
      setSearchResults([]);
      setSelectedPhoneUsers([]);
    }
  }, [showAddMembersModal]);

  // Xử lý chọn nhiều ảnh
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files); // Lấy danh sách file
    const imageUrls = files.map((file) => URL.createObjectURL(file)); // Tạo URL cho mỗi ảnh

    // Đảm bảo rằng prevImages là mảng trước khi thêm ảnh mới vào
    setSelectedImage((prevImages) => {
      const validPrevImages = Array.isArray(prevImages) ? prevImages : []; // Kiểm tra prevImages là mảng
      return [...validPrevImages, ...imageUrls]; // Thêm ảnh mới vào prevImages
    });
  };

  // Xử lý chọn video
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("video")) {
      const videoUrl = URL.createObjectURL(file);
      setSelectedVideo(videoUrl);
    }
  };

  useEffect(() => {
    socket.on("newMessage", (message) => {
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.conversationId === message.conversationId
            ? {
                ...chat,
                lastMessage: message.lastMessage,
                unreadCount: chat.unreadCount + 1, // ✅ Tăng số tin chưa đọc ngay
              }
            : chat
        )
      );

      // Nếu tin nhắn thuộc cuộc trò chuyện hiện tại, cập nhật tin nhắn mới ngay
      if (selectedChat?.conversationId === message.conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]); // ✅ Thêm tin nhắn mới vào danh sách
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [selectedChat]);

  //Xử lý upload ảnh

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    e.target.value = ""; // Reset input để chọn lại cùng file

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file); // đổi sang "files" (plural)
    });

    formData.append("conversationId", selectedChat.conversationId);
    formData.append("senderId", user._id);

    console.log("Các file:", files);
    console.log("FormData keys:");
    for (let key of formData.keys()) {
      console.log(key);
    }

    try {
      const response = await fetch(
        "https://bechatcnm-production.up.railway.app/messages/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      console.log("Server response:", data);

      // Gửi từng file URL như một message
      (data.imageUrls || []).forEach((url, index) => {
        sendMessage(url, files[index]?.name || "image");
      });

      (data.fileUrls || []).forEach((url, index) => {
        sendMessage(url, files[index]?.name || "file");
      });

      (data.videoUrls || []).forEach((url, index) => {
        sendMessage(url, files[index]?.name || "video");
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermShare, setSearchTermShare] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [showMediaModal, setShowMediaModal] = useState(false); // Xem lại hình ảnh, video đã gửi

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    if (inputText.trim() === "") {
      // Gửi emoji riêng nếu không có text
      setInputText(emoji);
    } else {
      // Thêm emoji vào input nếu đang gõ text
      setInputText((prev) => prev + emoji);
    }
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showEmojiPicker &&
        !event.target.closest(".emoji-picker") &&
        !event.target.closest(".icon-input")
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showEmojiPicker]);

  const openModal = (url, type, senderInfo) => {
    setMediaUrl(url);
    setMediaType(type);
    setIsOpen(true);
    setMediaSender(senderInfo); // thêm dòng này
    console.log("mediaSender", senderInfo); // Kiểm tra thông tin người gửi
  };

  const closeModal = () => {
    setIsOpen(false);
    setMediaUrl("");
    setMediaType("");
  };
  //Check lời mời kết bạn
  useEffect(() => {
    const checkFriendRequestStatus = () => {
      if (!user || !searchResult || !user._id || !searchResult._id) return;

      socket.emit(
        "check_friend_status",
        { senderId: user._id, receiverId: searchResult._id },
        (response) => {
          if (response?.status === "pending") {
            setIsFriendRequestSent(true);
          } else {
            setIsFriendRequestSent(false);
          }
        }
      );
    };

    checkFriendRequestStatus();
  }, [searchResult?._id, user?._id]);

  // Tìm kiếm user theo sđt
  const handleSearchUser = () => {
    if (!socket || !searchTerm) return;

    // Gửi yêu cầu tìm kiếm qua socket
    socket.emit("search_user", { phone: searchTerm }, (response) => {
      if (response.success) {
        setSearchResult(response.user);

        toast.success("Tìm kiếm thành công!");
      } else {
        setSearchResult(null); // hoặc set về {} nếu cần
        toast.error(response.message);
      }
    });

    // Load lại danh sách bạn bè
    loadFriends();
  };

  //Gửi lời mời kết bạn
  const handleSendFriendRequest = (receiverId) => {
    if (!user?._id || !receiverId) return;

    socket.emit(
      "send_friend_request",
      { senderId: user._id, receiverId },
      (response) => {
        if (response?.success) {
          setIsFriendRequestSent(true);
          setFriendRequests((prev) => [
            ...prev,
            { senderId: user._id, receiverId },
          ]);
          loadFriends(); // Tải lại danh sách bạn bè nếu cần
          toast.success("Đã gửi lời mời kết bạn!");
        } else {
          toast.error(response?.message || "Lỗi khi gửi lời mời!");
        }
      }
    );
  };
  //Thu hồi lời mời kết bạn
  const handleCancelFriendRequest = (friendId) => {
    if (!user?._id || !friendId) return;

    socket.emit(
      "cancel_friend_request",
      { senderId: user._id, receiverId: friendId },
      (response) => {
        if (response?.success) {
          setIsFriendRequestSent(false); // Reset trạng thái gửi lời mời

          setFriendRequests((prev) =>
            prev.filter(
              (req) => req.receiverId !== friendId && req._id !== friendId
            )
          );

          toast.success("Đã thu hồi lời mời kết bạn!");
        } else {
          toast.error(response?.message || "Không thể thu hồi lời mời!");
        }
      }
    );
  };

  // Gọi hàm loadFriendRequests khi component được render
  useEffect(() => {
    loadFriendRequests();
  }, []);

  const loadFriendRequests = () => {
    if (!user || !user._id) return;

    socket.emit("get_friend_requests", { userId: user._id }, (response) => {
      if (response?.success) {
        setFriendRequests(response.friendRequests); // Lưu danh sách vào state
        console.log("Danh sách lời mời kết bạn:", response.friendRequests);
      } else {
        console.error(
          "Lỗi khi tải danh sách lời mời kết bạn:",
          response?.message
        );
      }
    });
  };

  const loadFriends = () => {
    if (!user || !user._id) return;

    socket.emit("get_friends_list", { userId: user._id }, (response) => {
      if (response?.success) {
        setFriends(response.friends);
      } else {
        console.error("Lỗi khi tải danh sách bạn bè:", response?.message);
      }
    });
  };

  // useEffect để load danh sách bạn bè khi component mount hoặc user._id thay đổi
  useEffect(() => {
    if (user._id) {
      loadFriends();
    }
  }, [user._id]);

  // Hủy kết bạn dùng socket
  const handleRemoveFriend = (friendId) => {
    if (!user || !user._id) {
      console.error("Không tìm thấy thông tin người dùng.");
      return;
    }

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn hủy kết bạn?");
    if (!isConfirmed) return;

    socket.emit("unfriend", { userId: user._id, friendId }, (response) => {
      if (response.success) {
        // Cập nhật danh sách bạn bè sau khi hủy
        setFriends((prev) => prev.filter((friend) => friend._id !== friendId));
        setSelectedFriend(null);
        toast.success("Đã hủy kết bạn thành công!");
      } else {
        console.error("Hủy kết bạn thất bại:", response.message);
      }
    });
  };

  const handleClick = (tab) => {
    setSearchResult(null); // Xóa kết quả tìm kiếm
    setSelectedChat(null);
    setSelectedHeader(tab);
    setSelectedTitle("");
    setSelectedTitle2("");

    if (tab === "Lời mời kết bạn") {
      setSelectedChat(null);
      loadFriendRequests();
      setHasNewFriendRequest(false);
    } else if (tab === "Danh sách bạn bè") {
      loadFriends(); // Gọi API danh sách bạn bè
    } else {
      setShowFriendRequests(false);
    }
  };

  const acceptRequest = (request) => {
    console.log("requestacceptRequest", request);

    socket.emit(
      "accept_friend_request",
      { senderId: request.senderId._id, receiverId: request.receiverId },
      (response) => {
        if (!response.success) {
          toast.error(response.message || "Có lỗi xảy ra khi chấp nhận.");
          return;
        }

        // Nếu thành công thì xử lý luôn:
        setFriendRequests((prevRequests) =>
          prevRequests.filter(
            (r) =>
              r.senderId._id !== response.request.senderId._id ||
              r.receiverId !== response.request.receiverId
          )
        );

        loadFriends();
        loadFriendRequests(); // Tải lại danh sách lời mời kết bạn
        setHasNewFriendRequest(false);
        toast.success("Lời mời kết bạn đã được chấp nhận!");
      }
    );
  };

  useEffect(() => {
    if (!socket || !user || !user._id) return;

    const eventName = `friend_request_accepted_${user._id}`;

    const handleAccepted = (request) => {
      console.log("Đã được chấp nhận kết bạn:", request);

      // Gỡ khỏi danh sách lời mời nếu đang ở màn hình đó
      setFriendRequests((prev) =>
        prev.filter(
          (r) =>
            r.senderId._id !== request.senderId._id ||
            r.receiverId !== request.receiverId
        )
      );

      // Reload danh sách bạn bè mới
      loadFriends();

      toast.success(`Kết bạn thành công`);
    };

    socket.on(eventName, handleAccepted);

    // Cleanup khi component unmount hoặc user thay đổi
    return () => {
      socket.off(eventName, handleAccepted);
    };
  }, [socket, user]);

  const rejectRequest = ({ senderId, receiverId, _id: requestId }) => {
    socket.emit(
      "reject_friend_request",
      { senderId, receiverId },
      (response) => {
        if (response.success) {
          // Xoá lời mời bị từ chối khỏi danh sách
          setFriendRequests((prevRequests) =>
            prevRequests.filter((request) => request._id !== requestId)
          );

          // Hiển thị toast thông báo thành công
          setHasNewFriendRequest(false);
          toast.success(response.message || "Đã từ chối lời mời kết bạn.");

          // Tải lại danh sách lời mời (nếu cần)
          loadFriendRequests();
        } else {
          // Thông báo lỗi nếu có
          toast.error(response.message || "Có lỗi xảy ra khi từ chối.");
        }
      }
    );
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("friend_request_rejected", ({ receiverId, senderId }) => {
      // Mình là người gửi → bị từ chối
      if (senderId === user._id) {
        handleSearchUser();
        loadFriendRequests();

        toast.info("Lời mời kết bạn đã bị từ chối.");
        setIsFriendRequestSent(false);
      }

      // Mình là người nhận → cập nhật lại danh sách lời mời
      if (receiverId === user._id) {
        loadFriendRequests(); // để badge hoạt động chính xác
      }
    });

    return () => {
      socket.off("friend_request_rejected");
    };
  }, [socket, user._id]);

  // Toggle menu ba chấm
  const toggleMenuXoa = (friendId) => {
    setSelectedFriend(selectedFriend === friendId ? null : friendId);
  };

  // Xử lý tìm kiếm chat
  useEffect(() => {
    if (chatSearch && chatSearch.conversationId) {
      handleSelectChat(chatSearch);
    }
  }, [chatSearch]);
  //Tạo cuộc hội thoại từ kết quả tìm kiếm
  const createNewChat = async (receiverId, isGroup = false) => {
    setSelectedHeader("");

    try {
      if (isGroup) {
        const res = await fetch(
          `https://bechatcnm-production.up.railway.app/conversations/get/${receiverId}`
        );
        const groupInfo = await res.json();
        console.log("groupInfo", groupInfo);

        if (res.ok) {
          setChatSearch({
            conversationId: groupInfo._id,
            name: groupInfo.name,
            image:
              groupInfo.groupAvatar ||
              "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg",
            members: groupInfo.members,
            isGroup: groupInfo.isGroup,
            lastMessage: groupInfo.latestmessage,
            lastMessageTime: groupInfo.lastMessageTime,
          });
        } else {
          console.error("Không tìm thấy nhóm:", groupInfo.message);
        }

        return;
      }

      // ✅ Trường hợp chat 1-1
      const response = await fetch(
        `https://bechatcnm-production.up.railway.app/conversations/${user._id}/search`
      );
      const conversations = await response.json();

      const existingConversation = conversations.find(
        (conv) =>
          conv.members.length === 2 &&
          conv.members.some((member) => member._id === user._id) &&
          conv.members.some((member) => member._id === receiverId)
      );

      // 💡 Chỉ gọi API user nếu là chat 1-1
      const userReceiver = await fetch(
        `https://bechatcnm-production.up.railway.app/users/get/${receiverId}`
      );
      const data = await userReceiver.json();

      if (existingConversation) {
        setChatSearch({
          conversationId: existingConversation._id,
          name: data.username,
          image: data.avatar,
          active: data.isOnline,
        });
        return;
      }

      // Nếu chưa có, tạo mới cuộc trò chuyện
      const createResponse = await fetch(
        "https://bechatcnm-production.up.railway.app/conversations/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            members: [user._id, receiverId],
            isGroup: false,
          }),
        }
      );

      const newConversation = await createResponse.json();
      if (createResponse.ok) {
        setChatSearch({
          conversationId: newConversation._id,
          name: data.username,
          image: data.avatar,
          active: data.isOnline,
          lastMessage: "",
          lastMessageTime: Date.now(),
        });
      } else {
        console.error("Lỗi khi tạo cuộc trò chuyện:", newConversation.message);
      }
    } catch (error) {
      console.error("Lỗi kết nối server:", error);
    }
  };

  //Hàm xử lý cập nhật thông tin user
  useEffect(() => {
    if (user) {
      setUpdatedUser({
        username: user.username,
        phone: user.phone,
        password: "",
        avatar: user.avatar,
      });
    }
  }, [user]); // Chạy lại mỗi khi user thay đổi (nếu có)

  const handleChange = (e) => {
    setPassword(e.target.value);
    setUpdatedUser({
      ...updatedUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarPreview(URL.createObjectURL(file));
    setUpdatedUser({
      ...updatedUser,
      avatar: file,
    });
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("username", updatedUser.username);
      formData.append("phone", updatedUser.phone);
      formData.append("password", updatedUser.password);
      if (updatedUser.avatar) {
        formData.append("avatar", updatedUser.avatar);
      }

      const response = await axios.put(
        `https://bechatcnm-production.up.railway.app/users/update/${user._id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      localStorage.setItem("user", JSON.stringify(response.data));

      // Sau khi cập nhật thành công, cập nhật lại user với thông tin mới
      setUpdatedUser({
        username: response.data.username,
        phone: response.data.phone,
        password: "",
        avatar: response.data.avatar,
      });
      toast.success("Cập nhật thông tin thành công!");
      setShowModal(false);
    } catch (error) {
      // Bắt lỗi trả về từ server (đã kiểm tra regex, định dạng...)
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error); // Hiển thị nội dung lỗi từ backend
      } else {
        toast.error("Đã xảy ra lỗi khi cập nhật!");
      }
      console.error("Error updating user:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  // Lọc media đã gửi
  const filteredMedia = messages
    .filter(
      (msg) =>
        !msg.isRecalled &&
        (msg.imageUrl || msg.videoUrl || msg.fileUrl) &&
        !msg.deletedFrom?.includes(user._id)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp mới nhất lên trước

  // Trước phần return
  const mediaOnly = filteredMedia.filter(
    (msg) =>
      (msg.imageUrl || msg.videoUrl) &&
      !msg.isRecalled &&
      !msg.deletedFrom?.includes(user._id)
  );

  const fileOnly = filteredMedia.filter(
    (msg) =>
      msg.fileUrl && !msg.isRecalled && !msg.deletedFrom?.includes(user._id)
  );

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    switch (extension) {
      case "pdf":
        return "https://res.cloudinary.com/dapvuniyx/image/upload/v1744105116/pdf_tesvni.png"; // PDF
      case "doc":
      case "docx":
        return "https://res.cloudinary.com/dapvuniyx/image/upload/v1744105116/word_lso4l4.png"; // Word
      case "xls":
      case "xlsx":
        return "https://res.cloudinary.com/dapvuniyx/image/upload/v1744105116/excel_gc6nyu.png"; // Excel
      case "ppt":
      case "pptx":
        return "https://res.cloudinary.com/dapvuniyx/image/upload/v1744105116/pptx_jxtoow.png"; // PowerPoint
      case "zip":
      case "rar":
        return "https://res.cloudinary.com/dapvuniyx/image/upload/v1744105116/rar_tftd1l.png"; // Compressed
      case "txt":
        return "https://res.cloudinary.com/dapvuniyx/image/upload/v1744105116/txt_uake55.png"; // Text
      case "mp4":
      case "mov":
        return "https://res.cloudinary.com/dapvuniyx/image/upload/v1744105234/image_xv2d6s.png"; // Video
      default:
        return "📎"; // Default
    }
  };

  // Mở modal thêm thành viên
  const toggleSelectMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleSearchByPhone = async () => {
    try {
      const response = await fetch(
        `https://bechatcnm-production.up.railway.app/friends/search?phone=${phoneSearchTerm}`
      );
      const res = await response.json();

      // Nếu res là user object (không có .success, .data...)
      if (res && res._id && res._id !== user._id) {
        setSearchResults((prev) => {
          const isExist = prev.some((u) => u._id === res._id);
          return isExist ? prev : [...prev, res];
        });
        toast.success("Tìm thấy người dùng!");
      } else if (res.message) {
        toast.error(res.message);
      } else {
        toast.error("Không tìm thấy người dùng.");
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      toast.error("Đã xảy ra lỗi khi tìm kiếm.");
    }
  };
  // rời nhóm từ ds nhóm
  const toggleMenuOutGroup = (id) => {
    setShowMenuId((prev) => (prev === id ? null : id));
  };

  // Hàm tạo nhóm mới
  const handleCreateGroup = async () => {
    const fullMemberList = [...new Set([...selectedMembers, user._id])]; // đảm bảo không trùng
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm.");
      return;
    }
    if (fullMemberList.length < 3) {
      toast.error("Cần chọn ít nhất 3 thành viên để tạo nhóm.");
      return;
    }

    const formData = new FormData();
    formData.append("name", groupName);
    formData.append("isGroup", true);

    formData.append("members", JSON.stringify(fullMemberList));
    formData.append("groupLeaderId", user._id); // ✅ Gửi ID người tạo làm trưởng nhóm
    if (groupImage) {
      formData.append(
        "groupAvatar",
        groupImage ||
          "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg"
      );
    }

    try {
      setCreatingGroup(true);
      const res = await axios.post(
        "https://bechatcnm-production.up.railway.app/conversations/createwithimage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Tạo nhóm thành công:", res.data);
      toast.success("Tạo nhóm thành công!");

      socket.emit("createGroup", {
        conversationId: res.data._id,
        userId: user._id,
      });

      setChatSearch(res.data);

      // Reset state và đóng modal
      setShowCreateGroupModal(false);

      setGroupName("");
      setGroupImage(null);
      setSelectedMembers([]);
      setSearchResults([]);
      setPhoneSearchTerm("");
      setSelectedPhoneUsers([]);
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setCreatingGroup(false);
    }
  };

  // Hàm tạo nhóm mới với bạn đang chọn
  const handleCreateGroupWith11 = async () => {
    const fullMemberList = [
      ...new Set([
        ...selectedMembers,
        user._id,
        selectedChat?.userIdSelectedchat,
      ]),
    ]; // dùng set để lọc bỏ ID trùng

    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm.");
      return;
    }
    if (fullMemberList.length < 3) {
      toast.error("Cần chọn ít nhất 3 thành viên để tạo nhóm.");
      return;
    }

    const formData = new FormData();
    formData.append("name", groupName);
    formData.append("isGroup", true);

    formData.append("members", JSON.stringify(fullMemberList));
    if (groupImage) {
      formData.append(
        "groupAvatar",
        groupImage ||
          "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg"
      );
    }

    try {
      setCreatingGroup(true);
      const res = await axios.post(
        "https://bechatcnm-production.up.railway.app/conversations/createwithimage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Tạo nhóm thành công:", res.data);
      toast.success("Tạo nhóm thành công!");

      socket.emit("createGroup", {
        conversationId: res.data._id,
        userId: user._id,
      });

      setChatSearch(res.data);

      // Reset state và đóng modal
      setShowGroupModal(false);
      setGroupName("");
      setGroupImage(null);
      setSelectedMembers([]);
      setSearchResults([]);
      setPhoneSearchTerm("");
      setSelectedPhoneUsers([]);
    } catch (error) {
      console.error("Lỗi khi tạo nhóm:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setCreatingGroup(false);
    }
  };
  useEffect(() => {
    socket.on("updatedCreate", ({ conversationId }) => {
      fetchConversations(); // Cập nhật danh sách cuộc trò chuyện
    });

    return () => socket.off("updatedCreate");
  }, []);

  const handleForwardMessage = async () => {
    console.log("selectedChatsToForward:", selectedChatsToForward);

    if (
      !messageToForward ||
      !selectedChatsToForward ||
      selectedChatsToForward.length === 0
    ) {
      toast.error("Không có tin nhắn hoặc người nhận để chuyển tiếp");
      return;
    }

    for (const itemId of selectedChatsToForward) {
      console.log("itemId:", itemId);

      let conversationId = null;

      // 1. Tìm trong danh sách cuộc trò chuyện đã có
      const existingChat = chats.find((c) => c.conversationId === itemId);
      console.log("existingChat", existingChat);
      if (existingChat) {
        conversationId = existingChat.conversationId;
      } else {
        try {
          const createResponse = await fetch(
            "https://bechatcnm-production.up.railway.app/conversations/create",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                members: [user._id, itemId],
                isGroup: false,
              }),
            }
          );
          if (createResponse.ok) {
            const newConversation = await createResponse.json();
            conversationId = newConversation._id;
          }
        } catch (err) {
          console.error("Lỗi tạo chat mới:", err);
          toast.error("Không thể tạo cuộc trò chuyện mới");
          continue;
        }
      }

      // 3. Sau khi có conversationId, gửi tin nhắn
      if (!conversationId) {
        toast.error("Không có conversationId hợp lệ");
        continue;
      }

      const messageData = {
        conversationId,
        senderId: user._id,
        messageType: messageToForward.messageType,
        text: messageToForward.text || "",
        fileName: messageToForward.fileName || null,
        imageUrl: messageToForward.imageUrl || null,
        videoUrl: messageToForward.videoUrl || null,
        fileUrl: messageToForward.fileUrl || null,
      };

      socket.emit("sendMessage", messageData);
    }

    // 4. Reset sau khi gửi xong
    setMessageToForward(null);
    setSelectedChatsToForward([]);
    setShowForwardModal(false);
    toast.success("Đã chuyển tiếp tin nhắn!");
  };

  // Xóa tin nhắn với tôi

  const handleDeleteChatWithMe = async (chatId) => {
    if (window.confirm("Bạn có chắc muốn xóa đoạn chat này?")) {
      socket.emit("deleteChatWithMe", {
        conversationId: chatId,
        userId: user._id,
      });
      if (selectedChat && selectedChat.conversationId === chatId) {
        setSelectedChat(null);
      }
    }
  };
  useEffect(() => {
    socket.on("chatDeleted", ({ conversationId, userId }) => {
      fetchConversations(); // Cập nhật danh sách cuộc trò chuyện
      // Nếu đang ở đoạn chat bị xóa thì điều hướng về trang chat-list
    });

    return () => {
      socket.off("chatDeleted");
    };
  }, [selectedChat]);

  // Bật/tắt menu 3 chấm cho từng thành viên
  const handleToggleOptions = (e, memberId) => {
    e.stopPropagation(); // tránh đóng khi click vào icon
    setOpenOptionsMemberId((prev) => (prev === memberId ? null : memberId));
  };

  const handleAddOrRemoveDeputy = (memberId) => {
    socket.emit("toggleDeputy", {
      conversationId: selectedChat.conversationId,
      targetUserId: memberId,
      byUserId: user._id,
    });

    handleSelectChat(selectedChat);

    toast.success("Đã thực phân quyền thành công");
    setOpenOptionsMemberId(null);
  };

  const handleRemoveFromGroup = (memberId) => {
    // Gửi sự kiện lên server
    socket.emit("kickMember", {
      conversationId: selectedChat.conversationId,
      targetUserId: memberId,
      byUserId: user._id,
    });

    // Lắng nghe phản hồi từ server
    socket.once("kickMemberResponse", (response) => {
      if (response?.error) {
        toast.error(response.error);
      } else if (response?.success) {
        toast.success("Đã xóa thành viên ra khỏi nhóm");
        setOpenOptionsMemberId(null);
      } else {
        toast.error("Lỗi không xác định từ server");
      }
    });
  };

  useEffect(() => {
    const handleGroupUpdated = async ({ conversationId, targetUserId }) => {
      console.log("selectedChat", selectedChat);

      // Kiểm tra xem selectedChat có null hay không trước khi truy cập vào các thuộc tính của nó
      if (selectedChat && conversationId === selectedChat.conversationId) {
        if (targetUserId === user._id) {
          fetchConversations(); // Cập nhật lại danh sách cuộc trò chuyện
          setSelectedChat(null);
          setShowMenuId(null);
          toast.info("Bạn đã bị xóa khỏi nhóm này!");
        } else {
          try {
            // Bước 1: Lấy danh sách conversation
            const res = await axios.get(
              `https://bechatcnm-production.up.railway.app/conversations/get/${conversationId}`
            );
            const conversation = res.data;
            console.log("conversation", conversation);

            handleSelectChat({
              conversationId: conversation._id, // Sử dụng _id thay vì conversationId
              lastMessageId: conversation.lastMessageId?._id, // Giả sử lastMessageId trong conversation là một object
              lastMessageSenderId: conversation.lastMessageSenderId?._id, // Giả sử là object với _id
              members: conversation.members,
              groupLeader: conversation.groupLeader,
              groupDeputies: conversation.groupDeputies,
              isGroup: conversation.isGroup,
              image:
                conversation.groupAvatar ||
                "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg", // Fallback nếu không có avatar
              name: conversation.name,
              lastMessage: conversation.latestmessage, // Nếu latestmessage là lastMessage
              addedMembers: conversation.addMembers,
              lastMessageTime: conversation.lastMessageTime,
              userIdSelectedchat: conversation.userIdSelectedchat,
            });
          } catch (error) {
            console.error("Lỗi khi cập nhật nhóm:", error);
          }
        }
      }
    };

    socket.on("groupUpdatedKick", handleGroupUpdated);
    return () => {
      socket.off("groupUpdatedKick", handleGroupUpdated);
    };
  }, [user._id, selectedChat]);

  // Cập nhật quyền nhóm trưởng hoặc phó nhóm

  useEffect(() => {
    socket.on(
      "groupUpdatedToggleDeputy",
      async ({ conversationId, targetUserId }) => {
        if (conversationId === selectedChat?.conversationId) {
          try {
            const res = await axios.get(
              `https://bechatcnm-production.up.railway.app/conversations/get/${conversationId}`
            );
            const updatedChat = res.data;
            console.log("updatedChat", updatedChat);

            // Cập nhật lại danh sách thành viên và quyền
            const updatedMembers = updatedChat.members.map((member) => {
              // Nếu là targetUserId, cập nhật lại vai trò
              if (member._id === targetUserId) {
                const isDeputy =
                  updatedChat.groupDeputies.includes(targetUserId);
                return {
                  ...member,
                  isDeputy,
                };
              }
              return member;
            });

            // Gọi handleSelectChat thay vì setSelectedChat
            handleSelectChat({
              conversationId: updatedChat._id, // Sử dụng _id thay vì conversationId
              lastMessageId: updatedChat.lastMessageId?._id, // Giả sử lastMessageId là object
              lastMessageSenderId: updatedChat.lastMessageSenderId?._id, // Giả sử là object với _id
              members: updatedMembers, // Cập nhật lại danh sách thành viên
              groupLeader: updatedChat.groupLeader,
              groupDeputies: updatedChat.groupDeputies,
              isGroup: updatedChat.isGroup,
              image:
                updatedChat.groupAvatar ||
                "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg", // Fallback nếu không có avatar
              name: updatedChat.name,
              lastMessage: updatedChat.latestmessage, // Nếu latestmessage là lastMessage
              addedMembers: updatedChat.addMembers, // Danh sách thành viên mới
              lastMessageTime: updatedChat.lastMessageTime,
              userIdSelectedchat: updatedChat.userIdSelectedchat,
            });
          } catch (error) {
            toast.error(
              "Lỗi khi cập nhật thông tin nhóm sau khi thay đổi quyền"
            );
            console.error("Error updating group:", error);
          }
        }
      }
    );

    return () => {
      socket.off("groupUpdatedToggleDeputy");
    };
  }, [selectedChat?.conversationId]);

  //Giải tán nhóm
  const handleGroupDisbandedSocket = async () => {
    console.log("📤 Emit sự kiện giải tán nhóm");

    socket.emit("disbandGroup", {
      conversationId: selectedChat?.conversationId,
      userId: user?._id,
    });
  };

  useEffect(() => {
    const handleGroupDisbanded = async ({
      conversationId,
      message,
      systemMessage,
    }) => {
      console.log("📥 Nhận sự kiện giải tán nhóm:", conversationId);

      if (conversationId === selectedChat?.conversationId) {
        try {
          const res = await axios.get(
            `https://bechatcnm-production.up.railway.app/conversations/get/${conversationId}`
          );
          const updatedChat = res.data;

          handleSelectChat({
            conversationId: updatedChat._id,
            lastMessageId: updatedChat.lastMessageId?._id,
            lastMessageSenderId: updatedChat.lastMessageSenderId?._id,
            members: updatedChat.members,
            groupLeader: updatedChat.groupLeader,
            groupDeputies: updatedChat.groupDeputies,
            isGroup: updatedChat.isGroup,
            image:
              updatedChat.groupAvatar ||
              "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg",
            name: updatedChat.name,
            lastMessage:
              updatedChat.latestmessage || systemMessage?.text || message,
            addedMembers: updatedChat.addMembers || [],
            lastMessageTime: updatedChat.lastMessageTime,
            userIdSelectedchat: updatedChat.userIdSelectedchat,
            isDissolved: true,
            messages: [
              ...(updatedChat.messages || []),
              { ...systemMessage, type: "system" },
            ],
          });

          console.log("✅ Đã cập nhật selectedChat sau khi nhóm bị giải tán");
        } catch (error) {
          toast.error("Lỗi khi cập nhật nhóm sau khi giải tán");
          console.error("❌ Lỗi khi gọi API cập nhật nhóm:", error);
        }
      }
    };

    socket.on("groupDisbanded", handleGroupDisbanded);

    return () => {
      socket.off("groupDisbanded", handleGroupDisbanded);
    };
  }, [selectedChat]); // nhớ đưa selectedChat vào dependency nếu cần theo dõi thay đổi

  useEffect(() => {
    if (!socket) return;

    socket.on("new_friend_request", async (request) => {
      console.log("Nhận lời mời kết bạn:", request);
      // Nếu mình là người nhận
      if (request.receiverId === user._id) {
        await loadFriendRequests(); // load danh sách mới từ server
        setHasNewFriendRequest(true); // bật badge sau khi chắc chắn danh sách đã có dữ liệu

        toast.info("Bạn có lời mời kết bạn mới!");
      }
    });

    return () => {
      socket.off("new_friend_request");
    };
  }, [socket, user._id, sidebarView]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit("join_room", user._id); // client join room trùng userId

    return () => {
      socket.emit("leave_room", user._id); // optional
    };
  }, [socket, user?._id]);

  useEffect(() => {
    socket.on("nguoila", (msg) => {
      // Cập nhật state để hiển thị hệ thống tin nhắn
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("nguoila");
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("friend_request_cancelled", ({ senderId }) => {
      // Cập nhật danh sách lời mời kết bạn
      setFriendRequests((prev) =>
        prev.filter((req) => req.senderId !== senderId)
      );

      loadFriendRequests();

      toast.info("Đối phương đã thu hồi lời mời kết bạn.");
    });

    return () => {
      socket.off("friend_request_cancelled");
    };
  }, [socket]);

  const handleGroupImageChange = (e) => {
    const file = e.target.files[0];
    setGroupImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGroupImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleUpdateGroupInfo = async () => {
    const formData = new FormData();
    formData.append("name", groupName);
    if (groupImageFile) {
      formData.append("groupAvatar", groupImageFile);
    }

    try {
      const res = await axios.put(
        `https://bechatcnm-production.up.railway.app/conversations/group/${selectedChat.conversationId}`,
        formData
      );
      console.log("Cập nhật nhóm thành công:", res.data);

      // Nếu muốn cập nhật lại state nhóm ở client, có thể làm tại đây
      handleSelectChat({
        conversationId: res.data._id,
        lastMessageId: res.data.lastMessageId?._id,
        lastMessageSenderId: res.data.lastMessageSenderId?._id,
        members: res.data.members,
        groupLeader: res.data.groupLeader,
        groupDeputies: res.data.groupDeputies,
        isGroup: res.data.isGroup,
        isDissolved: res.data.isDissolved, // Cập nhật trạng thái giải tán nhóm
        image:
          res.data.groupAvatar ||
          "https://file.hstatic.net/200000503583/file/tao-dang-chup-anh-nhom-lay-loi__5__34b470841bb840e3b2ce25cbe02533ec.jpg",
        name: res.data.name,
        lastMessage: res.data.latestmessage,
        addedMembers: res.data.addMembers,
      });

      toast.success("Cập nhật nhóm thành công!"); // Thông báo thành công
      setShowEditGroupModal(false);
      console.log("Selected chat:", selectedChat);
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Cập nhật thất bại. Vui lòng thử lại.";
      toast.error(errorMsg); // Thông báo lỗi cụ thể
      console.error("Lỗi khi cập nhật nhóm:", err);
    }
  };

  // Khi modal mở, cập nhật groupName từ selectedChat nếu có
  useEffect(() => {
    if (selectedChat && showEditGroupModal) {
      setGroupName(selectedChat.name); // Đảm bảo luôn cập nhật đúng tên nhóm
    }
  }, [selectedChat, showEditGroupModal]);

  return (
    <div className="chat-app">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-item">
          <h2 className="sidebar-title">Chats</h2>
          <FaUsers
            className="bacham-icon"
            onClick={() => setShowCreateGroupModal(true)}
          />
          {showCreateGroupModal && (
            <div
              className="modal-overlay-creategroup"
              onClick={() => {
                setShowCreateGroupModal(false);
                setGroupName("");
                setGroupImage(null);
                setSelectedMembers([]);
                setPhoneSearchTerm("");
                setSearchResults([]);
              }}
            >
              <div
                className="add-members-modal-creategroup"
                onClick={(e) => e.stopPropagation()}
              >
                <FaTimes
                  className="icon-outmedia-addmember"
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setGroupName("");
                    setGroupImage(null);
                    setSelectedMembers([]);
                    setPhoneSearchTerm("");
                    setSearchResults([]);
                  }}
                />
                <h4>Tạo nhóm mới</h4>
                <div className="group-avatar-picker">
                  <label
                    htmlFor="groupImageInput"
                    className="avatar-upload-label"
                  >
                    {groupImage ? (
                      <img
                        src={URL.createObjectURL(groupImage)}
                        alt="preview"
                        className="group-avatar-preview"
                      />
                    ) : (
                      <FaCamera className="camera-icon" />
                    )}
                  </label>
                  <input
                    id="groupImageInput"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        setGroupImage(e.target.files[0]);
                      }
                    }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Tên nhóm"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="add-member-phone-input"
                />

                <div className="add-by-phone-wrapper">
                  <input
                    type="text"
                    placeholder="Nhập số điện thoại để thêm thành viên"
                    value={phoneSearchTerm}
                    onChange={(e) => setPhoneSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (phoneSearchTerm.trim() !== "") {
                          handleSearchByPhone();
                        }
                      }
                    }}
                    className="add-member-phone-input"
                  />
                </div>
                <div className="list-container">
                  <div className="search-result-list">
                    <h5>Kết quả tìm kiếm</h5>
                    {searchResults.map((user) => (
                      <div
                        key={user._id}
                        className={`search-user-info-addgroup ${
                          selectedMembers.includes(user._id)
                            ? "selected-member"
                            : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMembers((prev) => [...prev, user._id]);
                              setSelectedPhoneUsers((prev) => [
                                ...prev,
                                user._id,
                              ]);
                            } else {
                              setSelectedMembers((prev) =>
                                prev.filter((id) => id !== user._id)
                              );
                              setSelectedPhoneUsers((prev) =>
                                prev.filter((id) => id !== user._id)
                              );
                            }
                          }}
                        />
                        <div className="img-user-search-addgroup">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="avatar-addgroup"
                          />
                        </div>
                        <div className="info-user-search-addgroup">
                          <p className="search-username-addgroup">
                            {user.username}
                          </p>

                          {selectedMembers.includes(user._id) && (
                            <p className="already-text">(Đã được chọn)</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="member-list">
                    <h5>Danh sách bạn bè</h5>
                    {friends.map((friend) => {
                      const isSelected = selectedMembers.includes(friend._id);
                      return (
                        <div key={friend._id} className="member-item-wrapper">
                          <div className="member-item-add">
                            <div className="info-item-add">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectMember(friend._id)}
                              />
                              <img
                                src={friend.avatar}
                                alt={friend.username}
                                className="avatar-small-addgroup"
                              />
                            </div>
                            <div className="member-text-wrapper">
                              <span className="username-add">
                                {friend.username}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="modal-actions">
                  <span
                    className="cancel-btn-add"
                    onClick={() => {
                      setShowCreateGroupModal(false);
                      setGroupName("");
                      setGroupImage(null);
                      setSelectedMembers([]);
                      setPhoneSearchTerm("");
                      setSearchResults([]);
                    }}
                  >
                    Hủy
                  </span>

                  <span className="confirm-btn-add" onClick={handleCreateGroup}>
                    {creatingGroup ? "Đang tạo..." : "Tạo nhóm"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (searchTerm.trim() !== "") {
                  handleSearchUser();
                }
              }
            }}
          />

          {/* Sử dụng FaTimes thay vì FaSearch */}
          {searchTerm && (
            <FaTimes
              className="search-icon"
              onClick={(e) => {
                setSearchTerm(""); // Xóa nội dung ô tìm kiếm
                setSearchResult(null); // Xóa kết quả tìm kiếm
              }}
            />
          )}
        </div>

        {searchResult && (
          <>
            <div className="title-search">
              {searchResult.username && <p>Tìm bạn qua số điện thoại</p>}
            </div>

            <div className="search-user-info">
              <div className="img-user-search">
                <img
                  src={searchResult.avatar}
                  alt={searchResult.username}
                  className="avatar"
                  onClick={() => {
                    if (searchResult._id !== user._id) {
                      createNewChat(searchResult._id);
                    }
                  }}
                />
              </div>
              <div className="info-user-search">
                <p className="search-username">{searchResult.username}</p>
                <p className="search-phone">
                  Số điện thoại: <span>{searchResult.phone}</span>
                </p>

                {searchResult._id !== user._id &&
                  (friends.some((friend) => friend._id === searchResult._id) ? (
                    <span className="friend-label">Bạn bè</span>
                  ) : isFriendRequestSent ? (
                    <>
                      <span className="added-request">
                        Đã gửi lời mời kết bạn
                      </span>
                      <button
                        onClick={() =>
                          handleCancelFriendRequest(searchResult._id)
                        }
                        className="cancel-button"
                      >
                        Thu hồi
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleSendFriendRequest(searchResult._id)}
                    >
                      Kết bạn
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}

        {sidebarView === "chat-list" && (
          <div className="chat-list">
            {chats
              .filter((chat) =>
                chat.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
              )
              .map((chat, index) => (
                <div
                  key={index}
                  className="chat-left"
                  onClick={() => handleSelectChat(chat)}
                  onMouseEnter={() => setHoveredChatId(chat._id)}
                >
                  <div className="avatar-container">
                    <img src={chat.image} alt={chat.name} className="avatar" />
                    {chat.active && <span className="active-dot"></span>}
                  </div>

                  <div className="chat-container">
                    <p className="chat-name">{chat.name}</p>
                    <p
                      className={`chat-message ${
                        chat.unreadCount > 0 ? "unread-message" : ""
                      }`}
                    >
                      {chat.lastMessageSenderId?.toString() ===
                      user._id.toString()
                        ? `Bạn: ${
                            chat.lastMessage.length > 20
                              ? chat.lastMessage.slice(0, 20) + "..."
                              : chat.lastMessage
                          }`
                        : chat.lastMessage.length > 20
                        ? chat.lastMessage.slice(0, 20) + "..."
                        : chat.lastMessage}

                      {chat.unreadCount > 0 && (
                        <span className="unread-badge">
                          • {chat.unreadCount}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="chat-timestamp">
                    <p
                      className={`chat-timestamp-item ${
                        chat.unreadCount > 0 ? "unread-timestamp" : ""
                      }`}
                    >
                      {formatTimeMessage(chat.lastMessageTime)}
                    </p>
                  </div>
                  {
                    <div
                      className="chat-more-options"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuChatId(chat.conversationId); // Mở menu popup cho đoạn chat này
                        setMenuPosition({ x: e.clientX, y: e.clientY });
                      }}
                    >
                      <span>⋮</span>
                    </div>
                  }

                  {menuChatId === chat.conversationId && (
                    <div
                      className="chat-popup-menu"
                      style={{ top: menuPosition.y, left: menuPosition.x }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          color: "red",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleDeleteChat(chat.conversationId)}
                      >
                        <FiEyeOff size={18} color="red" />
                        Ẩn đoạn chat
                      </div>
                      <div
                        style={{
                          color: "red",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleDeleteChatWithMe(chat.conversationId)
                        }
                      >
                        <FiTrash2 size={18} color="red" />
                        Xóa đoạn chat
                      </div>
                      {chat.isGroup && (
                        <div
                          style={{
                            color: "red",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleLeaveGroup(chat.conversationId)}
                        >
                          <FiLogOut size={18} color="red" />
                          Rời khỏi nhóm
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
        {sidebarView === "contacts" && (
          <div className="contacts-list">
            <div
              className="contacts-header"
              onClick={() => handleClick("Danh sách bạn bè")}
            >
              <FaUser className="icon-contacts" />
              <span>Danh sách bạn bè</span>
            </div>

            <div
              className="contacts-header"
              onClick={() => handleClick("Danh sách nhóm")}
            >
              <FaUsers className="icon-contacts" />
              <span>Danh sách nhóm</span>
            </div>

            <div
              className="contacts-header"
              onClick={() => handleClick("Lời mời kết bạn")}
            >
              <FaUserPlus className="icon-contacts" />
              <span>Lời mời kết bạn</span>

              {hasNewFriendRequest && (
                <span className="badge">{friendRequests.length}</span>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="icon-container-left">
        {/* Avatar nhấn vào để mở modal */}
        {updatedUser && (
          <div className="icon-item" onClick={() => setShowModal(true)}>
            <img
              src={`${updatedUser.avatar}?t=${Date.now()}`}
              alt="Avatar"
              className="chat-avatar"
            />
          </div>
        )}
        {/* Modal hiển thị thông tin user */}
        {showModal && user && (
          <div
            className="modal-overlayuser"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                // Kiểm tra xem có click vào overlay (ngoài modal)
                setShowModal(false); // Đóng modal
              }
            }}
          >
            <div className="modal-contentuser">
              <span
                className="close-btnuser"
                onClick={() => setShowModal(false)}
              >
                &times;
              </span>
              <h5>Thông tin tài khoản</h5>
              <img
                src="https://res.cloudinary.com/dapvuniyx/image/upload/v1743264121/chat_app_uploads/pecr79frcqusf69mdzhm.png"
                alt=""
                className="profile-avataruser-nen"
              />
              <div className="profile-use">
                <img
                  src={avatarPreview || user.avatar}
                  alt="Avatar"
                  className="profile-avataruser"
                />
                {/* Thay input bằng icon */}
                <label htmlFor="avatar-upload" className="avatar-icon-label">
                  <FaCamera size={25} color="black" />{" "}
                  {/* Thêm icon từ react-icons */}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-upload"
                  style={{ display: "none" }} // Ẩn input mặc định đi
                />
                <p>
                  <input
                    type="text"
                    name="username"
                    value={updatedUser.username}
                    onChange={handleChange}
                    placeholder="Nhập tên mới"
                    className="username-input"
                  />
                </p>
              </div>

              <div className="thongtin-canhan">
                <h5>Thông tin cá nhân</h5>
                <p>
                  <strong>Email:</strong>
                  <input
                    type="text"
                    name="email"
                    value={user.email}
                    // onChange={handleChange}
                    readOnly // Chỉ xem, không chỉnh sửa được
                    placeholder="Nhập email mới"
                  />
                </p>
                <p>
                  <strong>Số điện thoại:</strong>
                  <input
                    type="text"
                    name="phone"
                    value={updatedUser.phone}
                    onChange={handleChange}
                    placeholder="Nhập số điện thoại mới"
                  />
                </p>
                <p>
                  <strong>Mật khẩu:</strong>
                  <input
                    type={showPassword ? "text" : "password"} // Đổi loại input giữa text và password
                    name="password"
                    value={updatedUser.password}
                    onChange={handleChange}
                    placeholder="Nhập mật khẩu mới"
                    style={{ paddingRight: "30px" }} // Dành không gian cho icon
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    style={{
                      position: "absolute",
                      right: "30px",
                      top: "82.5%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </p>
              </div>

              <button onClick={handleUpdate} className="update-btn">
                Cập nhật
              </button>
            </div>
          </div>
        )}
        <div className="icon-item" onClick={showChatlists}>
          <FaComments className="icon chat-icon" title="Chat" />
          <span className="chat-icon-text">Chats</span>

          {hasNewFriendRequest && (
            <span className="badge-1">{friendRequests.length}</span>
          )}
        </div>
        <div className="icon-item" onClick={showContacts}>
          <FaAddressBook className="icon group-icon" title="Contacts" />
          <span className="chat-icon-text">Contacts</span>
        </div>

        <div className="icon-item" onClick={toggleMenu} ref={menuRef}>
          <FaCog className="icon user-icon" title="Settings" />
          <span className="chat-icon-text">Setting</span>

          {showMenu && (
            <div className="settings-menu">
              <button onClick={() => handleLogout()} className="logout-btn">
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedHeader === "Lời mời kết bạn" ? (
        <div className="friend-requests">
          <h2>Lời mời kết bạn</h2>
          {friendRequests.length > 0 ? (
            friendRequests
              .filter((request) => request.receiverId._id === user._id) // Lọc chỉ những yêu cầu mà bạn là người nhận
              .map((request) => (
                <div key={request._id} className="friend-request-item">
                  <div className="friend-info">
                    <img
                      src={request.senderId.avatar}
                      alt="avatar"
                      className="friend-avatar"
                    />
                    <p className="friend-name">{request.senderId.username}</p>
                  </div>
                  <div className="friend-actions">
                    <button onClick={() => rejectRequest(request)}>
                      Từ chối
                    </button>
                    <button onClick={() => acceptRequest(request)}>
                      Chấp nhận
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p className="not-requestfriend">Không có lời mời kết bạn nào.</p>
          )}
        </div>
      ) : selectedHeader === "Danh sách nhóm" ? (
        <div className="group-list">
          <h2>Danh sách nhóm</h2>

          {console.log("✅ Tất cả chats:", chats)}

          {chats.filter((chat) => chat.isGroup).length > 0 ? (
            chats
              .filter((chat) => chat.isGroup)
              .map((group) => {
                console.log("🎯 Nhóm sẽ hiển thị:", group);
                console.log("👥 Thành viên trong nhóm:", group.members);

                return (
                  <div key={group.conversationId} className="group-item">
                    <div
                      className="group-info"
                      onMouseLeave={() => setShowMenuId(null)} // ẩn menu khi ra ngoài
                    >
                      <img
                        src={group.image || "/default-group.png"}
                        alt="group-avatar"
                        className="group-avatar"
                        onClick={() =>
                          createNewChat(group.conversationId, true)
                        }
                      />
                      <div className="group-details">
                        <p className="group-name">
                          {group.name || "Nhóm không tên"}
                        </p>
                      </div>

                      {/* Icon 3 chấm dọc */}
                      <div
                        className="group-menu-icon"
                        onClick={() => toggleMenuOutGroup(group.conversationId)}
                      >
                        <FiMoreVertical size={18} />
                      </div>

                      {/* Menu rời nhóm */}
                      {showMenuId === group.conversationId && (
                        <div className="group-menu-popup">
                          <span
                            onClick={() =>
                              handleLeaveGroup(group.conversationId)
                            }
                          >
                            <FiLogOut size={14} color="red" /> Rời nhóm
                          </span>
                        </div>
                      )}
                    </div>

                    <hr />
                  </div>
                );
              })
          ) : (
            <>
              {console.log("❌ Không có nhóm nào có isGroup === true")}
              <p className="not-group">Không có nhóm nào.</p>
            </>
          )}
        </div>
      ) : selectedHeader === "Danh sách bạn bè" ? ( // Thêm điều kiện này
        <div className="friends-list">
          <h2>Danh sách bạn bè</h2>
          {friends.length > 0 ? (
            friends.map(
              (friend) => (
                console.log("friend nhận được", friend),
                (
                  <div key={friend._id} className="friend-item" ref={friendRef}>
                    <div className="friend-info">
                      <img
                        src={friend.avatar}
                        alt="avatar"
                        className="friend-avatar"
                        onClick={() => {
                          if (friend._id) {
                            createNewChat(friend._id);
                          } else {
                            console.error("friend._id bị undefined:", friend);
                          }
                        }}
                      />
                      <p className="friend-name">{friend.username}</p>
                      <FaEllipsisV
                        className="bacham-banbe"
                        onClick={() => toggleMenuXoa(friend._id)}
                      />
                    </div>
                    {selectedFriend === friend._id && (
                      <div
                        className="dropdown-menu"
                        ref={(el) => (friendMenuRef.current[friend._id] = el)}
                      >
                        <button onClick={() => handleRemoveFriend(friend._id)}>
                          Xóa bạn
                        </button>
                      </div>
                    )}

                    <br />
                    <hr />
                  </div>
                )
              )
            )
          ) : (
            <p className="not-friend">Bạn chưa có bạn bè nào.</p>
          )}
        </div>
      ) : selectedChat ? (
        <div className="chat-window">
          {/* Header */}

          <div className="chat-header">
            <div className="avatar-container-main">
              <img src={selectedChat.image} alt="img" className="avatar" />
              <div className="avatar-container-main-item">
                <p className="chat-title-main">{selectedChat.name}</p>
                <p className="active-statu-main">
                  {selectedChat.isGroup
                    ? `${
                        selectedChat.members.some((m) => m._id === user._id)
                          ? selectedChat.members.length
                          : selectedChat.members.length + 1
                      } thành viên`
                    : selectedChat.active
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </div>
            <div className="chat-icons">
              <FaVideo className="icon" />
              <FaPhone className="icon" />
              <FaStarHalfAlt className="icon" />
              <FaExclamationCircle
                className="icon"
                onClick={() => setShowMediaModal((prev) => !prev)}
              />

              {showMediaModal && (
                <div
                  className="media-overlay"
                  onClick={() => setShowMediaModal(false)}
                >
                  <div
                    className="media-modal"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="media-header">
                      <FaTimes
                        className="icon-outmedia"
                        onClick={() => setShowMediaModal(false)}
                      />
                      <h4>
                        {selectedChat.isGroup
                          ? "Thông tin nhóm"
                          : "Thông tin hội thoại"}
                      </h4>
                      <hr />
                    </div>
                    <div className="user-conservation">
                      <div className="container-conservation">
                        <div
                          className="avatar-conservation"
                          onClick={() => {
                            if (selectedChat.isGroup) {
                              setShowEditGroupModal(true);
                            }
                          }}
                          style={{
                            cursor: selectedChat.isGroup
                              ? "pointer"
                              : "default",
                          }}
                        >
                          <img
                            src={selectedChat.image}
                            alt="img"
                            className="avatar-conservation-img"
                          />
                        </div>
                        <div className="info-conservation">
                          <p className="name-conservation">
                            {selectedChat.name}
                          </p>
                        </div>
                        {showEditGroupModal && !selectedChat?.isDissolved && (
                          <div
                            className="modal-overlayuser"
                            onClick={(e) => {
                              if (e.target === e.currentTarget) {
                                setShowEditGroupModal(false);
                              }
                            }}
                          >
                            <div className="modal-contentuser-group">
                              <span
                                className="close-btnuser"
                                onClick={() => setShowEditGroupModal(false)}
                              >
                                &times;
                              </span>
                              <h3>Chỉnh sửa nhóm</h3>

                              <div className="profile-use-group">
                                <img
                                  src={groupImagePreview || selectedChat.image}
                                  alt="Avatar nhóm"
                                  className="profile-avataruser"
                                />

                                {/* Icon đổi ảnh */}
                                <label
                                  htmlFor="group-avatar-upload"
                                  className="avatar-icon-label"
                                >
                                  <FaCamera size={25} color="black" />
                                </label>
                                <input
                                  id="group-avatar-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleGroupImageChange}
                                  className="avatar-upload"
                                  style={{ display: "none" }}
                                />

                                <p>
                                  <input
                                    type="text"
                                    name="groupName"
                                    value={groupName}
                                    onChange={(e) =>
                                      setGroupName(e.target.value)
                                    }
                                    placeholder="Nhập tên nhóm"
                                    className="username-input"
                                  />
                                </p>
                              </div>

                              <button
                                onClick={handleUpdateGroupInfo}
                                className="update-btn"
                              >
                                Cập nhật
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Thêm thành viên vô nhóm  */}
                        {showAddMembersModal && !selectedChat?.isDissolved && (
                          <div className="add-members-modal">
                            <FaTimes
                              className="icon-outmedia-addmember"
                              onClick={() => {
                                setShowAddMembersModal(false);
                                setPhoneSearchTerm(""); // Reset input khi đóng modal
                                setSearchResults([]); // (Tùy chọn) Xóa kết quả tìm kiếm
                                setSelectedPhoneUsers([]); // (Tùy chọn) Bỏ checkbox nếu cần
                              }}
                            />
                            <h4>Chọn thành viên để thêm</h4>
                            <div className="member-list">
                              <div className="add-by-phone-wrapper">
                                <input
                                  type="text"
                                  placeholder="Nhập số điện thoại để thêm thành viên"
                                  value={phoneSearchTerm}
                                  onChange={(e) =>
                                    setPhoneSearchTerm(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      if (phoneSearchTerm.trim() !== "") {
                                        handleSearchByPhone();
                                      }
                                    }
                                  }}
                                  className="add-member-phone-input"
                                />
                              </div>

                              <h5>Kết quả tìm kiếm</h5>
                              {searchResults
                                .filter((user) => {
                                  const isInputEmpty =
                                    phoneSearchTerm.trim() === ""; // Giả sử bạn có state searchKeyword
                                  const isAlreadyInGroup =
                                    selectedChat?.members?.some(
                                      (m) => m._id === user._id
                                    );
                                  return isInputEmpty
                                    ? !isAlreadyInGroup
                                    : true; // Chỉ lọc khi input trống
                                })
                                .map((user) => {
                                  const isAlreadyInGroup =
                                    selectedChat?.members?.some(
                                      (m) => m._id === user._id
                                    );
                                  return (
                                    <div
                                      key={user._id}
                                      className={`search-user-info-addgroup ${
                                        isAlreadyInGroup
                                          ? "disabled-member"
                                          : ""
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        disabled={isAlreadyInGroup}
                                        checked={
                                          isAlreadyInGroup ||
                                          selectedPhoneUsers.includes(user._id)
                                        }
                                        onChange={(e) => {
                                          setSelectedPhoneUsers((prev) => {
                                            const safePrev = Array.isArray(prev)
                                              ? prev
                                              : [];
                                            return e.target.checked
                                              ? [...safePrev, user._id]
                                              : safePrev.filter(
                                                  (id) => id !== user._id
                                                );
                                          });
                                        }}
                                      />
                                      <div className="img-user-search-addgroup">
                                        <img
                                          src={user.avatar}
                                          alt={user.username}
                                          className="avatar-addgroup"
                                        />
                                      </div>
                                      <div className="info-user-search-addgroup">
                                        <p className="search-username-addgroup">
                                          {user.username}
                                        </p>
                                        {isAlreadyInGroup && (
                                          <p className="already-text">
                                            (Đã tham gia)
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                              <h5>Danh sách bạn bè</h5>
                              {friends.map((friend) => {
                                const isAlreadyInGroup =
                                  selectedChat?.members?.some(
                                    (member) => member._id === friend._id
                                  );
                                const isSelected =
                                  isAlreadyInGroup ||
                                  selectedMembers.includes(friend._id);

                                return (
                                  <div
                                    key={friend._id}
                                    className={`member-item-wrapper ${
                                      isAlreadyInGroup ? "disabled-member" : ""
                                    }`}
                                  >
                                    <div className="member-item-add">
                                      <div className="info-item-add">
                                        <input
                                          type="checkbox"
                                          disabled={isAlreadyInGroup}
                                          checked={isSelected}
                                          onChange={() =>
                                            toggleSelectMember(friend._id)
                                          }
                                        />
                                        <img
                                          src={friend.avatar}
                                          alt={friend.username}
                                          className="avatar-small-addgroup"
                                        />
                                      </div>
                                      <div className="member-text-wrapper">
                                        <span className="username-add">
                                          {friend.username}
                                        </span>
                                        {isAlreadyInGroup && (
                                          <span className="already-text">
                                            (Đã tham gia)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            <div className="modal-actions">
                              <span
                                className="cancel-btn-add"
                                onClick={() => setShowAddMembersModal(false)}
                              >
                                Đóng
                              </span>
                              <span
                                className="confirm-btn-add"
                                onClick={() =>
                                  handleAddMembersSocket(selectedMembers)
                                }
                              >
                                Xác nhận thêm
                              </span>
                            </div>
                          </div>
                        )}

                        <div
                          className="add-group-conservation"
                          onClick={() => {
                            if (selectedChat.isGroup) {
                              setShowAddMembersModal(true);
                            } else {
                              setShowGroupModal(true);
                            }
                          }}
                        >
                          <FaUsers className="icon-addgroups" />
                          <h4>
                            {selectedChat.isGroup
                              ? "Thêm thành viên"
                              : "Tạo nhóm trò chuyện"}
                          </h4>
                        </div>
                      </div>

                      {selectedChat?.isGroup && !selectedChat?.isDissolved && (
                        <div className="container-conservation-member">
                          <div
                            className="member-count"
                            onClick={() => setShowMembersList(!showMembersList)}
                            style={{ cursor: "pointer" }}
                          >
                            <FaUsers className="icon-member" />
                            <strong>
                              Thành viên:{" "}
                              {selectedChat.members?.some(
                                (m) => m._id === user._id || m === user._id
                              )
                                ? selectedChat.members.length
                                : selectedChat.members.length + 1}
                              {/* Wrap icon để gán ref */}
                              <span
                                onClick={() =>
                                  setShowMembersList(!showMembersList)
                                }
                                // ref={membersListRef}
                                className="span-thanhvien"
                              >
                                {showMembersList ? (
                                  <FiChevronDown />
                                ) : (
                                  <FiChevronRight />
                                )}
                              </span>
                            </strong>
                          </div>

                          {showMembersList && (
                            <div className="members-list">
                              {(() => {
                                const members = selectedChat.members || [];

                                const isCurrentUserIncluded = members.some(
                                  (m) => m._id === user._id || m === user._id
                                );

                                const membersToDisplay = isCurrentUserIncluded
                                  ? members
                                  : [...members, user];
                                return membersToDisplay.map((member, index) => {
                                  const isFriend = friends.some(
                                    (f) => f._id === member._id
                                  );
                                  const isRequestSent = friendRequests.some(
                                    (req) =>
                                      req.receiverId === member._id ||
                                      req._id === member._id
                                  );

                                  const isCurrentUser = member._id === user._id;
                                  const isLeader =
                                    selectedChat.groupLeader === member._id ||
                                    (selectedChat.groupLeader?._id &&
                                      selectedChat.groupLeader._id ===
                                        member._id);

                                  const isDeputy =
                                    selectedChat.groupDeputies?.some(
                                      (deputy) =>
                                        deputy === member._id ||
                                        deputy?._id === member._id
                                    );

                                  const isCurrentUserLeader =
                                    selectedChat.groupLeader === user._id ||
                                    (selectedChat.groupLeader?._id &&
                                      selectedChat.groupLeader._id ===
                                        user._id);

                                  const isCurrentUserDeputy =
                                    selectedChat.groupDeputies?.some(
                                      (deputy) =>
                                        deputy === user._id ||
                                        deputy?._id === user._id
                                    );

                                  return (
                                    <div
                                      key={index}
                                      className="member-item"
                                      style={{ position: "relative" }}
                                      onMouseLeave={() =>
                                        setOpenOptionsMemberId(null)
                                      }
                                    >
                                      <img
                                        src={
                                          member.avatar || "/default-avatar.png"
                                        }
                                        alt="avatar"
                                        className="member-avatar"
                                        onClick={() => {
                                          if (!isCurrentUser)
                                            createNewChat(member._id);
                                        }}
                                        style={{
                                          cursor: isCurrentUser
                                            ? "default"
                                            : "pointer",
                                        }}
                                      />

                                      <span
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-start",
                                        }}
                                      >
                                        <span>
                                          {isCurrentUser
                                            ? "Bạn"
                                            : member.username ||
                                              "Không xác định"}
                                        </span>

                                        {isLeader && (
                                          <span style={{ color: "#FFD700" }}>
                                            🔑 <small>Trưởng nhóm</small>
                                          </span>
                                        )}

                                        {!isLeader && isDeputy && (
                                          <span style={{ color: "#00bcd4" }}>
                                            👔 <small>Phó nhóm</small>
                                          </span>
                                        )}
                                      </span>

                                      {/* Nút kết bạn */}
                                      {!isCurrentUser &&
                                        !isFriend &&
                                        (isRequestSent ? (
                                          <span
                                            onClick={() =>
                                              handleCancelFriendRequest(
                                                member._id
                                              )
                                            }
                                            className="cancel-btn"
                                          >
                                            Thu hồi
                                          </span>
                                        ) : (
                                          <span
                                            onClick={() =>
                                              handleSendFriendRequest(
                                                member._id
                                              )
                                            }
                                            className="add-friend"
                                          >
                                            Kết bạn
                                          </span>
                                        ))}

                                      {/* Icon 3 chấm - Chỉ hiện nếu là trưởng nhóm và member khác chính mình */}
                                      {(isCurrentUserLeader ||
                                        isCurrentUserDeputy) &&
                                        !isCurrentUser &&
                                        !isLeader && (
                                          <div
                                            className="options-icon"
                                            onClick={(e) =>
                                              handleToggleOptions(e, member._id)
                                            }
                                            style={{
                                              position: "absolute",
                                              top: 3,
                                              right: 20,
                                              cursor: "pointer",
                                            }}
                                          >
                                            ⋮
                                          </div>
                                        )}

                                      {/* Menu tuỳ chọn */}
                                      {openOptionsMemberId === member._id &&
                                        (isCurrentUserLeader ||
                                          isCurrentUserDeputy) && (
                                          <div
                                            className="options-menu"
                                            style={{
                                              position: "absolute",
                                              top: 10,
                                              right: 30,
                                              background: "#fff",
                                              border: "2px solid black",
                                              borderRadius: "8px",
                                              padding: "6px 12px",
                                              zIndex: 10,
                                              boxShadow:
                                                "0 2px 10px rgba(0, 0, 0, 0.1)", // Đổ bóng nhẹ
                                              minWidth: "150px", // Đảm bảo menu đủ rộng để dễ nhìn
                                              cursor: "pointer", // Thêm con trỏ khi hover
                                              transition:
                                                "all 0.3s ease-in-out", // Thêm hiệu ứng khi mở/đóng
                                              backgroundColor: "#e0ffec",
                                            }}
                                          >
                                            {(isCurrentUserLeader ||
                                              isCurrentUserDeputy) &&
                                              !isLeader && (
                                                <>
                                                  {/* Chỉ trưởng nhóm được cấp hoặc thu hồi quyền phó nhóm */}
                                                  {isCurrentUserLeader && (
                                                    <div
                                                      className="option-item"
                                                      onClick={() =>
                                                        handleAddOrRemoveDeputy(
                                                          member._id
                                                        )
                                                      }
                                                      style={{
                                                        padding: "4px 0",
                                                        cursor: "pointer",
                                                        fontSize: "13px",
                                                        fontWeight: "bold",
                                                      }}
                                                    >
                                                      {isDeputy
                                                        ? "Thu hồi quyền phó nhóm"
                                                        : "Cấp quyền phó nhóm"}
                                                    </div>
                                                  )}

                                                  {/* Trưởng nhóm hoặc phó nhóm đều có thể xóa thành viên (trừ trưởng nhóm) */}
                                                  <div
                                                    className="option-item"
                                                    onClick={() =>
                                                      handleRemoveFromGroup(
                                                        member._id
                                                      )
                                                    }
                                                    style={{
                                                      padding: "4px 0",
                                                      color: "red",
                                                      cursor: "pointer",
                                                      fontSize: "13px",
                                                      fontWeight: "bold",
                                                    }}
                                                  >
                                                    Xóa khỏi nhóm
                                                  </div>
                                                </>
                                              )}
                                          </div>
                                        )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                      {showGroupModal && (
                        <div
                          className="modal-overlay-creategroup"
                          onClick={() => {
                            setShowGroupModal(false);
                            setGroupName("");
                            setGroupImage(null);
                            setSelectedMembers([]);
                            setPhoneSearchTerm("");
                            setSearchResults([]);
                          }}
                        >
                          <div
                            className="add-members-modal-creategroup"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaTimes
                              className="icon-outmedia-addmember"
                              onClick={() => {
                                setShowGroupModal(false);
                                setGroupName("");
                                setGroupImage(null);
                                setSelectedMembers([]);
                                setPhoneSearchTerm("");
                                setSearchResults([]);
                              }}
                            />
                            <h4>Tạo nhóm nhanh</h4>

                            {/* Ảnh nhóm */}
                            <div className="group-avatar-picker">
                              <label
                                htmlFor="quickGroupImageInput"
                                className="avatar-upload-label"
                              >
                                {groupImage ? (
                                  <img
                                    src={URL.createObjectURL(groupImage)}
                                    alt="preview"
                                    className="group-avatar-preview"
                                  />
                                ) : (
                                  <FaCamera className="camera-icon" />
                                )}
                              </label>
                              <input
                                id="quickGroupImageInput"
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    setGroupImage(e.target.files[0]);
                                  }
                                }}
                              />
                            </div>

                            {/* Tên nhóm */}
                            <input
                              type="text"
                              placeholder="Tên nhóm"
                              value={selectedChat.name}
                              onChange={(e) => setGroupName(e.target.value)}
                              className="add-member-phone-input"
                            />

                            {/* Tìm theo số điện thoại */}
                            <div className="add-by-phone-wrapper">
                              <input
                                type="text"
                                placeholder="Nhập số điện thoại để thêm thành viên"
                                value={phoneSearchTerm}
                                onChange={(e) =>
                                  setPhoneSearchTerm(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (phoneSearchTerm.trim() !== "") {
                                      handleSearchByPhone();
                                    }
                                  }
                                }}
                                className="add-member-phone-input"
                              />
                            </div>

                            {/* Kết quả tìm kiếm */}
                            <div className="list-container">
                              <div className="search-result-list">
                                <h5>Kết quả tìm kiếm</h5>
                                {searchResults.map((user) => {
                                  const isDefaultSelected =
                                    user._id ===
                                    selectedChat?.userIdSelectedchat;
                                  const isChecked =
                                    selectedMembers.includes(user._id) ||
                                    isDefaultSelected;

                                  return (
                                    <div
                                      key={user._id}
                                      className={`search-user-info-addgroup ${
                                        isChecked ? "selected-member" : ""
                                      } ${
                                        isDefaultSelected
                                          ? "disabled-member"
                                          : ""
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={isDefaultSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedMembers((prev) => [
                                              ...prev,
                                              user._id,
                                            ]);
                                            setSelectedPhoneUsers((prev) => [
                                              ...prev,
                                              user._id,
                                            ]);
                                          } else {
                                            setSelectedMembers((prev) =>
                                              prev.filter(
                                                (id) => id !== user._id
                                              )
                                            );
                                            setSelectedPhoneUsers((prev) =>
                                              prev.filter(
                                                (id) => id !== user._id
                                              )
                                            );
                                          }
                                        }}
                                      />
                                      <div className="img-user-search-addgroup">
                                        <img
                                          src={user.avatar}
                                          alt={user.username}
                                          className="avatar-addgroup"
                                        />
                                      </div>
                                      <div className="info-user-search-addgroup">
                                        <p className="search-username-addgroup">
                                          {user.username}
                                        </p>
                                        {isChecked && (
                                          <p className="already-text">
                                            (Đã được chọn)
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Danh sách bạn bè */}
                              <div className="member-list">
                                <h5>Danh sách bạn bè</h5>
                                {friends.map((friend) => {
                                  const isSelected = selectedMembers.includes(
                                    friend._id
                                  );
                                  const isDefaultSelected =
                                    friend._id ===
                                    selectedChat?.userIdSelectedchat;
                                  console.log(
                                    "selectedChat.userIdSelectedchat?._id",
                                    selectedChat?.userIdSelectedchat,
                                    "user?._id",
                                    user?._id
                                  );
                                  console.log(
                                    "friend._id",
                                    friend._id,
                                    "isDefaultSelected",
                                    isDefaultSelected
                                  );
                                  return (
                                    <div
                                      key={friend._id}
                                      className="member-item-wrapper"
                                    >
                                      <div className="member-item-add">
                                        <div className="info-item-add">
                                          <input
                                            type="checkbox"
                                            checked={
                                              isSelected || isDefaultSelected
                                            }
                                            disabled={isDefaultSelected}
                                            onChange={() =>
                                              toggleSelectMember(friend._id)
                                            }
                                          />
                                          <img
                                            src={friend.avatar}
                                            alt={friend.username}
                                            className="avatar-small-addgroup"
                                          />
                                        </div>
                                        <div className="member-text-wrapper">
                                          <span className="username-add">
                                            {friend.username}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Nút hành động */}
                            <div className="modal-actions">
                              <span
                                className="cancel-btn-add"
                                onClick={() => {
                                  setShowGroupModal(false);
                                  setGroupName("");
                                  setGroupImage(null);
                                  setSelectedMembers([]);
                                  setPhoneSearchTerm("");
                                  setSearchResults([]);
                                }}
                              >
                                Hủy
                              </span>
                              <span
                                className="confirm-btn-add"
                                onClick={handleCreateGroupWith11}
                              >
                                {creatingGroup ? "Đang tạo..." : "Tạo nhóm"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="container-conservation">
                        <div className="image-video-conservation">
                          <p>Ảnh / Video</p>
                          {mediaOnly.length === 0 ? (
                            <p className="no-media-message">
                              Chưa có ảnh/video nào được gửi.
                            </p>
                          ) : (
                            <>
                              <div className="media-content">
                                {(showAllMedia
                                  ? mediaOnly
                                  : mediaOnly.slice(0, 4)
                                ).map((msg, index) => (
                                  <div key={index} className="media-item">
                                    {msg.imageUrl && (
                                      <img
                                        src={msg.imageUrl}
                                        alt="image"
                                        className="media-thumbnail"
                                        onClick={() =>
                                          openModal(msg.imageUrl, "image", msg)
                                        }
                                      />
                                    )}
                                    {msg.videoUrl && (
                                      <video
                                        src={msg.videoUrl}
                                        className="media-thumbnail"
                                        controls
                                        onClick={() =>
                                          openModal(msg.videoUrl, "video", msg)
                                        }
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                              {mediaOnly.length > 4 && (
                                <button
                                  onClick={() => setShowAllMedia(!showAllMedia)}
                                >
                                  {showAllMedia ? "Ẩn bớt" : "Xem tất cả"}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="container-conservation">
                        <div className="image-video-conservation">
                          <p>File</p>
                          {fileOnly.length === 0 ? (
                            <p className="no-media-message">
                              Chưa có file nào được gửi.
                            </p>
                          ) : (
                            <>
                              <div className="media-content-file">
                                {(showAllFiles
                                  ? fileOnly
                                  : fileOnly.slice(0, 4)
                                ).map((msg, index) => (
                                  <div key={index} className="media-item-file">
                                    <a
                                      href={msg.fileUrl}
                                      download={msg.fileName}
                                      className="media-file-link"
                                    >
                                      <span className="file-icon">
                                        <img
                                          src={getFileIcon(msg.fileName)}
                                          alt="file icon"
                                          style={{
                                            width: 25,
                                            height: 25,
                                            marginRight: 8,
                                          }}
                                        />
                                      </span>
                                      <span className="file-name">
                                        {msg.fileName}
                                      </span>

                                      <span className="time-file-name">
                                        {formatTimeMessage(msg.createdAt)}
                                      </span>
                                    </a>
                                  </div>
                                ))}
                              </div>
                              {fileOnly.length > 4 && (
                                <button
                                  onClick={() => setShowAllFiles(!showAllFiles)}
                                >
                                  {showAllFiles ? "Ẩn bớt" : "Xem tất cả"}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {(() => {
                        console.log("isGroup:", selectedChat?.isGroup);
                        console.log("userId:", user?._id);
                        console.log("groupLeader:", selectedChat?.groupLeader);
                        console.log("isDissolved:", selectedChat?.isDissolved);
                        console.log("selectedChat: ", selectedChat);
                        return null;
                      })()}
                      {selectedChat?.isGroup &&
                        user?._id === selectedChat?.groupLeader &&
                        !selectedChat?.isDissolved && (
                          <div className="group-disband-menu">
                            <button
                              className="btn-disband-group"
                              onClick={handleGroupDisbandedSocket}
                              style={{
                                marginTop: 16,
                                padding: "8px 12px",
                                backgroundColor: "#ff4d4f",
                                color: "#fff",
                                border: "none",
                                borderRadius: 4,
                                cursor: "pointer",
                              }}
                            >
                              Giải tán nhóm
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {pinnedMessage && (
            <div className="pinned-message" onClick={scrollToPinnedMessage}>
              <div className="pinned-label">📌 Đã ghim</div>
              <div className="pinned-content">{pinnedMessage.text}</div>
              <div className="pinned-timestamp">
                {new Date(pinnedMessage.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <FaTimes
                className="unpin-icon"
                onClick={(e) => {
                  handlePinMessage(pinnedMessage._id, false);
                  e.stopPropagation();
                }}
              />
            </div>
          )}

          {/* Messages */}
          <div className="chat-box">
            {messages
              .filter((msg) => !msg.deletedFrom?.includes(user._id))
              .map((msg, index) => {
                const currentDate = new Date(
                  msg.createdAt
                ).toLocaleDateString();

                const prevDate =
                  index > 0
                    ? new Date(
                        messages[index - 1].createdAt
                      ).toLocaleDateString()
                    : null;
                const showDateDivider = currentDate !== prevDate;
                const isMe =
                  (msg.sender?._id || msg.senderId?._id || msg.senderId) ===
                  user._id;
                const leftMembersAfterThisMessage =
                  selectedChat.leftMembers?.filter(
                    (member) => member.lastMessageId === msg._id
                  );

                const addMembersAfterThisMessage =
                  selectedChat.addedMembers?.filter(
                    (member) => member.lastMessageId === msg._id
                  );

                return (
                  <>
                    {showDateDivider && (
                      <div className="date-divider">
                        <span>
                          {new Date(msg.createdAt).toLocaleDateString("vi-VN", {
                            weekday: "long",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    <div
                      key={index}
                      ref={(el) => (messageRefs.current[msg._id] = el)}
                      className={`message-row ${isMe ? "me" : "them"} ${
                        highlightedMessageId === msg._id ? "highlight" : ""
                      }`}
                    >
                      <div
                        className={`message-row ${isMe ? "me" : "them"}`}
                        onMouseEnter={() => setHoveredMessageId(msg._id)}
                      >
                        {/* Avatar bên trái nếu là 'them' */}
                        {!isMe && msg.messageType !== "system" && (
                          <img
                            src={
                              selectedChat.isGroup === false
                                ? selectedChat.image || "/default-avatar.png" // Cuộc trò chuyện 1-1
                                : msg.senderId?.avatar || "/default-avatar.png" // Cuộc trò chuyện nhóm
                            }
                            alt="avatar"
                            className="message-avatar"
                          />
                        )}
                        {msg.messageType !== "system" && (
                          <div
                            className={`message-content ${
                              isMe ? "me" : "them"
                            }`}
                          >
                            {msg.isRecalled ? (
                              <p className="recalled-message">
                                Tin nhắn đã bị thu hồi
                              </p>
                            ) : (
                              <>
                                {msg.replyTo && (
                                  <div
                                    className="reply-to clickable"
                                    onClick={() =>
                                      scrollToMessage(msg.replyTo._id)
                                    }
                                  >
                                    <span className="reply-preview-text">
                                      {msg.replyTo.text ||
                                        msg.replyTo.fileName ||
                                        (msg.replyTo.imageUrl && "Ảnh") ||
                                        (msg.replyTo.video && "Video")}
                                    </span>
                                  </div>
                                )}
                                <div className="sender-info">
                                  <span className="sender-username">
                                    {selectedChat.isGroup === true
                                      ? msg.senderId?.username
                                      : ""}
                                  </span>
                                </div>
                                <div className="message-text">
                                  {msg.text && <p>{msg.text}</p>}
                                </div>
                                {msg.imageUrl && (
                                  <img
                                    src={msg.imageUrl}
                                    alt="sent"
                                    className="chat-image"
                                    onClick={() =>
                                      openModal(msg.imageUrl, "image", msg)
                                    }
                                  />
                                )}
                                {msg.videoUrl && (
                                  <video
                                    controls
                                    className="chat-video"
                                    onClick={() =>
                                      openModal(msg.videoUrl, "video", msg)
                                    }
                                  >
                                    <source
                                      src={msg.videoUrl}
                                      type="video/mp4"
                                    />
                                  </video>
                                )}
                                {msg.fileUrl && (
                                  <div
                                    className="file-message"
                                    onClick={() => {
                                      const lowerName =
                                        msg.fileName.toLowerCase();

                                      // Các định dạng có thể xem trước
                                      const previewableExtensions =
                                        /\.(pdf|docx?|xlsx?|pptx?|txt)$/i;

                                      // Các định dạng không thể xem trước (chỉ mở tab mới)
                                      const nonPreviewableExtensions =
                                        /\.(zip|rar)$/i;

                                      if (
                                        previewableExtensions.test(lowerName)
                                      ) {
                                        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
                                          msg.fileUrl
                                        )}&embedded=true`;
                                        openModal(viewerUrl, "file", msg);
                                      } else if (
                                        nonPreviewableExtensions.test(lowerName)
                                      ) {
                                        window.open(msg.fileUrl, "_blank");
                                      } else {
                                        window.open(msg.fileUrl, "_blank");
                                      }
                                    }}
                                    style={{ cursor: "pointer" }}
                                  >
                                    <span className="file-link">
                                      <span className="file-icon-name-message">
                                        <img
                                          src={getFileIcon(msg.fileName)}
                                          alt="file icon"
                                          className="file-icon-img"
                                        />
                                        <span className="file-name">
                                          {msg.fileName}
                                        </span>
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </>
                            )}

                            <div className="message-info">
                              <span className="timestamp">
                                {msg.createdAt
                                  ? new Date(msg.createdAt).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )
                                  : ""}
                              </span>
                              {msg.status === "sending" ? (
                                <FaClock className="status-icon" />
                              ) : (
                                <FaCheck className="status-icon" />
                              )}
                            </div>
                          </div>
                        )}
                        {msg.messageType === "system" && (
                          <div className="system-message-socket">
                            <span className="system-message-text-socket">
                              {msg.text}
                            </span>
                          </div>
                        )}

                        {/* Nút ba chấm khi hover */}
                        {hoveredMessageId === msg._id &&
                          msg.messageType !== "system" && (
                            <div
                              className={`three-dots-icon ${
                                isMe ? "left" : "right"
                              }`}
                            >
                              <FaEllipsisH
                                className="icon"
                                onClick={(e) => {
                                  setMenuMessageId(msg._id);
                                  e.stopPropagation(); // chặn click propagation
                                }}
                              />
                              {menuMessageId === msg._id && (
                                <div
                                  className={`message-menu ${
                                    isMe ? "left" : "right"
                                  }`}
                                >
                                  {!msg.isRecalled && (
                                    <div
                                      className="menu-item"
                                      onClick={() =>
                                        handlePinMessage(msg._id, true)
                                      }
                                    >
                                      📌 Ghim tin nhắn
                                    </div>
                                  )}

                                  <div
                                    className="menu-item"
                                    onClick={() =>
                                      handleDeleteMessageFrom(msg._id)
                                    }
                                    style={{ color: "red" }}
                                  >
                                    ❌ Xóa phía tôi
                                  </div>
                                  {isMe && !msg.isRecalled && (
                                    <div
                                      className="menu-item"
                                      onClick={() =>
                                        handleRecallMessage(msg._id)
                                      }
                                      style={{ color: "red" }}
                                    >
                                      🔄 Thu hồi
                                    </div>
                                  )}
                                  {!msg.isRecalled && (
                                    <div
                                      className="menu-item"
                                      onClick={() => handleReplyMessage(msg)}
                                    >
                                      💬 Trả lời
                                    </div>
                                  )}
                                  {!msg.isRecalled && (
                                    <div
                                      className="menu-item"
                                      onClick={() => {
                                        setMessageToForward(msg); // Lưu lại tin nhắn cần chuyển tiếp
                                        setShowForwardModal(true); // Mở modal
                                      }}
                                    >
                                      🔄 Chuyển tiếp
                                    </div>
                                  )}
                                  {showForwardModal && (
                                    <>
                                      {console.log(
                                        "MessageToForward",
                                        messageToForward
                                      )}
                                      <div
                                        className="modal-overlay-creategroup"
                                        onClick={() => {
                                          setShowForwardModal(false);
                                          setSelectedChatsToForward([]);
                                          setSearchTerm("");
                                        }}
                                      >
                                        <div
                                          className="add-members-modal-chiase"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <FaTimes
                                            className="icon-outmedia-addmember"
                                            onClick={() => {
                                              setShowForwardModal(false);
                                              setSelectedChatsToForward([]);
                                              setSearchTerm("");
                                            }}
                                          />
                                          <h2>Chia sẻ tin nhắn</h2>

                                          {/* Hiển thị nội dung tin nhắn */}
                                          {messageToForward && (
                                            <div className="message-preview">
                                              <p>
                                                <strong>
                                                  Nội dung tin nhắn:
                                                </strong>
                                              </p>
                                              <div className="message-content-chiase">
                                                {messageToForward.text && (
                                                  <p>{messageToForward.text}</p>
                                                )}

                                                {messageToForward.imageUrl && (
                                                  <img
                                                    src={
                                                      messageToForward.imageUrl
                                                    }
                                                    alt="Hình ảnh"
                                                    style={{
                                                      maxWidth: "100%",
                                                      borderRadius: "8px",
                                                    }}
                                                  />
                                                )}

                                                {messageToForward.videoUrl && (
                                                  <video
                                                    controls
                                                    style={{
                                                      maxWidth: "100%",
                                                      borderRadius: "8px",
                                                    }}
                                                  >
                                                    <source
                                                      src={
                                                        messageToForward.videoUrl
                                                      }
                                                      type="video/mp4"
                                                    />
                                                    Trình duyệt của bạn không hỗ
                                                    trợ video.
                                                  </video>
                                                )}

                                                {messageToForward.fileUrl && (
                                                  <div className="file-message">
                                                    <a
                                                      href={
                                                        messageToForward.fileUrl
                                                      }
                                                      download={
                                                        messageToForward.fileName
                                                      }
                                                      className="file-link"
                                                    >
                                                      <span className="file-icon-name-message">
                                                        <img
                                                          src={getFileIcon(
                                                            messageToForward.fileName
                                                          )}
                                                          alt="file icon"
                                                          className="file-icon-img"
                                                        />
                                                        <span className="file-name">
                                                          {
                                                            messageToForward.fileName
                                                          }
                                                        </span>
                                                      </span>
                                                    </a>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )}

                                          <div className="add-by-phone-wrapper">
                                            <input
                                              type="text"
                                              placeholder="Tìm nhóm, bạn bè hoặc cuộc trò chuyện theo tên..."
                                              value={searchTermShare}
                                              onChange={(e) =>
                                                setSearchTermShare(
                                                  e.target.value
                                                )
                                              }
                                              className="add-member-phone-input"
                                            />
                                          </div>

                                          <div className="list-container">
                                            <div className="member-list-chiase">
                                              <h3>
                                                Danh sách nhóm, bạn bè & cuộc
                                                trò chuyện
                                              </h3>

                                              {(() => {
                                                // 1. Lấy danh sách userId từ 1-1 chats
                                                const oneToOneChatUserIds =
                                                  chats
                                                    .filter(
                                                      (chat) => !chat.isGroup
                                                    )
                                                    .map(
                                                      (chat) =>
                                                        chat.userIdSelectedchat
                                                    ); // ID của đối phương trong chat

                                                // 2. Lọc bạn bè chưa có cuộc trò chuyện
                                                const filteredFriends =
                                                  friends.filter(
                                                    (friend) =>
                                                      !oneToOneChatUserIds.includes(
                                                        friend._id
                                                      )
                                                  );

                                                // 3. Gắn type cho mỗi item (chỉ lấy chat chưa bị giải tán)
                                                const mergedList = [
                                                  ...chats
                                                    .filter(
                                                      (chat) =>
                                                        !chat.isDissolved
                                                    )
                                                    .map((chat) => ({
                                                      ...chat,
                                                      type: "chat",
                                                    })),
                                                  ...filteredFriends.map(
                                                    (friend) => ({
                                                      ...friend,
                                                      type: "friend",
                                                    })
                                                  ),
                                                ];

                                                const filteredList =
                                                  mergedList.filter((item) =>
                                                    (
                                                      item.name ||
                                                      item.username ||
                                                      "Cuộc trò chuyện"
                                                    )
                                                      .toLowerCase()
                                                      .includes(
                                                        searchTermShare.toLowerCase()
                                                      )
                                                  );

                                                // 4. Render danh sách
                                                return filteredList.length >
                                                  0 ? (
                                                  filteredList.map((item) => {
                                                    const itemId =
                                                      item.conversationId ||
                                                      item._id; // Chat thì có conversationId, friend thì là _id

                                                    const isSelected =
                                                      selectedChatsToForward.includes(
                                                        itemId
                                                      );

                                                    const displayName =
                                                      item.name ||
                                                      item.username ||
                                                      "Cuộc trò chuyện";
                                                    const avatar =
                                                      item.image ||
                                                      item.avatar ||
                                                      "/default-avatar.png";

                                                    return (
                                                      <div
                                                        key={itemId}
                                                        className="member-item-wrapper"
                                                      >
                                                        <div className="member-item-add">
                                                          <div className="info-item-add">
                                                            <input
                                                              type="checkbox"
                                                              checked={
                                                                isSelected
                                                              }
                                                              onChange={() => {
                                                                // Không gọi createNewChat ở đây, để handleForwardMessage xử lý
                                                                setSelectedChatsToForward(
                                                                  (prev) =>
                                                                    prev.includes(
                                                                      itemId
                                                                    )
                                                                      ? prev.filter(
                                                                          (
                                                                            id
                                                                          ) =>
                                                                            id !==
                                                                            itemId
                                                                        )
                                                                      : [
                                                                          ...prev,
                                                                          itemId,
                                                                        ]
                                                                );
                                                              }}
                                                            />
                                                            <img
                                                              src={avatar}
                                                              alt={displayName}
                                                              className="avatar-small-addgroup"
                                                            />
                                                          </div>
                                                          <div className="member-text-wrapper">
                                                            <span className="username-add">
                                                              {displayName}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    );
                                                  })
                                                ) : (
                                                  <p
                                                    style={{
                                                      padding: "8px",
                                                      color: "#666",
                                                    }}
                                                  >
                                                    Không tìm thấy kết quả phù
                                                    hợp.
                                                  </p>
                                                );
                                              })()}
                                            </div>
                                          </div>

                                          <div className="modal-actions">
                                            <span
                                              className="cancel-btn-add"
                                              onClick={() => {
                                                setShowForwardModal(false);
                                                setSelectedChatsToForward([]);
                                                setSearchTerm("");
                                              }}
                                            >
                                              Hủy
                                            </span>

                                            <span
                                              className="confirm-btn-add"
                                              onClick={handleForwardMessage}
                                            >
                                              {creatingGroup
                                                ? "Đang chia sẻ..."
                                                : "Chia sẻ"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                        {/* Avatar bên phải nếu là 'me' */}
                        {isMe && (
                          <img
                            src={user.avatar || "/default-avatar.png"}
                            alt="avatar"
                            className="message-avatar"
                          />
                        )}
                      </div>
                    </div>
                  </>
                );
              })}

            <div ref={messagesEndRef} />
          </div>
          {replyingMessage && (
            <div className="reply-preview">
              <div className="reply-info">
                <strong>Đang trả lời:</strong>
                <span className="reply-text">
                  {replyingMessage.text ||
                    replyingMessage.fileName ||
                    (replyingMessage.image && "Ảnh") ||
                    (replyingMessage.video && "Video")}
                </span>
              </div>
              <FaTimes
                className="close-reply-icon"
                onClick={() => setReplyingMessage(null)}
              />
            </div>
          )}
          {/* Input Box */}
          {selectedChat?.isDissolved ? (
            <p className="chat-disabled-msg">
              <FaExclamationCircle
                style={{ color: "#3498db", marginRight: "6px" }}
              />
              Nhóm đã bị giải tán. Bạn không thể gửi tin nhắn nữa.
            </p>
          ) : (
            <div className="input-box-chat">
              <div className="input-icon-container">
                <button className="icon-input" onClick={toggleEmojiPicker}>
                  <FaSmile />
                </button>
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, "image")}
                  style={{ display: "none" }}
                  id="imageUpload"
                />
                <label htmlFor="imageUpload" className="icon-input">
                  <FaImage />
                </label>

                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, "video")}
                  style={{ display: "none" }}
                  id="videoUpload"
                />
                <label htmlFor="videoUpload" className="icon-input">
                  <FaVideo />
                </label>

                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, "file")}
                  style={{ display: "none" }}
                  id="fileUpload"
                />
                <label htmlFor="fileUpload" className="icon-input">
                  <FaPaperclip />
                </label>

                <button className="icon-input">
                  <FaMicrophone />
                </button>
              </div>

              {/* Preview selected image */}
              {Array.isArray(selectedImage) && selectedImage.length > 0 && (
                <div className="preview-container">
                  {selectedImage.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`preview-${idx}`}
                      width="60"
                      height="60"
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                    />
                  ))}
                </div>
              )}

              {/* Preview selected video */}
              {selectedVideo && (
                <div className="preview-container">
                  <video
                    width="80"
                    height="60"
                    controls
                    style={{ borderRadius: "8px" }}
                  >
                    <source src={selectedVideo} type="video/mp4" />
                  </video>
                </div>
              )}

              {/* Text input */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (inputText.trim() !== "") {
                      sendMessage();
                    }
                  }
                }}
              />
              <button onClick={sendMessage} className="send-button">
                <FaPaperPlane />
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="header-chat-window-item">
            <p>{selectedHeader}</p>
          </div>
          <div className="welcome-message">
            <h2>{selectedtitle}</h2>
            <p>{selectedtitle2}</p>
          </div>
        </>
      )}

      {showSelectNewLeaderModal && (
        <>
          <div className="leave-group-overlay">
            <div className="leave-group-modal">
              <h3>Chọn nhóm trưởng mới trước khi rời</h3>
              <ul>
                {pendingLeaveGroup.members
                  .filter((member) => member._id !== user._id)
                  .map((member) => (
                    <li
                      key={member._id}
                      onClick={() => handleSelectNewLeader(member._id)}
                    >
                      {member.username}
                    </li>
                  ))}
              </ul>
              <button
                className="leave-group-cancel"
                onClick={() => setShowSelectNewLeaderModal(false)}
              >
                Huỷ
              </button>
            </div>
          </div>
        </>
      )}
      {/* Modal for image/video preview */}

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onRequestClose={closeModal}
          shouldCloseOnOverlayClick={true}
          contentLabel="Media Modal"
          className="modal-overlay"
          overlayClassName="overlay"
        >
          <div className="modal-content-wrapper">
            <div className="modal-media-wrapper">
              {mediaType === "image" ? (
                <img src={mediaUrl} alt="Media" className="modal-media" />
              ) : mediaType === "video" ? (
                <video controls className="modal-media">
                  <source src={mediaUrl} type="video/mp4" />
                </video>
              ) : mediaType === "file" ? (
                <iframe
                  src={mediaUrl}
                  title="File Viewer"
                  className="modal-media"
                  frameBorder="0"
                  width="100%"
                  height="100%"
                ></iframe>
              ) : null}
            </div>

            {mediaSender && (
              <div className="info-usersend">
                <div className="info-usersend-item">
                  <img
                    src={mediaSender.senderId.avatar}
                    alt="avatar"
                    className="avatar-usersend"
                  />
                  <span className="name-usersend">
                    {mediaSender.senderId.username}
                  </span>
                  <span className="time-usersend">
                    {mediaSender.createdAt
                      ? `${new Date(mediaSender.createdAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )} - ${new Date(
                          mediaSender.createdAt
                        ).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}`
                      : ""}
                  </span>
                </div>
              </div>
            )}

            <label onClick={closeModal} className="close-modal-button">
              <FaTimes />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
