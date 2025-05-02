import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import productRoutes from './routes/Product.route';
import userRoutes from './routes/User.route';
import orderRoutes from './routes/Order.route';
import chatRoutes from './routes/Chat.route';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB error:', err));

// Route API theo tài nguyên
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at http://104.28.237.73/32:${PORT}`);
});
