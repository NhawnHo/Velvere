import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser, // Import hàm loginUser
} from '../controllers/User.controller';

const router = Router();

// Routes quản lý người dùng
router.get('/', getAllUsers); // GET     /api/users
router.get('/:id', getUserById); // GET     /api/users/:id
router.post('/', createUser); // POST    /api/users
router.put('/:id', updateUser); // PUT     /api/users/:id
router.delete('/:id', deleteUser); // DELETE  /api/users/:id

// --- Route mới cho Đăng nhập ---
router.post('/login', loginUser); // POST  /api/users/login (Nếu router này được mount tại '/api/users')
// Hoặc bạn có thể cấu hình mount riêng router này tại '/api/auth' và endpoint là '/login'
// Ví dụ: Nếu mount tại '/api/auth', route này sẽ là POST /api/auth/login
// -----------------------------

export default router;
