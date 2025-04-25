import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        user_id: {
            type: Number,
            required: true,
            unique: true,
        },

        name: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        birthDate: {
            type: Date,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true, // Tự động tạo createdAt và updatedAt
    },
);

export default mongoose.model('User', userSchema, 'Users');
