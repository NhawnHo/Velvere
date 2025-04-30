import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('search') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [sortOption, setSortOption] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('http://localhost:3000/api/products')
            .then((res) => res.json())
            .then((data) => {
                setProducts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Fetch error:', err);
                setLoading(false);
            });
    }, []);

    // Lọc sản phẩm theo filter và từ khóa tìm kiếm
    const getFilteredProducts = () => {
        let filtered = products;

        // Lọc theo giới tính (nam/nữ)
        if (activeFilter !== 'all') {
            filtered = filtered.filter(
                (product) => product.sex.toLowerCase() === activeFilter,
            );
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (product) =>
                    product.product_name.toLowerCase().includes(query) ||
                    product.description.toLowerCase().includes(query) ||
                    product.chatLieu.toLowerCase().includes(query) ||
                    product.xuatXu.toLowerCase().includes(query),
            );
        }

        return filtered;
    };

    // Sắp xếp sản phẩm
    const getSortedProducts = () => {
        const filtered = getFilteredProducts();
        if (sortOption === 'price-asc') {
            return [...filtered].sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
            return [...filtered].sort((a, b) => b.price - a.price);
        } else if (sortOption === 'name') {
            return [...filtered].sort((a, b) =>
                a.product_name.localeCompare(b.product_name),
            );
        }
        return filtered;
    };

    // Danh sách sản phẩm đã lọc và sắp xếp
    const displayedProducts = getSortedProducts();

    return (
        <div className="bg-white min-h-screen">
            {/* Banner */}
            <div className="bg-gray-100 py-12 px-4 mb-8">
                <div className="container mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-2">
                        BỘ SƯU TẬP
                    </h1>
                    {searchQuery ? (
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Kết quả tìm kiếm cho: "{searchQuery}"
                        </p>
                    ) : (
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Khám phá những thiết kế độc đáo và đẳng cấp từ bộ
                            sưu tập mới nhất của Vélvere
                        </p>
                    )}
                </div>
            </div>

            {/* Container chính */}
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Filter và sorting */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-4">
                    <div className="flex space-x-4 mb-4 md:mb-0">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeFilter === 'all'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setActiveFilter('male')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeFilter === 'male'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            Nam
                        </button>
                        <button
                            onClick={() => setActiveFilter('female')}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${
                                activeFilter === 'female'
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-500 hover:text-black'
                            }`}
                        >
                            Nữ
                        </button>
                    </div>
                    <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-2">
                            Sắp xếp theo:
                        </span>
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="border border-gray-200 rounded py-1 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        >
                            <option value="">Mặc định</option>
                            <option value="price-asc">Giá: Thấp đến cao</option>
                            <option value="price-desc">
                                Giá: Cao đến thấp
                            </option>
                            <option value="name">Tên sản phẩm</option>
                        </select>
                    </div>
                </div>

                {/* Hiển thị số lượng sản phẩm */}
                <div className="text-sm text-gray-500 mb-6">
                    Hiển thị {displayedProducts.length} sản phẩm
                </div>

                {/* Danh sách sản phẩm */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {displayedProducts.length > 0 ? (
                            displayedProducts.map((product) => {
                                const totalStock = product.variants.reduce(
                                    (sum, variant) => sum + variant.stock,
                                    0,
                                );
                                const isLowStock =
                                    totalStock > 0 && totalStock < 10;
                                const isOutOfStock = totalStock === 0;

                                return (
                                    <Link
                                        to={`/product/${product._id}`}
                                        key={product.product_id}
                                        className="group"
                                    >
                                        <div className="relative overflow-hidden rounded-sm mb-3 aspect-[3/4] bg-gray-50">
                                            {/* Badge cho sản phẩm */}
                                            {isOutOfStock && (
                                                <div className="absolute top-2 left-2 bg-gray-700 text-white text-xs uppercase py-1 px-2 z-10">
                                                    Hết hàng
                                                </div>
                                            )}
                                            {product.product_id % 5 === 0 &&
                                                !isOutOfStock && (
                                                    <div className="absolute top-2 left-2 bg-black text-white text-xs uppercase py-1 px-2 z-10">
                                                        Mới
                                                    </div>
                                                )}
                                            {isLowStock && !isOutOfStock && (
                                                <div className="absolute top-2 right-2 bg-red-600 text-white text-xs uppercase py-1 px-2 z-10">
                                                    Sắp hết hàng
                                                </div>
                                            )}

                                            {/* Hình ảnh sản phẩm với hiệu ứng hover */}
                                            <img
                                                src={product.images[0]}
                                                alt={`${product.product_name}`}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />

                                            {/* Nút mua nhanh */}
                                            <div className="absolute bottom-0 left-0 w-full p-3 bg-black bg-opacity-0 group-hover:bg-opacity-70 transform translate-y-full group-hover:translate-y-0 transition-all duration-300">
                                                <button className="w-full py-2 bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors">
                                                    XEM CHI TIẾT
                                                </button>
                                            </div>
                                        </div>

                                        {/* Thông tin sản phẩm */}
                                        <div className="space-y-1 px-1">
                                            <h3 className="font-medium text-gray-900 group-hover:text-black transition-colors">
                                                {product.product_name}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-1">
                                                {product.chatLieu}
                                            </p>
                                            <p className="font-medium text-black">
                                                {product.price.toLocaleString()}
                                                ₫
                                            </p>

                                            {/* Biến thể có sẵn */}
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {Array.from(
                                                    new Set(
                                                        product.variants.map(
                                                            (v) => v.color,
                                                        ),
                                                    ),
                                                )
                                                    .slice(0, 4)
                                                    .map((color, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="w-3 h-3 rounded-full border"
                                                            style={{
                                                                backgroundColor:
                                                                    color.toLowerCase(),
                                                            }}
                                                        ></div>
                                                    ))}
                                                {Array.from(
                                                    new Set(
                                                        product.variants.map(
                                                            (v) => v.color,
                                                        ),
                                                    ),
                                                ).length > 4 && (
                                                    <span className="text-xs text-gray-500">
                                                        +
                                                        {Array.from(
                                                            new Set(
                                                                product.variants.map(
                                                                    (v) =>
                                                                        v.color,
                                                                ),
                                                            ),
                                                        ).length - 4}{' '}
                                                        màu
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-10">
                                {searchQuery ? (
                                    <div>
                                        <p className="text-gray-500 mb-2">
                                            Không tìm thấy sản phẩm nào phù hợp
                                            với từ khóa "{searchQuery}"
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Vui lòng thử lại với từ khóa khác
                                            hoặc xem tất cả sản phẩm của chúng
                                            tôi
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        Không tìm thấy sản phẩm nào phù hợp với
                                        bộ lọc.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination (giả) */}
                {displayedProducts.length > 0 && (
                    <div className="flex justify-center mt-12 mb-8">
                        <div className="flex space-x-1">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white">
                                1
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                                2
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                                3
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                                <span className="sr-only">Next</span>
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Product;
