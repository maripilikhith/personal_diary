const express = require('express');
const router = express.Router();
const { db, storage } = require('../config/firebase');
const { verifyToken } = require('../middlewares/auth');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const multer = require('multer');


// Configure multer for memory file uploads (processing files in memory before Cloudinary upload)
const upload = multer({ storage: multer.memoryStorage() });

// Get 'On this day' memories (from exactly 1, 2, etc. years ago)
router.get('/on-this-day', verifyToken, async (req, res) => {
    try {
        if (!db) return res.json([]);

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentDate = today.getDate();
        const currentYear = today.getFullYear();

        const memoriesRef = db.collection('memories');
        const snapshot = await memoriesRef
            .where('userId', '==', req.user.uid)
            .get();

        const onThisDayMemories = [];
        snapshot.forEach(doc => {
            const memory = { id: doc.id, ...doc.data() };
            if (memory.date) {
                const memDate = new Date(memory.date._seconds ? memory.date._seconds * 1000 : memory.date);
                if (memDate.getMonth() === currentMonth &&
                    memDate.getDate() === currentDate &&
                    memDate.getFullYear() < currentYear) {
                    onThisDayMemories.push(memory);
                }
            }
        });

        // Sort descending by year
        onThisDayMemories.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json(onThisDayMemories);
    } catch (error) {
        console.error("Error fetching 'On this day':", error);
        res.status(500).json({ error: error.message });
    }
});

// Get all memories for the current user
router.get('/', verifyToken, async (req, res) => {
    try {
        if (!db) return res.json([]); // Return empty array if not configured

        const memoriesRef = db.collection('memories');
        const snapshot = await memoriesRef
            .where('userId', '==', req.user.uid)
            .get();

        const memories = [];
        snapshot.forEach(doc => {
            memories.push({ id: doc.id, ...doc.data() });
        });

        // Sort descending by date in memory to bypass Firestore composite index requirement
        memories.sort((a, b) => {
            const dateA = a.date && a.date._seconds ? a.date._seconds * 1000 : new Date(a.date).getTime();
            const dateB = b.date && b.date._seconds ? b.date._seconds * 1000 : new Date(b.date).getTime();
            return dateB - dateA;
        });

        res.json(memories);
    } catch (error) {
        console.error("Error fetching memories:", error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new memory
router.post('/', verifyToken, upload.array('media', 5), async (req, res) => {
    try {
        if (!db) return res.status(500).json({ error: 'Firebase not configured' });

        const { date, title, content, tags, mood } = req.body;
        const mediaUrls = [];

        // Upload media to Cloudinary if files exist
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const isVideo = file.mimetype.startsWith('video/');

                const uploadResult = await new Promise((resolve, reject) => {
                    const cld_upload_stream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: isVideo ? 'video' : 'image',
                            folder: `memories/${req.user.uid}`
                        },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );

                    streamifier.createReadStream(file.buffer).pipe(cld_upload_stream);
                });

                mediaUrls.push({
                    url: uploadResult.secure_url,
                    type: isVideo ? 'video' : 'image',
                    storagePath: uploadResult.public_id // Save public_id for potential future deletion
                });
            }
        }

        const newMemory = {
            userId: req.user.uid,
            date: date ? new Date(date) : new Date(),
            title: title || '',
            content: content || '',
            media: mediaUrls,
            tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
            mood: mood || 'neutral',
            createdAt: new Date()
        };

        const docRef = await db.collection('memories').add(newMemory);
        res.status(201).json({ id: docRef.id, ...newMemory });

    } catch (error) {
        console.error("Error creating memory:", error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a memory
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        if (!db) return res.status(500).json({ error: 'Firebase not configured' });

        const docRef = db.collection('memories').doc(req.params.id);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'Memory not found' });
        }

        const memoryData = docSnap.data();

        // Verify ownership
        if (memoryData.userId !== req.user.uid) {
            return res.status(403).json({ error: 'Unauthorized to delete this memory' });
        }

        // Delete associated media from Cloudinary
        if (memoryData.media && memoryData.media.length > 0) {
            for (const mediaItem of memoryData.media) {
                if (mediaItem.storagePath) {
                    try {
                        await cloudinary.uploader.destroy(mediaItem.storagePath, {
                            resource_type: mediaItem.type === 'video' ? 'video' : 'image'
                        });
                        console.log(`Deleted media from Cloudinary: ${mediaItem.storagePath}`);
                    } catch (cloudinaryError) {
                        console.error(`Failed to delete media from Cloudinary: ${mediaItem.storagePath}`, cloudinaryError);
                        // Continue even if Cloudinary deletion fails, so we still delete the db record
                    }
                }
            }
        }

        // Delete the document from Firestore
        await docRef.delete();
        res.status(200).json({ message: 'Memory successfully deleted' });

    } catch (error) {
        console.error("Error deleting memory:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
