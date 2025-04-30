import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import MessageDialog from '../component/MessageDialog';

function Cart() {
    const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } =
        useCart();
    const navigate = useNavigate();

    // Thêm state mới để quản lý trạng thái thanh toán
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [orderInfo, setOrderInfo] = useState({
        orderId: '',
        orderDate: '',
        estimatedDelivery: '',
        totalAmount: 0, // Thêm trường để lưu tổng tiền
    });

    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        type: '' as 'success' | 'error' | '',
    });

    // Tạo ID đơn hàng ngẫu nhiên
    const generateOrderId = () => {
        return (
            'VLV' +
            Math.floor(Math.random() * 1000000)
                .toString()
                .padStart(6, '0')
        );
    };

    // Tạo ngày giao hàng dự kiến (7 ngày sau ngày hiện tại)
    const getEstimatedDelivery = () => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toLocaleDateString('vi-VN');
    };

    // Hàm xử lý khi đặt hàng
    const handleCheckout = () => {
        // Kiểm tra xem có người dùng đã đăng nhập không
        const user = localStorage.getItem('user');

        // Nếu không có user, hiển thị thông báo yêu cầu đăng nhập
        if (!user) {
            setDialog({
                isOpen: true,
                title: 'Vui lòng đăng nhập',
                description: 'Bạn cần đăng nhập để tiến hành thanh toán.',
                type: 'error',
            });
            return;
        }

        // Nếu giỏ hàng trống, hiển thị thông báo
        if (cartItems.length === 0) {
            setDialog({
                isOpen: true,
                title: 'Giỏ hàng trống',
                description:
                    'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.',
                type: 'error',
            });
            return;
        }

        // Bắt đầu xử lý thanh toán
        setIsProcessing(true);

        // Lưu tổng tiền hiện tại trước khi xóa giỏ hàng
        const currentTotal = totalPrice;

        // Giả lập quá trình xử lý thanh toán (khoảng 2 giây)
        setTimeout(() => {
            const newOrderId = generateOrderId();
            const orderDate = new Date().toLocaleDateString('vi-VN');
            const estimatedDelivery = getEstimatedDelivery();

            setOrderInfo({
                orderId: newOrderId,
                orderDate: orderDate,
                estimatedDelivery: estimatedDelivery,
                totalAmount: currentTotal, // Lưu tổng tiền vào state orderInfo
            });

            setIsProcessing(false);
            setPaymentSuccess(true);

            // Xóa giỏ hàng sau khi đặt hàng thành công
            clearCart();
        }, 2000);
    };

    const handleCloseDialog = () => {
        setDialog({ isOpen: false, title: '', description: '', type: '' });
    };

    const handleContinueShopping = () => {
        setPaymentSuccess(false);
        navigate('/products');
    };

    // Hiển thị màn hình đang xử lý thanh toán
    if (isProcessing) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-1 border-b-1 border-gray-400 mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2">
                        Đang xử lý thanh toán...
                    </h2>
                    <p className="text-gray-500">
                        Vui lòng không tải lại trang.
                    </p>
                </div>
            </div>
        );
    }

    // Hiển thị màn hình thanh toán thành công
    if (paymentSuccess) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 max-w-2xl">
                <div className="bg-white border rounded-lg shadow-lg p-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 rounded-full p-3">
                            <svg
                                className="h-12 w-12 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                        Thanh toán thành công!
                    </h1>

                    <div className="border-t border-b py-4 my-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">Mã đơn hàng:</span>
                            <span className="font-semibold">
                                {orderInfo.orderId}
                            </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">
                                Ngày đặt hàng:
                            </span>
                            <span>{orderInfo.orderDate}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">
                                Tổng thanh toán:
                            </span>
                            <span className="font-semibold">
                                {orderInfo.totalAmount.toLocaleString()}₫
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                                Ngày giao hàng dự kiến:
                            </span>
                            <span>{orderInfo.estimatedDelivery}</span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-center mb-6">
                        Cảm ơn bạn đã mua sắm tại Vélvere! Thông tin chi tiết về
                        đơn hàng của bạn đã được gửi qua email.
                    </p>

                    <div className="flex flex-col md:flex-row gap-4 justify-center">
                        <button
                            onClick={handleContinueShopping}
                            className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
                        >
                            Tiếp tục mua sắm
                        </button>
                        <Link
                            to="/orders"
                            className="px-6 py-3 border border-gray-400 rounded-full hover:bg-black hover:text-white transition text-center"
                        >
                            Xem đơn hàng
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Nếu giỏ hàng trống
    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <h1 className="text-3xl font-semibold uppercase mb-6">
                    Giỏ hàng của bạn
                </h1>
                <div className="border border-gray-400 rounded-lg p-16 mb-8">
                    <p className="text-gray-500 mb-6">
                        Giỏ hàng của bạn hiện đang trống.
                    </p>
                    <Link
                        to="/productPage"
                        className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto my-20 py-8 px-4">
            <h1 className="text-3xl font-semibold uppercase mb-6">
                Giỏ hàng của bạn
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Danh sách sản phẩm */}
                <div className="lg:w-2/3">
                    <div className="border border-gray-400 rounded-lg overflow-hidden">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="py-3 px-4 text-left">
                                        Sản phẩm
                                    </th>
                                    <th className="py-3 px-4 text-center">
                                        Số lượng
                                    </th>
                                    <th className="py-3 px-4 text-right">
                                        Thành tiền
                                    </th>
                                    <th className="py-3 px-4 text-right">
                                        Xóa
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map((item) => (
                                    <tr
                                        key={`${item._id}-${item.size}-${item.color}`}
                                        className="border-t border-gray-400"
                                    >
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.image}
                                                    alt={item.product_name}
                                                    className="w-16 h-16 object-cover rounded mr-4"
                                                />
                                                <div>
                                                    <Link
                                                        to={`/product/${item._id}`}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {item.product_name}
                                                    </Link>
                                                    <p className="text-sm text-gray-500">
                                                        Size: {item.size} | Màu:{' '}
                                                        {item.color}
                                                    </p>
                                                    <p className="text-sm">
                                                        {item.price.toLocaleString()}
                                                        ₫
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center justify-center border rounded">
                                                <button
                                                    onClick={() =>
                                                        item.quantity > 1 &&
                                                        updateQuantity(
                                                            item._id,
                                                            item.size,
                                                            item.color,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                    className="px-3 py-1 hover:bg-gray-100"
                                                >
                                                    -
                                                </button>
                                                <span className="px-3 py-1">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item._id,
                                                            item.size,
                                                            item.color,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                    className="px-3 py-1 hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right font-medium">
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString()}
                                            ₫
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <button
                                                onClick={() =>
                                                    removeFromCart(
                                                        item._id,
                                                        item.size,
                                                        item.color,
                                                    )
                                                }
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between mt-6">
                        <Link
                            to="/productPage"
                            className="px-6 py-2 border border-black rounded-full hover:bg-black hover:text-white transition"
                        >
                            Tiếp tục mua sắm
                        </Link>
                        <button
                            onClick={clearCart}
                            className="px-6 py-2 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition"
                        >
                            Xóa giỏ hàng
                        </button>
                    </div>
                </div>

                {/* Tóm tắt đơn hàng */}
                <div className="lg:w-1/3">
                    <div className="border rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">
                            Tóm tắt đơn hàng
                        </h2>

                        <div className="flex justify-between mb-2">
                            <span>Số lượng sản phẩm:</span>
                            <span>
                                {cartItems.reduce(
                                    (sum, item) => sum + item.quantity,
                                    0,
                                )}
                            </span>
                        </div>

                        <div className="flex justify-between mb-2">
                            <span>Tạm tính:</span>
                            <span>{totalPrice.toLocaleString()}₫</span>
                        </div>

                        <div className="flex justify-between mb-2">
                            <span>Phí vận chuyển:</span>
                            <span>Miễn phí</span>
                        </div>

                        <div className="border-t my-4"></div>

                        <div className="flex justify-between font-semibold text-lg mb-6">
                            <span>Tổng cộng:</span>
                            <span>{totalPrice.toLocaleString()}₫</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full py-3 bg-black text-white rounded-full hover:bg-gray-800 transition"
                        >
                            Thanh toán
                        </button>
                    </div>
                </div>
            </div>

            <MessageDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                description={dialog.description}
                type={dialog.type}
                onClose={handleCloseDialog}
            />
        </div>
    );
}

export default Cart;
