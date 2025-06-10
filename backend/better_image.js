import express from 'express';
import sharp from 'sharp';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
const PORT = 3002; 

app.get('/optimized-image', async (req, res) => {
    const { imageUrl, width, height } = req.query;

    try {
        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'arraybuffer'
        });

        const optimizedImage = await sharp(response.data)
            .resize(parseInt(width) || 200, parseInt(height) || 200)  
            .webp({ quality: 100 })
            .toBuffer();

        res.set('Content-Type', 'image/webp');
        res.send(optimizedImage);
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).send('Image processing failed');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
