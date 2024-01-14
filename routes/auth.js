const express = require("express")
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const privateKey = "secretKey";

// register user
router.post('/register', async (req, res, next) => {
    try {
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if (err) {
                res.status(500).json({
                    error: err
                });
            } else {
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    username: req.body.username,
                    email: req.body.email,
                    password: hash
                })
                const newUser = await user.save();
                res.status(201).json({
                    "message": "user created successfully",
                    "newUser": newUser
                })
            }
        });
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
});

// login user
router.post('/login', async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user) { 
            res.status(409).json({
                "message": "User not found"
            })
        } else {
            const auth = await bcrypt.compare(req.body.password, user.password)
            if(!auth) {
                res.status(409).json({
                    "mesasge": "password incorrect"
                })
            } else {
                const token = jwt.sign(
                {
                    id: req.body._id,
                    email: req.body.email
                },
                privateKey,
                {
                    expiresIn: '1h'
                }
                )
                res.cookie('jwt', token, { httpOnly: true})
                res.status(200).json({
                    "message": "logged in",
                    user: user
                })
            }
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
});

// logout user
router.post('/logout', async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if(!user){ 
            res.status(409).json({
                "message": "User not found"
            })
        } else {
            const auth = await bcrypt.compare(req.body.password, user.password)
            if(!auth) {
                res.status(409).json({
                    "mesasge": "password incorrect"
                })
            } else {
                res.cookie('jwt', '');
                res.status(200).json({
                    "message": "logged out successfully"
                })
            }
        }
    } catch (err) {
        res.status(500).json({
            "message": "error",
            error: err
        })
    }
});

module.exports = router;