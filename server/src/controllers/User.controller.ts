import { Request, Response } from 'express';
import User from '../models/User.model';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs'; // Import thư viện mã hóa mật khẩu
import jwt from 'jsonwebtoken'; // Import thư viện JWT

// Khóa bí mật để ký JWT - NÊN ĐƯỢC LẤY TỪ BIẾN MÔI TRƯỜNG (.env) TRONG THỰC TẾ
const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key'; // Thay thế bằng một khóa mạnh và giữ bí mật

export const getAllUsers = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({
            message: 'Lỗi server khi lấy người dùng',
            error: err,
        });
    }
};

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
        res.status(500).json({
            message: 'Lỗi server khi lấy người dùng',
            error: err,
        });
    }
};

export const createUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { name, password, birthDate, email, phone, address } = req.body;

        if (!name || !password || !birthDate || !email || !phone || !address) {
            res.status(400).json({
                message: 'Vui lòng điền đầy đủ thông tin người dùng',
            });
            return;
        }

        // Mã hóa mật khẩu trước khi lưu
        const salt = await bcryptjs.genSalt(10); // Tạo salt
        const hashedPassword = await bcryptjs.hash(password, salt); // Mã hóa mật khẩu

        // Logic tạo user_id bằng cách tìm user cuối cùng và tăng lên
        // LƯU Ý: Phương pháp này có thể gây ra race condition và trùng lặp user_id
        const lastUser = await User.findOne().sort({ user_id: -1 }).lean();
        const newUserId =
            lastUser && typeof lastUser.user_id === 'number'
                ? lastUser.user_id + 1
                : 1;

        const newUser = new User({
            user_id: newUserId,
            name,
            password: hashedPassword, // Lưu mật khẩu đã mã hóa
            birthDate: new Date(birthDate),
            email,
            phone,
            address,
        });

        await newUser.save();

        res.status(201).json(newUser);
    } catch (err: unknown) {
        console.error('Lỗi server khi tạo người dùng:', err);

        if (
            typeof err === 'object' &&
            err !== null &&
            'code' in err &&
            typeof (err as { code?: number }).code === 'number' &&
            (err as { code?: number }).code === 11000 &&
            'keyPattern' in err &&
            typeof (err as { keyPattern?: Record<string, unknown> })
                .keyPattern === 'object' &&
            (err as { keyPattern?: Record<string, unknown> }).keyPattern !==
                null
        ) {
            type MongoErrorWithKeyPattern = {
                keyPattern?: Record<string, unknown>;
            };

            const keyPattern = (err as MongoErrorWithKeyPattern).keyPattern;

            if (keyPattern?.phone) {
                res.status(409).json({
                    message: 'Số điện thoại đã được sử dụng.',
                });
            } else if (keyPattern?.email) {
                res.status(409).json({
                    message: 'Email đã tồn tại.',
                });
            } else if (keyPattern?.user_id) {
                res.status(409).json({
                    message:
                        'Lỗi hệ thống khi tạo ID người dùng. Vui lòng thử lại.',
                });
            } else {
                res.status(409).json({
                    message: 'Dữ liệu bị trùng lặp.',
                    error: err,
                });
            }
        } else if (err instanceof mongoose.Error.ValidationError) {
            const messages = Object.values(err.errors).map(
                (
                    val:
                        | mongoose.Error.ValidatorError
                        | mongoose.Error.CastError,
                ) => val.message,
            );
            res.status(400).json({
                message: 'Dữ liệu gửi lên không hợp lệ.',
                errors: err.errors,
                detail: messages,
            });
        } else {
            let errorMessage = 'Lỗi server khi tạo người dùng';
            if (err instanceof Error) {
                errorMessage = `Lỗi server: ${err.message}`;
            } else if (typeof err === 'string') {
                errorMessage = `Lỗi server: ${err}`;
            }

            res.status(500).json({
                message: errorMessage,
                error: err,
            });
        }
    }
};

// --- Hàm mới để xử lý Đăng nhập ---
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone, password } = req.body;

        // Kiểm tra xem có đủ thông tin không
        if (!phone || !password) {
            res.status(400).json({
                message: 'Vui lòng nhập số điện thoại và mật khẩu',
            });
            return;
        }

        // Tìm người dùng bằng số điện thoại
        const user = await User.findOne({ phone: phone });

        // Kiểm tra nếu không tìm thấy người dùng
        if (!user) {
            // Trả về lỗi chung để không tiết lộ user có tồn tại hay không
            res.status(401).json({
                message: 'Số điện thoại hoặc mật khẩu không đúng',
            });
            return;
        }

        // So sánh mật khẩu (mật khẩu nhập vào với mật khẩu đã hash trong DB)
        const isMatch = await bcryptjs.compare(password, user.password);

        // Kiểm tra nếu mật khẩu không khớp
        if (!isMatch) {
            // Trả về lỗi chung
            res.status(401).json({
                message: 'Số điện thoại hoặc mật khẩu không đúng',
            });
            return;
        }

        // Đăng nhập thành công: Tạo JWT
        const payload = {
            user: {
                id: user._id, // Lưu _id của MongoDB user vào payload
                // Có thể thêm các thông tin khác nếu cần, ví dụ: user_id, role, ...
                user_id: user.user_id,
            },
            
        };

        jwt.sign(
            payload,
            jwtSecret, // Sử dụng khóa bí mật
            { expiresIn: '1h' }, // Thời gian hết hạn của token (ví dụ: 1 giờ)
            (err: Error | null, token: string | undefined) => {
                if (err) throw err; // Xử lý lỗi khi tạo token

                // Trả về token và thông tin user (tùy chọn)
                res.status(200).json({
                    message: 'Đăng nhập thành công',
                    token: token,
                    user: {
                        // Trả về thông tin user (không bao gồm mật khẩu)
                        _id: user._id,
                        user_id: user.user_id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        birthDate: user.birthDate,
                        address: user.address,
                    },
                });
            },
        );
    } catch (err: unknown) {
        // Sử dụng any cho lỗi server chung
        console.error('Lỗi server khi đăng nhập:', err);
        res.status(500).json({
            message: 'Lỗi server khi đăng nhập',
            error: err,
        });
    }
};
// --- Kết thúc hàm Đăng nhập ---

export const updateUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            },
        );

        if (!updatedUser) {
            res.status(404).json({
                message: 'Không tìm thấy người dùng để cập nhật',
            });
            return;
        }

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({
            message: 'Lỗi server khi cập nhật người dùng',
            error: err,
        });
    }
};

export const deleteUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            res.status(404).json({
                message: 'Không tìm thấy người dùng để xoá',
            });
            return;
        }

        res.status(200).json({ message: 'Xoá người dùng thành công' });
    } catch (err) {
        res.status(500).json({
            message: 'Lỗi server khi xoá người dùng',
            error: err,
        });
    }
};
