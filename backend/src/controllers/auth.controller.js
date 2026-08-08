import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
//import bcrypt from "bcrypt";


export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required.",
            });
        }
        // Check existing user
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already exists.",
            });
        }

        //const salt = await bcrypt.genSalt(10);
        //let hashedpassword = await bcrypt.hash(password, salt);

        console.log("Registering user:", { name, email, phone });
        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
        });

        // Generate JWT
        const token = generateToken(user._id);

        // Response
        return res.status(201).json({
            success: true,
            message: "Registration successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Data recieved",email, password)
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Password bhi chahiye isliye select("+password")
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare Password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Block Check
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    // Generate Token
    const token = generateToken(user._id);

    // Password response mein nahi bhejna
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const becomeOwner = async (req, res) => {
  try {
    const user = req.user;

    if (user.role === "owner") {
      return res.status(200).json({
        success: true,
        message: "You are already an owner.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      });
    }

    user.role = "owner";
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Your account has been upgraded to owner.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update user role (Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["customer", "owner", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing role.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.role = role;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully.`,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};