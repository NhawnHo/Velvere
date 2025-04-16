import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    user_id: Number,
    user_name: String,
    username: String,
    password: String,
    email: String,
    phone: String,
    address: String,
});

export default mongoose.model('User', userSchema, 'Users'); // nếu ko để tên collection thì mongo sẽ tự tạo một collection mới tên users
