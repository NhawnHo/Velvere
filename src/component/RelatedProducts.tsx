import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';

interface Product {
    _id: string;
    product_name: string;
    description: string;
    category_id: string;
    sex: string;
    images: string[];
    price: number;
    xuatXu: string;
    chatLieu: string;
    variants: {
        size: string;
        color: string;
        stock: number;
    }[];
}

interface RelatedProductsProps {
    currentProductId: string; 
    categoryId: string; 
}

function RelatedProducts({
    currentProductId,
    categoryId,
}: RelatedProductsProps) {

    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Fetch tất cả sản phẩm từ API
        fetch('http://localhost:3000/api/products')
            .then((res) => {
                // Kiểm tra response có thành công không
                if (!res.ok) {
                    throw new Error('Failed to fetch products');
                }
                return res.json();
            })
            .then((data: Product[]) => {
                
                const filtered = data.filter(
                    (product) =>
                        product.category_id === categoryId &&
                        product._id !== currentProductId,
                );
                // Cập nhật state với danh sách sản phẩm đã lọc
                setRelatedProducts(filtered);
            })
            .catch((err) => console.error('Error fetching products:', err)); // Xử lý lỗi
    }, [categoryId, currentProductId]);

    
    if (relatedProducts.length == 0) {
        return null; 
    }
    return (
        <div className="flex flex-col items-center w-full justify-center mt-10">
            <p className="text-gray-700 text-2xl font-sans mb-4">
                Sản phẩm liên quan
            </p>
            <div className="flex flex-wrap justify-center gap-4">
          
                {relatedProducts.map((product) => (
                    <ProductCard key={product._id} {...product} />
                ))}
            </div>
        </div>
    );
}

// Export component để sử dụng ở nơi khác
export default RelatedProducts;
