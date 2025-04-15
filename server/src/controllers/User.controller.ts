import { Request, Response } from 'express';
import User from '../models/User.model';

// Lấy tất cả người dùng
export const getAllUsers = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi lấy người dùng', err });
    }
};

// Lấy người dùng theo ID
export const getUserById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', err });
    }
};

// Tạo mới user
export const createUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server khi tạo người dùng', err });
    }
};

// Cập nhật user
export const updateUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng', err });
    }
};

// Xoá user
export const deleteUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ message: 'Lỗi khi xoá người dùng', err });
    }
};
