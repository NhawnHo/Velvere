import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface Size {
    size: string;
    price: number;
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
    sizes: Size[];
}

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetch(`http://localhost:3000/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => setProduct(data))
            .catch((err) => console.error('Error fetching product:', err));
    }, [id]);

    if (!product) return <p>Loading...</p>;

    return (
        <div className="flex flex-col md:flex-row gap-10 p-6">
            {/* Hình ảnh sản phẩm */}
            <div className="flex-1">
                <img
                    src={product.images[0]}
                    alt={product.product_name}
                    className="w-full max-w-md object-cover"
                />
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex-1">
                <h1 className="text-2xl font-semibold uppercase mb-1">
                    {product.product_name}
                </h1>
                <p className="text-sm text-gray-500 mb-4">
                    #{product.product_id}
                </p>

                {/* Giá sản phẩm */}
                <p className="text-2xl font-bold text-gray-800 mb-6">
                    {product.sizes[0]?.price.toLocaleString()}₫
                </p>

                {/* Size */}
                <div className="mb-6">
                    <p className="font-semibold mb-2">SIZE :</p>
                    <div className="flex gap-2 flex-wrap">
                        {product.sizes.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedSize(s.size)}
                                className={`w-10 h-10 border rounded-full text-sm ${
                                    selectedSize === s.size
                                        ? 'bg-black text-white'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                {s.size}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs mt-2 text-gray-500 italic">
                        Hướng dẫn chọn size
                    </p>
                </div>

                {/* Số lượng */}
                <div className="mb-6">
                    <p className="font-semibold mb-2">Số lượng</p>
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

                {/* Nút hành động */}
                <div className="flex gap-4">
                    <button className="px-6 py-3 border border-black rounded-full hover:bg-gray-100">
                        THÊM VÀO GIỎ
                    </button>
                    <button className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800">
                        MUA NGAY
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
