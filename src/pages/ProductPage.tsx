import { useEffect, useState } from 'react';
import ProductCard from '../component/ProductCard';
import ProductData from '../data/products.json';

interface Product {
  title: string;
  images: string[];
  price: string;
  isNew?: boolean;
}

export default function ProductPage() {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        setProducts(ProductData);
    }, []);

    return (
        <div className="flex flex-row flex-wrap gap-5">
            {products.map((product, index) => (
                <ProductCard key={index} {...product} />
            ))}
        </div>
    );
}
