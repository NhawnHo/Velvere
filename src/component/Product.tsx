import { useEffect, useState } from 'react';

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
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.length > 0 ? (
                products.map((product) => (
                    <div
                        key={product.product_id}
                        className="border p-4 rounded shadow"
                    >
                        <h1 className="text-xl font-bold">
                            {product.product_name}
                        </h1>
                        <p className="text-gray-600">{product.description}</p>
                        <div className="flex gap-2 mt-2">
                            {product.images.map((url, index) => (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`product-${index}`}
                                    className="w-24 h-24 object-cover"
                                />
                            ))}
                        </div>
                        <div className="mt-4">
                            <h2 className="font-semibold">Sizes:</h2>
                            <ul className="list-disc pl-4">
                                {product.sizes.map((size, index) => (
                                    <li key={index}>
                                        {size.size} -{' '}
                                        {size.price.toLocaleString()}đ (Stock:{' '}
                                        {size.stock})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))
            ) : (
                <p>Đang tải sản phẩm...</p>
            )}
        </div>
    );
}

export default Product;
