import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ShowMoreText from 'react-show-more-text';

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
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState<string>('');

    useEffect(() => {
        fetch(`http://localhost:3000/api/products/${id}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
                setMainImage(data.images[0]); // Thiết lập hình ảnh chính ban đầu
            })
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

    return (
        <div className="flex flex-col md:flex-row gap-10 p-6 mt-10">
            {/* Hình ảnh sản phẩm */}
            <div className="flex p-2 border-r border-gray-200">
                <img
                    src={mainImage}
                    alt={product.product_name}
                    className="w-[40vw] h-[600px] max-w-2xl object-cover"
                />
                <div className="flex flex-col gap-2">
                    {product.images.map((img, idx) => (
                        <img
                            key={idx}
                            src={img}
                            alt={`thumbnail-${idx}`}
                            className={`w-20 h-20 rounded ml-2 cursor-pointer ${
                                mainImage === img ? 'ring-1 ring-gray-400' : ''
                            }`}
                            onClick={() => setMainImage(img)}
                        />
                    ))}
                </div>
            </div>

            {/* Thông tin sản phẩm */}
            <div className="flex-1">
                <h1 className="text-3xl font-semibold uppercase mb-1">
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

                {/* Nút hành động */}
                <div className="flex gap-4">
                    <button className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white">
                        THÊM VÀO GIỎ
                    </button>
                    <button className="px-6 py-3 bg-black text-white rounded-full hover:bg-white hover:text-black hover:border">
                        MUA NGAY
                    </button>
                </div>

                {/* Mô tả sản phẩm */}
                <div>
                    <p className="font-semibold mt-5 mb-2">Mô tả: </p>
                    <ShowMoreText
                        lines={3}
                        more="Xem thêm"
                        less="Thu gọn"
                        anchorClass="text-gray-500 cursor-pointer"
                        expanded={false}
                        className="text-justify"
                        truncatedEndingComponent="..."
                    >
                        {product.description}
                    </ShowMoreText>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
