import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

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

function Product() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/products')
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
            })
            .catch((err) => console.error('Fetch error:', err));
    }, []);

    return (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-[15vw] items-center">
            {products.length > 0 ? (
                products.map((product) => {
                    const totalStock = product.variants.reduce(
                        (sum, variant) => sum + variant.stock,
                        0,
                    );

                    return (
                        <Link
                            to={`/product/${product._id}`}
                            key={product.product_id}
                            className="border p-10 rounded shadow hover:shadow-lg transition duration-300  block"
                        >
                            <h1 className="text-xl font-bold">
                                {product.product_name}
                            </h1>
                            <p className="text-gray-600">
                                {product.description}
                            </p>
                            <p className="text-sm mt-1 text-gray-500">
                                Chất liệu: {product.chatLieu} | Xuất xứ:{' '}
                                {product.xuatXu}
                            </p>
                            <div className="mt-2 font-semibold text-red-500">
                                Giá: {product.price.toLocaleString()}đ
                            </div>

                            <div className="flex gap-2 mt-4">
                                <img
                                    key={product.images[0]}
                                    src={product.images[0]}
                                    alt={`product-${product.product_id}`}
                                    className="w-86 h-100 object-cover rounded border"
                                />
                            </div>

                            <div className="mt-4">
                                <h2 className="font-semibold">
                                    Biến thể (Size / Màu):
                                </h2>

                                <p className="mt-2 text-sm ">
                                    Tổng tồn kho: {totalStock}
                                </p>
                            </div>
                        </Link>
                    );
                })
            ) : (
                <p>Đang tải sản phẩm...</p>
            )}
        </div>
    );
}

export default Product;
