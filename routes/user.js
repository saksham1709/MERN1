const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Delete user
router.delete('/:id', async (req, res, next) => {
    if (req.body._id === req.params.id) {
        try {
            const id = req.params.id;
            await User.findByIdAndDelete(id);
            res.status(200).json({
                "message": "user deleted successfully"
            })
        } catch (err) {
            res.status(500).json({
                error: err
            })
        }
    } else {
        res.status(409).json({
            "message": "You can delete only your account"
        })
    }
})

// Update user

// Get a user
router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (user) {
            res.status(200).json({
                "message": "user found",
                user: user
            })
        } else {
            res.status(401).json({
                "message": "user not found"
            })
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})

// Follow user
router.post('/:id/follow', async (req, res, next) => {
    if(req.body._id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body._id);
            if (!user.followers.includes(currentUser._id)) {
                await user.updateOne({ $push: { followers: currentUser._id } })
                await currentUser.updateOne({ $push: { followings: user._id } })
                res.status(200).json({
                    "message": "now following",
                    userFollowed: user,
                    userFollowing: currentUser
                })
            } else {
                await user.updateOne({ $pull: { followers: currentUser._id } })
                await currentUser.updateOne({ $pull: { followings: user._id } })
                res.status(200).json({
                    "message": "unfollowed"
                })
            }
        } catch (err) {
            res.status(500).json({
                error: err
            })
        }
    } else {
        res.status(409).json({
            "message": "action not available for self account"
        })
    }
})

// Unfollow user

module.exports = router;