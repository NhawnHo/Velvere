// ProductPage.tsx

import { useEffect, useState } from 'react';
import ProductCard from '../component/ProductCard';
import { useSearchParams } from 'react-router-dom';

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
    const [searchParams] = useSearchParams();
    const sex = searchParams.get('sex');
    const category = searchParams.get('category_id');

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
   useEffect(() => {
       const fetchProducts = async () => {
           const res = await fetch('http://localhost:3000/api/products');
           const data = await res.json();

           let filtered = data;

           if (sex) {
               filtered = filtered.filter((p: Product) => p.sex === sex);
           }
           if (category) {
               filtered = filtered.filter((p: Product) =>
                   p.category_id
                       ?.toLowerCase()
                       .includes(category.toLowerCase()),
               );
           }



           setProducts(filtered);
       };

       fetchProducts();
   }, [sex, category]);

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
