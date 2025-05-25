import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Video } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const { width, height } = Dimensions.get("window");
const itemWidth = (width - 50) / 4;

const MediaMessagesViewer = ({ messages }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState(null);
  const [modalVideoUri, setModalVideoUri] = useState(null);
  const videoRef = useRef(null); // Tạo ref

  const downloadFile = async (fileUri, fileName) => {
    try {
      const fileUriLocal = FileSystem.documentDirectory + fileName;
      const { uri } = await FileSystem.downloadAsync(fileUri, fileUriLocal);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert("Lỗi tải file", error.message);
    }
  };

  const handleOpenImage = (uri) => {
    setModalImageUri(uri);
    setModalVideoUri(null);
    setModalVisible(true);
  };

  const handleOpenVideo = (uri) => {
    setModalVideoUri(uri);
    setModalImageUri(null);
    setModalVisible(true);
  };

  const renderMediaItem = ({ item }) => {
    const { messageType, file, fileName, image, video } = item;

    if (messageType === "file" && file) {
      return (
        <TouchableOpacity
          onPress={() => downloadFile(file, fileName)}
          style={styles.itemContainer}
        >
          <View style={styles.fileBox}>
            <Text style={styles.fileText}>📄</Text>
            <Text style={styles.downloadText} numberOfLines={1}>
              {fileName}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    if (messageType === "image" && image) {
      return (
        <TouchableOpacity
          onPress={() => handleOpenImage(image)}
          style={styles.itemContainer}
        >
          <Image
            source={{ uri: image }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    }

    if (messageType === "video" && video) {
      return (
        <TouchableOpacity
          onPress={() => handleOpenVideo(video)}
          style={styles.itemContainer}
        >
          <View style={styles.videoPreview}>
            <Video
              ref={videoRef}
              source={{ uri: video }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="cover"
              shouldPlay={false}
              useNativeControls={false}
              style={styles.videoPlayer}
            />
            <Text style={styles.downloadText}>{fileName || "Xem video"}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <>
      <FlatList
        data={messages}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.container}
        numColumns={4}
      />

      {/* Modal xem ảnh hoặc video */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Chạm ra ngoài để đóng modal */}
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View style={styles.modalContent}>
            {modalImageUri && (
              <Image
                source={{ uri: modalImageUri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}
            {modalVideoUri && (
              <Video
                source={{ uri: modalVideoUri }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                shouldPlay
                useNativeControls
                style={styles.fullVideo}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  itemContainer: {
    width: itemWidth,
    height: itemWidth,
    margin: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  mediaImage: {
    width: itemWidth - 10,
    height: itemWidth - 10,
    borderRadius: 6,
  },
  fileBox: {
    width: itemWidth - 10,
    height: itemWidth - 10,
    backgroundColor: "#e0f7fa",
    padding: 5,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  videoPreview: {
    width: itemWidth - 10,
    height: itemWidth - 10,
    backgroundColor: "#fbe9e7",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  fileText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  playIcon: {
    fontSize: 24,
    color: "#333",
  },
  downloadText: {
    fontSize: 10,
    textAlign: "center",
    color: "#007BFF",
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.7,
    backgroundColor: "black",
    borderRadius: 10,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  fullVideo: {
    width: "100%",
    height: "100%",
  },
  videoPlayer: {
    width: 250,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#000",
  },
});

export default MediaMessagesViewer;
