const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const nodemailer = require('nodemailer');

// Function to send a verification email
async function sendVerificationEmail(savedUser) {
  try {
    // Generate a JWT token
    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET , { expiresIn: '1h' });

    // Configure Nodemailer for sending emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'chatappvipul@gmail.com',
        pass: 'pjghxgjszpehzyut'
      }
    });

    // Send a verification email
    const mailOptions = {
      from: 'chatappvipul@gmail.com',
      to: savedUser.email,
      subject: 'Account Verification',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px;">
          <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333; text-align: center;">Account Verification</h2>
            <p style="color: #555; text-align: center; font-size: 16px;">
              Hi ${savedUser.username},
            </p>
            <p style="color: #555; text-align: center; font-size: 16px;">
              Thank you for signing up with our chat application. To complete your registration, please click the button below to verify your account:
            </p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="http://localhost:3000/user/verify?token=${token}" style="display: inline-block; background-color: #007bff; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 18px; font-weight: bold;">Verify Account</a>
            </div>
            <p style="color: #555; text-align: center; font-size: 16px;">
              If the button above doesn't work, you can also copy and paste the following link into your web browser:
            </p>
            <p style="color: #555; text-align: center; font-size: 16px;">
              <a href="http://localhost:3000/verify?token=${token}" style="color: #007bff; text-decoration: none;">http://localhost:3000/verify?token=${token}</a>
            </p>
            <p style="color: #555; text-align: center; font-size: 16px;">
              Thank you,
              <br>
              The Chat App Team
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Verification email sent:', info.response);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}

module.exports = {
  async signup(req, res) {
    const { username, email, password } = req.body;

    try {
      // Check if the username already exists in the database
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists.' });
      }

      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user with the hashed password
      const user = new User({ username, email, password: hashedPassword, isVerified: false });

      // Save the user to the database
      const savedUser = await user.save();

      // Send verification email
      await sendVerificationEmail(savedUser);

      res.status(200).json({ message: 'Signed up successfully. Please check your email for verification.' });
    } catch (error) {
      console.error('Error signing up:', error);
      res.status(500).json({ message: 'Failed to sign up.' });
    }
  },

  async verifyEmail(req, res) {
    const { token } = req.query;

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user by their ID and update the isVerified field
      const result = await User.updateOne({ _id: decoded.userId }, { isVerified: true });

      if (result.nModified === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({ message: 'Email verified successfully.' });
    } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ message: 'Failed to verify email.' });
    }
  },

  async login(req, res) {
    const { username, password } = req.body;

    try {
      // Find the user by their username
      const user = await User.findOne({ username });

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      if (!user.isVerified) {
        return res.status(401).json({ message: 'Email not verified.' });
      }

      // Check if the password is correct
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Incorrect password.' });
      }

      res.status(200).json({ message: 'Logged in successfully.' });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Failed to login.' });
    }
  }
};
