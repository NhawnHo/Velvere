import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import MessageDialog from '../component/MessageDialog';

interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface Product {
    _id: string;
    product_id: number;
    product_name: string;
    description: string;
    category_id: string;
    sex: string;
    images: string[];
    price: number;
    xuatXu: string;
    chatLieu: string;
    variants: Variant[];
}

function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate(); // Thêm hook useNavigate để chuyển hướng
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        type: '' as 'success' | 'error' | '',
    });

    useEffect(() => {
        fetch(`http://localhost:3000/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data))
            .catch((err) => console.error('Error fetching product:', err));
    }, [id]);

    if (!product) return <p>Loading...</p>;

    // Lấy danh sách size và color duy nhất từ variants
    const uniqueSizes = Array.from(
        new Set(product.variants.map((v) => v.size)),
    );
    const uniqueColors = Array.from(
        new Set(product.variants.map((v) => v.color)),
    );

    // Kiểm tra xem sản phẩm có tồn kho không với size và color đã chọn
    const selectedVariant = product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor,
    );

    const isAvailableInStock = selectedVariant && selectedVariant.stock > 0;

    // Xử lý thêm vào giỏ hàng
    const handleAddToCart = () => {
        // Kiểm tra xem đã chọn size và color hay chưa
        if (!selectedSize || !selectedColor) {
            setDialog({
                isOpen: true,
                title: 'Chưa chọn đủ thông tin',
                description:
                    'Vui lòng chọn size và màu sắc trước khi thêm vào giỏ hàng.',
                type: 'error',
            });
            return;
        }

        // Kiểm tra tồn kho
        if (!isAvailableInStock) {
            setDialog({
                isOpen: true,
                title: 'Sản phẩm hết hàng',
                description:
                    'Rất tiếc, sản phẩm với size và màu sắc đã chọn hiện đã hết hàng.',
                type: 'error',
            });
            return;
        }

        // Thêm sản phẩm vào giỏ hàng
        addToCart({
            _id: product._id,
            product_id: product.product_id,
            product_name: product.product_name,
            image: product.images[0],
            price: product.price,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor,
        });

        // Hiển thị thông báo thành công
        setDialog({
            isOpen: true,
            title: 'Thêm vào giỏ hàng thành công',
            description: 'Sản phẩm đã được thêm vào giỏ hàng của bạn.',
            type: 'success',
        });
    };

    // Xử lý mua ngay
    const handleBuyNow = () => {
        // Kiểm tra xem đã chọn size và color hay chưa
        if (!selectedSize || !selectedColor) {
            setDialog({
                isOpen: true,
                title: 'Chưa chọn đủ thông tin',
                description:
                    'Vui lòng chọn size và màu sắc trước khi mua ngay.',
                type: 'error',
            });
            return;
        }

        // Kiểm tra tồn kho
        if (!isAvailableInStock) {
            setDialog({
                isOpen: true,
                title: 'Sản phẩm hết hàng',
                description:
                    'Rất tiếc, sản phẩm với size và màu sắc đã chọn hiện đã hết hàng.',
                type: 'error',
            });
            return;
        }

        // Thêm sản phẩm vào giỏ hàng
        addToCart({
            _id: product._id,
            product_id: product.product_id,
            product_name: product.product_name,
            image: product.images[0],
            price: product.price,
            quantity: quantity,
            size: selectedSize,
            color: selectedColor,
        });

        // Chuyển hướng đến trang giỏ hàng
        navigate('/cart');
    };

    const handleCloseDialog = () => {
        setDialog({ isOpen: false, title: '', description: '', type: '' });
    };

    return (
        <div className="flex flex-col md:flex-row gap-10 p-6 mt-10">
            {/* Hình ảnh sản phẩm */}
            <div className="flex p-2 border-r border-gray-200">
                <img
                    src={product.images[0]}
                    alt={product.product_name}
                    className="w-[40vw] max-w-2xl object-cover rounded"
                />
                <div className="flex gap-2">
                    {product.images.slice(1).map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`thumbnail-${idx}`}
                            className="w-20 h-20 object-cover rounded ml-2"
                        />
                    ))}
                </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex-1">
                <h1 className="text-5xl font-semibold uppercase mb-1">
                    {product.product_name}
                </h1>

                {/* Giá */}
                <p className="text-2xl font-extralight text-gray-800 mb-4">
                    {product.price.toLocaleString()}₫
                </p>

                {/* Thông tin thêm */}
                <p className="text-sm text-gray-600 mb-2">
                    Chất liệu: {product.chatLieu}
                </p>
                <p className="text-sm text-gray-600 mb-6">
                    Xuất xứ: {product.xuatXu}
                </p>

                {/* Chọn SIZE */}
                <div className="mb-6">
                    <p className="font-semibold mb-2">Kích cỡ:</p>
                    <div className="flex gap-2 flex-wrap">
                        {uniqueSizes.map((size, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSize(size)}
                                className={`w-10 h-10 border rounded-full text-sm ${
                                    selectedSize === size
                                        ? 'bg-black text-white'
                                        : 'hover:bg-black hover:text-white'
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chọn MÀU */}
                <div className="mb-6">
                    <p className="font-semibold mb-2">Màu sắc:</p>
                    <div className="flex gap-2 flex-wrap">
                        {uniqueColors.map((color, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedColor(color)}
                                className={`px-4 py-2 border rounded-full text-sm ${
                                    selectedColor === color
                                        ? 'bg-black text-white'
                                        : 'hover:bg-black hover:text-white'
                                }`}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Số lượng */}
                <div className="mb-6">
                    <p className="font-semibold mb-2">Số lượng:</p>
                    <div className="flex items-center gap-2 border w-fit px-3 py-1 rounded">
                        <button
                            onClick={() =>
                                setQuantity(Math.max(1, quantity - 1))
                            }
                            className="px-2"
                        >
                            -
                        </button>
                        <span className="px-2">{quantity}</span>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="px-2"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Hiển thị tình trạng kho hàng */}
                {selectedSize && selectedColor && selectedVariant && (
                    <div className="mb-4">
                        <p
                            className={`text-sm ${
                                selectedVariant.stock > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            }`}
                        >
                            {selectedVariant.stock > 0
                                ? `Còn hàng (${selectedVariant.stock} sản phẩm)`
                                : 'Hết hàng'}
                        </p>
                    </div>
                )}

                {/* Nút hành động */}
                <div className="flex gap-4">
                    <button
                        onClick={handleAddToCart}
                        className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white"
                    >
                        THÊM VÀO GIỎ
                    </button>
                    <button
                        onClick={handleBuyNow}
                        className="px-6 py-3 bg-black text-white rounded-full hover:bg-white hover:text-black hover:border hover:border-black transition"
                    >
                        MUA NGAY
                    </button>
                </div>
                <p className="font-semibold mt-5 mb-2">Mô tả: </p>
                <p> {product.description}</p>
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

export default ProductDetail;
