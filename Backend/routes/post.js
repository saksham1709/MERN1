const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Post = require("../models/Post")
const User = require("../models/User");

// Create a Post
router.post('/create', async (req, res, next) => {
    try {
        const post = new Post({
            _id: new mongoose.Types.ObjectId(),
            userId: req.body.userId,
            desc: req.body.desc,
            img: req.body.img,
            likes: req.body.likes
        });
        const newPost = await post.save();
        await User.findByIdAndUpdate(req.body.userId, { $push: { posts: newPost._id } })
        res.status(201).json({
            "message": "new post created",
            newPost: newPost
        })
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})

// Update a Post
router.patch('/:id/update', async (req, res, next) => {
    try {
        const user = await User.findById(req.body.userId);
        const post = await Post.findById(req.params.id);
        if(!user) {
            res.status(401).json({
                "message": "user not found"
            })
        } else if(!post) {
            res.status(401).json({
                "message": "post not found"
            })
        } else if(user._id !== post.userId) {
            res.status(403).json({
                "message": "unauthorized"
            })
        }
        else {
            const newPost = await Post.findByIdAndUpdate(req.params.id, { $set: req.body })
            res.status(200).json({
                "message": "post updated",
                newPost: newPost
            })
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})

// Delete a Post
router.delete('/:id', async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if(req.body.userId !== post.userId) {
            res.status(403).json({
                "message": "unauthorized"
            })
        } else {
            await post.deleteOne();
            res.status(200).json({
                "message": "post deleted"
            })
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
});

// Like & Dislike a Post
router.patch('/:id/like', async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            res.status(401).json({
                "message": "post not found"
            })
        } else {
            if(!post.likes.includes(req.body.userId)) {
                await post.updateOne({ $push: { likes: req.body.userId } })
                res.status(200).json({
                    "message": "post liked"
                })
            } else {
                await post.updateOne({ $pull: { likes: req.body.userId } })
                res.status(200).json({
                    "message": "post disliked"
                })
            }
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})

// Get a Post
router.get('/:id', async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post) {
            res.status(401).json({
                "message": "post not found"
            })
        } else {
            res.status(200).json({
                "message": "post found",
                post: post
            })
        }
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})

// Get all Posts
router.get('/timeline/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const userPosts = await Post.find({ userId: user._id });
        const friendsPosts = await Promise.all(
            user.followings.map((posts) => {
                return Post.find({ userId: posts })
            })
        );
        const timelinePosts = userPosts.concat(...friendsPosts);
        res.status(200).json({
            "message": "timeline loaded successfully",
            timelinePosts: timelinePosts
        })
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
})

// Get all User Posts
router.get('/:id/posts', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        const userPosts = await Post.find({ userId: user._id });
        res.status(200).json({
            "message": "posts loaded successfully",
            userPosts: userPosts
        })
    } catch (err) {
        res.status(500).json({
            error: err
        })
    }
});

module.exports = router;