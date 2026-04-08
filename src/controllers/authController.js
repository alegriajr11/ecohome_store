const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userService = require("../services/userService");

const SALT_ROUNDS = 10;

async function signup(req, res, next) {
  try {
    const { username, email, password } = req.body;
    let role = req.body.role || "client";

    // Protect admin creation from public signup.
    if (role === "admin") {
      role = "client";
    }

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = await userService.createUser({ username, email, passwordHash, role });

    console.log(
      `[${new Date().toISOString()}] signup user_id=${newUser.id} email=${newUser.email} role=${newUser.role}`
    );

    return res.status(201).json(newUser);
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    console.log(`[${new Date().toISOString()}] login user_id=${user.id} email=${user.email}`);

    return res.status(200).json({
      token_type: "Bearer",
      expires_in: expiresIn,
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  signup,
  login
};
