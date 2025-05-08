import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    loginUser,
    logoutUser,
  checkSession,
  changePassword
} from '../controllers/User.controller';

const router = Router();

// User management routes
router.get('/check-session', checkSession);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/change-password', changePassword);


export default router;
