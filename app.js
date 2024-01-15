const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const multer = require("multer");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
const authRoutes = require("./routes/auth");
const checkAuth = require("./middleware/checkAuth");

dotenv.config();
mongoose.connect(process.env.MONGO_URL);
mongoose.Promise = global.Promise;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('common'));
app.use(helmet())

// app.use('/uploads', express.static('uploads'))

// const storage = multer.diskStorage( {
//     destination: function(req, file, cb) {
//         cb(null, './uploads/')
//     },
//     filename: function(req, file, cb) {
//         cb(null, Date.now() + file.originalname)
//     }
// })

// const fileFilter = (req, file, cb) => {
//     if( file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true)
//     } else {
//         cb( null, false)
//     }
// }

// const upload = multer({ 
//     storage: storage,
//     limits: {
//         fileSize: 1024*1024*5
//     },
//     fileFilter: fileFilter
//  });

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "public/images");
    },
    filename: (req, file, cb) =>{
        cb(null, req.body.name);
    },
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req,res) =>{
    try {
        return res.status(200).json("File uploaded successfully");
    } catch(err){
        console.log(err)
    }
})

app.use('/auth', authRoutes);
app.use('/user', checkAuth, userRoutes);
app.use('/post', checkAuth, postRoutes);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});

module.exports = app;