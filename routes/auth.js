const express = require('express')
const User = require('../models/User')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || "ChalaJaaHackerSaale"
const fetchuser = require('../middleware/fetchuser')


// create a user using: POST "/api/auth/createuser" | No login required   
router.post('/createuser', [
    body('name', 'Enter a valid Name').isLength({ min: 1 }),
    body('email', 'Enter a valid Email ID').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 3 }),
], async (req, res) => {
    let success = false;
    // if there are errors, return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }

    try {
        // check whether a user with the given email exists already.
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this mail already exists" })
        }
        // Hashing and Salting the password
        const salt = await bcrypt.genSalt(10);
        secPass = await bcrypt.hash(req.body.password, salt)
        // Create a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })
        // Generating Authentication Web Token
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken: authToken })
    } catch (error) {
        // Deals with unexpected errors
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
})

// login a user using: POST "/api/auth/login" | No login required   
router.post('/login', [
    body('email', 'Enter a valid Email ID').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    // if there are errors, return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success, error: "Please try to login with correct credentials." })
        }
        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({ success, error: "Please try to login with correct credentials." })
        }
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error !");
    }
})

// Get loggedin user details using: POST "/api/auth/getuser" | Login required 
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports = router