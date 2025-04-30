// ProductPage.tsx

import { useEffect, useState } from 'react';
import ProductCard from '../component/ProductCard';

interface Product {
    _id: string;
    product_name: string;
    description: string;
    category_id: string;
    sex: string;
    variants: {
        size: string;
        color: string;
        stock: number;
    }[];
    images: string[];
    price: number;
}

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(
                    'http://localhost:3000/api/products',
                );
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error('Error fetching products:', err);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div>
            <h1 className="text-lg text-center mt-10 text-gray-700">
                Tổng số lượng: {products.length}
            </h1>
            <div className="flex flex-row flex-wrap gap-5 justify-center">
                {products.map((product, index) => (
                    <ProductCard key={index} {...product} />
                ))}
            </div>
        </div>
    );
}
