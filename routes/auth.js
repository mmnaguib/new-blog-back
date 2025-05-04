const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      role: "user",
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const protect = require("../middlewares/authMiddleware");

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const upload = require("../middlewares/upload"); // لو مش مستورد الميدلوير

router.put("/me", protect, upload.single("image"), async (req, res) => {
  const { username, email, phone } = req.body;
  const file = req.file;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (file) user.image = file.filename; // خد اسم الفايل وخزنه

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        image: user.image,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const Post = require("../models/Post");

router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // نشيل الباسورد

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    const posts = await Post.find({ authorId: req.params.id }).sort({ createdAt: -1 }); // 👈 نجيب بوستاته

    res.status(200).json({ user, posts });
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب المستخدم" });
  }
});


router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب المستخدمين" });
  }
});

router.delete("/user/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "المستخدم غير موجود للحذف" });
    }
    res.status(200).json({ message: "تم حذف المستخدم بنجاح" });
  } catch (err) {
    res.status(500).json({ message: "حدث خطأ أثناء حذف المستخدم" });
  }
});

router.put("/make-admin/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });
    }

    if (user.role === "admin") {
      return res.status(400).json({ message: "المستخدم بالفعل Admin" });
    }

    user.role = "admin";
    await user.save();

    res.status(200).json({ message: "تم ترقية المستخدم إلى Admin", user });
  } catch (error) {
    res.status(500).json({ message: "فشل في ترقية المستخدم", error });
  }
});


module.exports = router;
