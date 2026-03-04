const express = require('express');
const cors = require('cors');
require('dotenv').config();

const memoriesRoutes = require('./routes/memories');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary after dotenv is loaded
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/memories', memoriesRoutes);

app.get('/', (req, res) => {
    res.send('Personal Memory Diary API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Force nodemon restart to refresh stale Firebase connection
