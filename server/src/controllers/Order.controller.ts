import { Request, Response } from 'express';
import Order from '../models/Order.model';
import mongoose from 'mongoose';
import axios from 'axios';

// Định nghĩa interface cho item trong đơn hàng
interface OrderItem {
    product_id: string;
    product_name: string;
    image: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
}

// Định nghĩa interface cho item cập nhật số lượng
interface StockUpdateItem {
    productId: string;
    size: string;
    color: string;
    quantity: number;
}

// Lấy tất cả đơn hàng theo user_id
export const getOrdersByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'ID người dùng không hợp lệ' });
            return;
        }

        const orders = await Order.find({ user_id: userId }).sort({ orderDate: -1 });
        res.status(200).json(orders);
    } catch (err) {
        console.error('Lỗi server khi lấy danh sách đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn hàng', error: err });
    }
};

// Lấy chi tiết một đơn hàng
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID đơn hàng không hợp lệ' });
            return;
        }

        const order = await Order.findById(id);
        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            return;
        }

        res.status(200).json(order);
    } catch (err) {
        console.error('Lỗi server khi lấy chi tiết đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy chi tiết đơn hàng', error: err });
    }
};

// Tạo đơn hàng mới
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            order_id, user_id, user_name, phone, address, 
            items, totalAmount, payment_method, estimatedDelivery 
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!order_id || !user_id || !user_name || !phone || !address || !items || !totalAmount) {
            res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin đơn hàng' });
            return;
        }

        // Tạo đơn hàng mới
        const newOrder = new Order({
            order_id,
            user_id,
            user_name,
            phone,
            address,
            items,
            totalAmount,
            payment_method: payment_method || 'COD',
            estimatedDelivery: estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Mặc định 7 ngày
        });

        // Lưu đơn hàng vào database
        await newOrder.save();

        // Chuẩn bị dữ liệu để cập nhật số lượng sản phẩm trong kho
        const productItems: StockUpdateItem[] = items.map((item: OrderItem) => ({
            productId: item.product_id,
            size: item.size,
            color: item.color,
            quantity: item.quantity
        }));

        try {
            // Gọi API để cập nhật số lượng sản phẩm trong kho
            await axios.put('http://localhost:3000/api/products/update-multiple-stock', {
                items: productItems
            });
            
            // Trả về thông tin đơn hàng đã tạo
            res.status(201).json({
                message: 'Đơn hàng đã được tạo và số lượng sản phẩm đã được cập nhật',
                order: newOrder
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng sản phẩm:', error);
            
            // Xử lý lỗi và trích xuất thông tin từ axios
            const stockErr = error as Error;
            const axiosError = error as { response?: { data?: unknown } };
            
            // Mặc dù có lỗi khi cập nhật stock, đơn hàng vẫn được tạo thành công
            res.status(201).json({
                message: 'Đơn hàng đã được tạo nhưng có lỗi khi cập nhật số lượng sản phẩm',
                order: newOrder,
                stockError: axiosError.response?.data || stockErr.message || 'Lỗi cập nhật số lượng'
            });
        }
    } catch (err) {
        console.error('Lỗi server khi tạo đơn hàng:', err);
        if (err instanceof Error && err.name === 'MongoError' && (err as any).code === 11000) {
            res.status(409).json({ message: 'Mã đơn hàng đã tồn tại', error: err });
        } else {
            res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng', error: err });
        }
    }
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID đơn hàng không hợp lệ' });
            return;
        }

        if (!status) {
            res.status(400).json({ message: 'Vui lòng cung cấp trạng thái mới' });
            return;
        }

        const order = await Order.findByIdAndUpdate(
            id, 
            { status }, 
            { new: true }
        );

        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            return;
        }

        res.status(200).json(order);
    } catch (err) {
        console.error('Lỗi server khi cập nhật trạng thái đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái đơn hàng', error: err });
    }
};

// Hủy đơn hàng
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID đơn hàng không hợp lệ' });
            return;
        }

        // Tìm đơn hàng trước khi cập nhật để lấy thông tin sản phẩm
        const order = await Order.findById(id);
        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
            return;
        }

        // Kiểm tra nếu đơn hàng đã bị hủy trước đó
        if (order.status === 'cancelled') {
            res.status(400).json({ message: 'Đơn hàng này đã bị hủy trước đó' });
            return;
        }

        // Lưu trạng thái cũ trước khi cập nhật
        const previousStatus = order.status;

        // Cập nhật trạng thái đơn hàng thành 'cancelled'
        order.status = 'cancelled';
        await order.save();

        // Nếu đơn hàng đã được giao, không hoàn lại số lượng vào kho
        if (previousStatus === 'delivered') {
            res.status(200).json({ 
                message: 'Đơn hàng đã được hủy nhưng sản phẩm đã được giao nên không hoàn lại số lượng',
                order 
            });
            return;
        }

        // Chuẩn bị dữ liệu để hoàn lại số lượng sản phẩm vào kho
        try {
            // Chuẩn bị danh sách sản phẩm từ đơn hàng để hoàn lại số lượng
            const productItems: StockUpdateItem[] = order.items.map((item: OrderItem) => ({
                productId: item.product_id,
                size: item.size,
                color: item.color,
                quantity: -1 * item.quantity // Số âm để tăng số lượng trong kho (hoàn lại)
            }));

            // Gọi API để cập nhật số lượng sản phẩm trong kho (tăng lại số lượng)
            await axios.put('http://localhost:3000/api/products/update-multiple-stock', {
                items: productItems
            });

            res.status(200).json({ 
                message: 'Đơn hàng đã được hủy và số lượng sản phẩm đã được hoàn lại kho',
                order 
            });
        } catch (error) {
            console.error('Lỗi khi hoàn lại số lượng sản phẩm:', error);
            
            // Xử lý lỗi và trích xuất thông tin từ axios
            const stockErr = error as Error;
            const axiosError = error as { response?: { data?: unknown } };
            
            // Mặc dù có lỗi khi cập nhật stock, đơn hàng vẫn được hủy thành công
            res.status(200).json({
                message: 'Đơn hàng đã được hủy nhưng có lỗi khi hoàn lại số lượng sản phẩm',
                order,
                stockError: axiosError.response?.data || stockErr.message || 'Lỗi cập nhật số lượng'
            });
        }
    } catch (err) {
        console.error('Lỗi server khi hủy đơn hàng:', err);
        res.status(500).json({ message: 'Lỗi server khi hủy đơn hàng', error: err });
    }
};