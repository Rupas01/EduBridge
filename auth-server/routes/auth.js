const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
router.post('/register', async (req, res) => {
    console.log('--- New Registration Request ---');
    const { firstName, lastName, dateOfBirth, mobileNumber, username, email, password } = req.body;

    if (!firstName || !email || !password || !username) {
        return res.status(400).json({ msg: 'Please enter all required fields.' });
    }

    try {
        console.log(`[DEBUG] Checking for existing user with email: ${email} or username: ${username}`);
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ msg: 'User with that email or username already exists' });
        }

        console.log('[DEBUG] Checking for existing mobile number...');
        let mobileUser = await User.findOne({ mobileNumber });
        if (mobileUser) {
            return res.status(400).json({ msg: 'This mobile number is already registered' });
        }

        console.log('[DEBUG] Creating new user...');
        user = new User({
            firstName,
            lastName,
            dateOfBirth,
            mobileNumber,
            username,
            email,
            password
        });

        console.log('[DEBUG] Hashing password...');
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        console.log(`[SUCCESS] User ${username} registered successfully.`);

        res.status(201).json({ msg: 'User registered successfully' });

    } catch (err) {
        console.error('[ERROR] An error occurred during registration:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/auth/login
router.post('/login', async (req, res) => {
    console.log('--- New Login Request ---');
    console.log(`[${new Date().toLocaleTimeString()}] Received login request for email:`, req.body.email);

    const { email, password } = req.body;

    if (!email || !password) {
        console.log('[DEBUG] Login failed: Email or password not provided.');
        return res.status(400).json({ msg: 'Please provide an email and password.' });
    }

    try {
        console.log(`[DEBUG] Finding user with email: ${email}...`);
        let user = await User.findOne({ email });

        if (!user) {
            console.log(`[DEBUG] Login failed. No user found with email: ${email}.`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        console.log(`[DEBUG] User found. Comparing passwords...`);

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log(`[DEBUG] Login failed for user ${email}. Passwords do not match.`);
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }
        console.log('[DEBUG] Passwords match. Creating JWT token...');

        const payload = { user: { id: user.id } };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                console.log(`[SUCCESS] JWT token created for user ${email}.`);

                // FIX: Include the user object in the response
                res.json({
                    token,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        profilePictureUrl: user.profilePictureUrl
                    }
                });
            }
        );
    } catch (err) {
        console.error('[ERROR] An error occurred during login:', err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/check-username/:username
// @desc    Check if a username is already taken
router.get('/check-username/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username.toLowerCase() });
        if (user) {
            return res.json({ available: false });
        }
        res.json({ available: true });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;