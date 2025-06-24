const jwt = require('jsonwebtoken');
const User= require('../models/User')
const cloudinary = require('../config/cloudinary');
const streamifier = require("streamifier");


const uploadToCloudinaryFromBuffer = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "user_profiles" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }

const genrateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, status: user.status, picture: user.picture, instruments: user.instruments },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
}

const genrateRfToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username, status: user.status, picture: user.picture, instruments: user.instruments },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );
}

exports.register = async (req, res) => {
  try {
    const { username, password, instruments , isAdmin } = req.body;

    

    const picture = req.files?.picture;

    if (!username || !password || !instruments) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    let uploadedImageUrl = null;
    if (picture && picture.data) {
      try {
        const result = await uploadToCloudinaryFromBuffer(picture.data);
        uploadedImageUrl = result.secure_url;
      } catch (uploadErr) {
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    const status = isAdmin === "true" ? "Admin" : "Player";


    const newUser = await User.create({
      username,
      password,
      instruments,
      picture: uploadedImageUrl,
      status,
    });

    const token = genrateAccessToken(newUser);
    const refreshToken = genrateRfToken(newUser);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "User registered successfully",
        user: {
          id: newUser._id,
          username: newUser.username,
          instruments: newUser.instruments,
          picture: newUser.picture,
          status: newUser.status,
        },
      });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};


exports.login = async (req, res) => {
    try {
        const newUser = req.body;
        if (!newUser.username || !newUser.password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const existingUser = await User.findOne({ username: newUser.username });
        if (!existingUser) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        if (!(await existingUser.comparePassword(newUser.password))) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = genrateAccessToken(existingUser);
        const refreshToken = genrateRfToken(existingUser);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 
        }).cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 
        })
        .status(200)
        .json({
            message: 'User logged in successfully',
            user: {
                id: existingUser.id,
                username: existingUser.username,
                instruments: existingUser.instruments,
                picture: existingUser.picture,
                status: existingUser.status
            }
        });
    } catch (error) {
        return res.status(500).json({message: 'Server error'});
    }
}



exports.getMe = (req, res) => {
    res.status(200).json({
      user: {
        id: req.user.id,
        username: req.user.username,
        status: req.user.status,
        picture: req.user.picture,
        instruments: req.user.instruments,
      },
    });
  };


exports.refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });
  
    try {
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
  
      
      const user = await User.findOne({ username: decoded.username });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const newAccessToken = genrateAccessToken(user);
  
      res
        .cookie("token", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 15 * 60 * 1000,
        })
        .status(200)
        .json({
          message: "Token refreshed",
        });
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
  };


exports.logout = (req, res) => {
    res
      .clearCookie("token", {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "Strict",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ message: "Logged out" });
  };