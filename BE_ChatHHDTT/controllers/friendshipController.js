const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

// Tìm kiếm bạn bè qua số điện thoại
const searchUser = async (req, res) => {
    try {
        const { phone } = req.query;
        console.log(`phone search tìm kiếm`, phone);
        const user = await User.findOne({ phone }).select("_id username phone avatar");
        // const user = await User.findOne({ phone });
        console.log(`user search tìm kiếm`, user);
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Gửi lời mời kết bạn
const sendFriendRequest = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        // Kiểm tra nếu senderId trùng receiverId
        if (senderId === receiverId) {
            return res.status(400).json({ message: "Không thể gửi lời mời kết bạn cho chính bạn" });
        }
        const existingRequest = await FriendRequest.findOne({ senderId, receiverId });
        if (existingRequest) return res.status(400).json({ message: "Đã gửi lời mời trước đó" });

        const newRequest = new FriendRequest({ senderId, receiverId, status: "pending" });
        await newRequest.save();
        res.status(201).json({ message: "Đã gửi lời mời kết bạn" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Chấp nhận lời mời kết bạn
const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        const request = await FriendRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "Không tìm thấy lời mời" });

        request.status = "accepted";
        await request.save();

        await User.findByIdAndUpdate(request.senderId, { $push: { friends: request.receiverId } });
        await User.findByIdAndUpdate(request.receiverId, { $push: { friends: request.senderId } });

        res.status(200).json({ message: "Đã chấp nhận kết bạn" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Từ chối lời mời kết bạn
const rejectFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.body;
        await FriendRequest.findByIdAndDelete(requestId);
        res.status(200).json({ message: "Đã từ chối lời mời kết bạn" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Huỷ lời mời kết bạn
const cancelFriendRequest = async (req, res) => {
    try {
        const { senderId, receiverId } = req.body;
        await FriendRequest.findOneAndDelete({ senderId, receiverId });
        res.status(200).json({ message: "Đã huỷ lời mời kết bạn" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Huỷ kết bạn
const unfriend = async (req, res) => {
    try {
        const { userId, friendId } = req.body;

        // Xóa khỏi collection FriendRequest
        await FriendRequest.deleteOne({
            $or: [
                { senderId: userId, receiverId: friendId },
                { senderId: friendId, receiverId: userId },
            ],
        });

        res.status(200).json({ message: "Đã huỷ kết bạn" });
    } catch (error) {
        res.status(500).json({ error: "Lỗi khi hủy kết bạn" });
    }
};




//Kiểm tra lời mời kết bạn
// API kiểm tra trạng thái lời mời kết bạn
const checkFriendRequestStatus = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        // Kiểm tra xem có lời mời kết bạn từ senderId đến receiverId hay không
        const existingRequest = await FriendRequest.findOne({ senderId, receiverId });

        if (existingRequest) {
            return res.status(200).json({ status: existingRequest.status });
        }

        res.status(200).json({ status: "none" }); // Không có lời mời nào
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//Lấy yêu cầu kết bạn
const getFriendRequests = async (req, res) => {
    try {
        const { userId } = req.params; // Lấy userId từ params

        // Tìm các lời mời kết bạn mà user này là "receiver"
        const friendRequests = await FriendRequest.find({ receiverId: userId, status: "pending" })
            .populate("senderId", "username avatar"); // Lấy thông tin người gửi

        res.status(200).json(friendRequests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Lấy danh sách bạn bè

const getFriendsList = async (req, res) => {
    try {
        const { userId } = req.params; // Lấy userId từ URL params
        console.log(`userId getFriendsList `, userId);

        // Tìm tất cả lời mời kết bạn đã chấp nhận liên quan đến userId
        const friendRequests = await FriendRequest.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
            status: "accepted",
        });

        // Lấy danh sách ID bạn bè từ lời mời kết bạn đã chấp nhận
        const friendIds = friendRequests.map((request) =>
            request.senderId.toString() === userId ? request.receiverId : request.senderId
        );

        // Truy vấn danh sách bạn bè từ User collection
        const friends = await User.find({ _id: { $in: friendIds } }).select("username avatar");

        res.status(200).json(friends);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách bạn bè:", error);
        res.status(500).json({ error: "Lỗi khi lấy danh sách bạn bè" });
    }
};



module.exports = {
    searchUser,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    unfriend,
    checkFriendRequestStatus,
    getFriendRequests,
    getFriendsList
};
