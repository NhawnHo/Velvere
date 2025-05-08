import type { Request, Response } from 'express';
import User from '../models/User.model';
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Session, SessionData } from 'express-session';
import bcrypt from 'bcryptjs';


// Type definitions for express-session
declare module 'express-serve-static-core' {
    interface Request {
        session: Session &
            Partial<
                SessionData & {
                    userId?: mongoose.Types.ObjectId | string;
                    isAdmin?: boolean;
                }
            >;
        user?: { isAdmin?: boolean; _id?: mongoose.Types.ObjectId };
    }
}

// Helper function to check authentication
export const checkAuth = async (req: Request) => {
    if (!req.session || !req.session.userId) {
        return {
            authenticated: false,
            message: 'Bạn cần đăng nhập để truy cập.',
        };
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.session.userId)) {
        req.session.destroy((err) => {
            if (err) console.error('Lỗi khi hủy session không hợp lệ:', err);
        });
        return {
            authenticated: false,
            message: 'Phiên đăng nhập không hợp lệ.',
        };
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            req.session.destroy((err) => {
                if (err)
                    console.error('Lỗi khi hủy session không hợp lệ:', err);
            });
            return {
                authenticated: false,
                message:
                    'Người dùng không tồn tại hoặc phiên đăng nhập không hợp lệ.',
            };
        }

        // Check if the current session matches the one in the database
        if (user.currentSessionId && user.currentSessionId !== req.sessionID) {
            console.log(
                `Phát hiện phiên cũ không khớp ${user.currentSessionId} cho user ${user.email}. Phiên hiện tại: ${req.sessionID}. Đang hủy session cũ...`,
            );

            req.sessionStore.destroy(user.currentSessionId, (err) => {
                if (err)
                    console.error('Lỗi khi hủy session cũ không khớp:', err);
                else
                    console.log(
                        `Session cũ ${user.currentSessionId} đã bị hủy thành công.`,
                    );
            });

            await User.findByIdAndUpdate(user._id, {
                $set: { currentSessionId: null },
            });

            req.session.destroy((err) => {
                if (err)
                    console.error(
                        'Lỗi khi hủy session hiện tại không hợp lệ:',
                        err,
                    );
            });

            return {
                authenticated: false,
                message:
                    'Phiên đăng nhập đã hết hạn hoặc bạn đã đăng nhập ở nơi khác. Vui lòng đăng nhập lại.',
            };
        }

        return {
            authenticated: true,
            user: {
                _id: user._id,
                isAdmin: user.isAdmin,
            },
        };
    } catch (error) {
        console.error('Lỗi server khi xác thực session:', error);
        req.session.destroy((err) => {
            if (err) console.error('Lỗi khi hủy session sau lỗi server:', err);
        });
        return { authenticated: false, message: 'Lỗi server khi xác thực.' };
    }
};

// Check session status
export const checkSession = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const authResult = await checkAuth(req);
        if (!authResult.authenticated) {
            res.status(401).json({
                authenticated: false,
                message: authResult.message,
            });
            return;
        }

        const user = authResult.user
            ? await User.findById(authResult.user._id).select(
                  '-password -currentSessionId',
              )
            : null;

        if (!user) {
            res.status(404).json({
                authenticated: false,
                message: 'Không tìm thấy thông tin người dùng',
            });
            return;
        }

        res.status(200).json({
            authenticated: true,
            user: {
                _id: user._id,
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate,
                address: user.address,
                isAdmin: user.isAdmin,
            },
        });
    } catch (err) {
        console.error('Lỗi server khi kiểm tra session:', err);
        res.status(500).json({
            authenticated: false,
            message: 'Lỗi server khi kiểm tra session',
            error: err,
        });
    }
};

// Login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) {
            res.status(400).json({
                message: 'Vui lòng nhập số điện thoại và mật khẩu',
            });
            return;
        }

        const user = await User.findOne({ phone });
        if (!user) {
            res.status(401).json({
                message: 'Số điện thoại hoặc mật khẩu không đúng',
            });
            return;
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                message: 'Số điện thoại hoặc mật khẩu không đúng',
            });
            return;
        }

        // Đảm bảo user._id tồn tại và hợp lệ
        if (
            !user._id ||
            !mongoose.Types.ObjectId.isValid(user._id.toString())
        ) {
            res.status(500).json({
                message: 'Lỗi hệ thống: ID người dùng không hợp lệ',
            });
            return;
        }

        if (user.currentSessionId && req.sessionID !== user.currentSessionId) {
            console.log(
                `Phát hiện phiên cũ ${user.currentSessionId} cho user ${user.email}. Đang hủy...`,
            );
            req.sessionStore.destroy(user.currentSessionId, (err) => {
                if (err) console.error('Lỗi khi hủy session cũ:', err);
                console.log(`Session cũ ${user.currentSessionId} đã bị hủy.`);
            });
        }

        req.session.userId = user._id as mongoose.Types.ObjectId | string; // Đảm bảo gán user._id trực tiếp
        req.session.isAdmin = user.isAdmin;

        user.currentSessionId = req.sessionID;
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'your_secret',
            { expiresIn: '1d' },
        );

        res.status(200).json({
            message: 'Đăng nhập thành công.',
            user: {
                _id: user._id,
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate,
                address: user.address,
                isAdmin: user.isAdmin,
            },
            token,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Lỗi server khi đăng nhập:', err);
        res.status(500).json({
            message: 'Lỗi server khi đăng nhập',
            error: err,
        });
    }
};

// Logout user
export const logoutUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const userId = req.session.userId;

    req.session.destroy(async (err) => {
        if (err) {
            console.error('Lỗi khi hủy session:', err);
            return res.status(500).json({ message: 'Lỗi khi đăng xuất.' });
        }

        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            try {
                await User.findByIdAndUpdate(userId, {
                    $set: { currentSessionId: null },
                });
                console.log(
                    `User ${userId} đã đăng xuất và currentSessionId đã được reset.`,
                );
            } catch (updateErr) {
                console.error(
                    'Lỗi khi cập nhật currentSessionId sau đăng xuất:',
                    updateErr,
                );
            }
        }

        res.clearCookie('connect.sid'); // Xóa cookie session
        res.status(200).json({ message: 'Đăng xuất thành công' });
    });
};

// Lấy danh sách tất cả người dùng (có hỗ trợ phân trang và tìm kiếm)
export const getAllUsers = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const authResult = await checkAuth(req);
        if (!authResult.authenticated) {
            res.status(401).json({ message: authResult.message });
            return;
        }

        const adminResult = checkAdmin(authResult.user ?? {});
        if (!adminResult.isAdmin) {
            res.status(403).json({ message: adminResult.message });
            return;
        }

        // Xử lý phân trang và tìm kiếm
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';

        const skip = (page - 1) * limit;

        // Tạo điều kiện tìm kiếm
        const searchQuery = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { email: { $regex: search, $options: 'i' } },
                      { phone: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        // Đếm tổng số người dùng thỏa mãn điều kiện tìm kiếm
        const total = await User.countDocuments(searchQuery);

        // Lấy danh sách người dùng với phân trang và tìm kiếm
        const users = await User.find(searchQuery)
            .select('-password -currentSessionId')
            .sort({ user_id: 1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        console.error('Lỗi server khi lấy danh sách người dùng:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy danh sách người dùng',
            error: err,
        });
    }
};

export const getUserById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const authResult = await checkAuth(req);
        if (!authResult.authenticated) {
            res.status(401).json({ message: authResult.message });
            return;
        }

        const user = await User.findById(req.params.id).select(
            '-password -currentSessionId',
        );
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }

        if (
            !(authResult.user ?? {}).isAdmin &&
            authResult.user &&
            authResult.user._id &&
            authResult.user._id.toString() !==
                (user._id as mongoose.Types.ObjectId).toString()
        ) {
            res.status(403).json({
                message: 'Không có quyền xem thông tin người dùng này.',
            });
            return;
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Lỗi server khi lấy người dùng bằng ID:', err);
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

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const lastUser = await User.findOne().sort({ user_id: -1 }).lean();
        const newUserId =
            lastUser && typeof lastUser.user_id === 'number'
                ? lastUser.user_id + 1
                : 1;

        const newUser = new User({
            user_id: newUserId,
            name,
            password: hashedPassword,
            birthDate: new Date(birthDate),
            email,
            phone,
            address,
            isAdmin: false,
            currentSessionId: null,
        });

        await newUser.save();

        res.status(201).json({
            message: 'Đăng ký thành công.',
            user: {
                _id: newUser._id,
                user_id: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                isAdmin: newUser.isAdmin,
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Lỗi server khi tạo người dùng:', err);

        if (err.code === 11000 && err.keyPattern) {
            const field = Object.keys(err.keyPattern)[0];
            let message = `Trường '${field}' đã tồn tại.`;
            if (field === 'phone') message = 'Số điện thoại đã được sử dụng.';
            if (field === 'email') message = 'Email đã tồn tại.';
            if (field === 'user_id')
                message =
                    'Lỗi hệ thống khi tạo ID người dùng. Vui lòng thử lại.';

            res.status(409).json({
                message: 'Dữ liệu bị trùng lặp.',
                detail: message,
                error: err,
            });
        } else if (err instanceof mongoose.Error.ValidationError) {
          const messages = Object.values(err.errors).map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (val: any) => val.message,
          );
            res.status(400).json({
                message: 'Dữ liệu gửi lên không hợp lệ.',
                errors: err.errors,
                detail: messages,
            });
        } else {
            res.status(500).json({
                message: 'Lỗi server khi tạo người dùng',
                error: err,
            });
        }
    }
};

export const updateUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const authResult = await checkAuth(req);
        if (!authResult.authenticated) {
            res.status(401).json({ message: authResult.message });
            return;
        }

        if (
            !(authResult.user ?? {}).isAdmin &&
            authResult.user &&
            authResult.user._id &&
            authResult.user._id.toString() !== req.params.id
        ) {
            res.status(403).json({
                message:
                    'Bạn không có quyền cập nhật thông tin người dùng này.',
            });
            return;
        }

        if (!authResult.user?.isAdmin && req.body.isAdmin !== undefined) {
            delete req.body.isAdmin;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            },
        ).select('-password -currentSessionId');

        if (!updatedUser) {
            res.status(404).json({
                message: 'Không tìm thấy người dùng để cập nhật',
            });
            return;
        }

        res.status(200).json({
            message: 'Cập nhật người dùng thành công.',
            user: updatedUser,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Lỗi server khi cập nhật người dùng:', err);

        if (err.code === 11000 && err.keyPattern) {
            const field = Object.keys(err.keyPattern)[0];
            let message = `Trường '${field}' đã tồn tại.`;
            if (field === 'phone') message = 'Số điện thoại đã được sử dụng.';
            if (field === 'email') message = 'Email đã tồn tại.';

            res.status(409).json({
                message: 'Dữ liệu bị trùng lặp.',
                detail: message,
                error: err,
            });
        } else if (err instanceof mongoose.Error.ValidationError) {
          const messages = Object.values(err.errors).map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (val: any) => val.message,
          );
            res.status(400).json({
                message: 'Dữ liệu gửi lên không hợp lệ.',
                errors: err.errors,
                detail: messages,
            });
        } else {
            res.status(500).json({
                message: 'Lỗi server khi cập nhật người dùng',
                error: err,
            });
        }
    }
};

export const deleteUser = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const authResult = await checkAuth(req);
        if (!authResult.authenticated) {
            res.status(401).json({ message: authResult.message });
            return;
        }

        const adminResult = checkAdmin(authResult.user ?? {});
        if (!adminResult.isAdmin) {
            res.status(403).json({ message: adminResult.message });
            return;
        }

        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404).json({
                message: 'Không tìm thấy người dùng để xoá',
            });
            return;
        }

        if (deletedUser.currentSessionId) {
            req.sessionStore.destroy(deletedUser.currentSessionId, (err) => {
                if (err)
                    console.error(
                        `Lỗi khi hủy session của user bị xóa ${deletedUser._id}:`,
                        err,
                    );
                else
                    console.log(
                        `Session của user bị xóa ${deletedUser._id} đã được hủy.`,
                    );
            });
        }

      res.status(200).json({ message: 'Xoá người dùng thành công' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
        console.error('Lỗi server khi xoá người dùng:', err);
        res.status(500).json({
            message: 'Lỗi server khi xoá người dùng',
            error: err,
        });
    }
};

const checkAdmin = (user: { isAdmin?: boolean }) => {
    if (!user.isAdmin) {
        return { isAdmin: false, message: 'Bạn không có quyền truy cập.' };
    }
    return { isAdmin: true };
};

export default {
    getAllUsers,
    getUserById,
    createUser,
    loginUser,
    logoutUser,
    updateUser,
    deleteUser,
    checkAuth,
    checkAdmin,
    checkSession,
};


export const changePassword = async (
    req: Request,
    res: Response,
): Promise<void> => {
    const authResult = await checkAuth(req); // 👈 Kiểm tra xác thực session
    console.log('Auth Result:', authResult); // Thêm log để kiểm tra

    if (!authResult.authenticated) {
        res.status(401).json({ message: authResult.message });
        return;
    }

    const userId = authResult.user?._id; // 👈 Lấy userId từ session hợp lệ
    console.log('User ID:', userId); // Thêm log để kiểm tra
    if (!userId) {
        res.status(400).json({
            message: 'Không tìm thấy thông tin người dùng.',
        });
        return;
    }
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400).json({
            message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới.',
        });
        return;
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng.' });
            return;
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Mật khẩu cũ không chính xác.' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedNewPassword;
        await user.save();

        res.status(200).json({ message: 'Đổi mật khẩu thành công.' });
    } catch (error) {
        console.error('Lỗi khi đổi mật khẩu:', error);
        res.status(500).json({ message: 'Đã xảy ra lỗi khi đổi mật khẩu.' });
    }
};
