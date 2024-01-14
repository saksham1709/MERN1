const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
        type: String,
        required: true,
        ref: 'User'
    },
    desc: {
        type: String,
        required: true,
        max: 50
    },
    img: {
        type: String
    },
    likes: {
        type: Array,
        default: []
    }
})

module.exports = mongoose.model("Post", PostSchema);