import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import userIcon from '../assets/user.png';
import shoppingBag from '../assets/shopping-bag.png';
import search from '../assets/search.png';
import menu from '../assets/menu.png';
import UserDropdownMenu, { User } from './UserDropdownMenu';
import { useCart } from '../context/CartContext';

// Định nghĩa interface cho sản phẩm
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
}

// Định nghĩa interface cho mục gợi ý tìm kiếm
interface SearchSuggestion {
    text: string;
    category?: string;
}

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const { totalItems } = useCart();

    // Các state mới cho tính năng tìm kiếm
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([
        { text: 'Túi xách', category: 'Phụ kiện' },
        { text: 'Quý bà Dior', category: 'Thời trang' },
        { text: 'Ví', category: 'Phụ kiện' },
        { text: 'Khăn quàng cổ', category: 'Phụ kiện' },
        { text: 'Giày', category: 'Giày dép' },
        { text: 'Xô Caro', category: 'Phụ kiện' },
    ]);

    // Thêm state user
    const [user, setUser] = useState<User | null>(null);

    // Đọc user từ localStorage khi component mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser: User = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse user from localStorage:', error);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
    }, []);

    // Hàm tìm kiếm sản phẩm
    const searchProducts = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`http://localhost:3000/api/products`);
            if (!response.ok) throw new Error('Network response was not ok');

            const products: Product[] = await response.json();

            // Lọc sản phẩm dựa trên query
            const filteredProducts = products.filter(
                (product) =>
                    product.product_name
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                    product.description
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                    product.chatLieu
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                    product.xuatXu.toLowerCase().includes(query.toLowerCase()),
            );

            setSearchResults(filteredProducts);
        } catch (error) {
            console.error('Error searching products:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounce hàm tìm kiếm để tránh gọi API quá nhiều
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                searchProducts(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Xử lý khi người dùng nhấn Enter trong ô tìm kiếm
    const handleSearchSubmit = (
        e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent,
    ) => {
        if ('key' in e && e.key !== 'Enter') return;

        if (searchQuery.trim()) {
            setShowSearchPanel(false);
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Xử lý khi người dùng click vào một gợi ý
    const handleSuggestionClick = (suggestion: string) => {
        setSearchQuery(suggestion);
        setShowSearchPanel(false);
        navigate(`/products?search=${encodeURIComponent(suggestion)}`);
    };

    // Xử lý click vào kết quả tìm kiếm
    const handleSearchResultClick = (productId: string) => {
        setShowSearchPanel(false);
        navigate(`/product/${productId}`);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isHomePage) return;
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [isHomePage]);

    useEffect(() => {
        document.body.style.overflow =
            showSearchPanel || showSideMenu ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showSearchPanel, showSideMenu]);

    const toggleMenu = (menu: string) => {
        setExpandedMenu((prev) => (prev === menu ? null : menu));
    };

    return (
        <>
            <div className="relative h-[4.5vw] flex flex-wrap bg-gray-100">
                <div
                    className={`fixed top-0 w-full h-[6vw] z-40 flex items-center justify-between px-[3vw] transition-colors duration-1000
                        ${
                            isHomePage && !scrolled
                                ? 'bg-transparent'
                                : 'bg-black backdrop-blur-md shadow-md'
                        }`}
                >
                    <div className="flex items-center">
                        <Link to="/contact" className="ml-[3vw]">
                            <i className="fa-solid fa-phone text-gray-100 hover:text-gray-400 transition" />
                        </Link>
                    </div>

                    {/* Logo */}
                    <h1
                        className={`fixed left-1/2 transform -translate-x-1/2 z-50 font-serif uppercase transition-all duration-800 ease-in-out
                            ${
                                isHomePage && !scrolled
                                    ? 'top-1/4 -translate-y-1/2 text-[12vw] tracking-[0.2em]'
                                    : 'top-5 text-[2.5vw] tracking-normal'
                            }
                            text-white`}
                    >
                        VÉLVERE
                    </h1>

                    <div
                        className={`flex justify-center items-end gap-x-10 transition-opacity duration-500
                        ${
                            isHomePage && !scrolled
                                ? 'opacity-0 pointer-events-none'
                                : 'opacity-100'
                        }`}
                    >
                        <Link to="/cart" className="relative">
                            <img
                                src={shoppingBag}
                                alt="Bag"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </Link>
                        <div className="relative -mb-1.5" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="user-icon-button" // Added class for potential handleClickOutside improvement
                                aria-label="User account menu" // Added aria-label
                            >
                                <img
                                    src={userIcon}
                                    alt="User"
                                    className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px] "
                                />
                            </button>
                            {showUserMenu && (
                                <UserDropdownMenu
                                    user={user} // ✅ Truyền state user
                                    setUser={setUser} // ✅ Truyền hàm setUser
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setShowSearchPanel(true)}
                            aria-label="Open search"
                        >
                            {' '}
                            <img
                                src={search}
                                alt="Search"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            />
                        </button>

                        <button
                            onClick={() => setShowSideMenu(true)}
                            aria-label="Open menu"
                        >
                            {' '}
                            {/* Added aria-label */}
                            <img
                                src={menu}
                                alt="Menu"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            />
                        </button>
                    </div>
                </div>

                {isHomePage && (
                    <a
                        href="#"
                        // Consider using Link from react-router-dom if this is an internal link
                        className="top-0 w-full z-50 flex justify-center items-center h-16 text-gray-700 tracking-widest group relative hover:text-black transition-colors duration-300"
                    >
                        Book an appointment now {/* Consider i18n */}
                        <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-gray-700 transition-all duration-500 group-hover:w-1/6" />
                    </a>
                )}
            </div>

            {/* Search Panel - Đã được cập nhật */}
            <AnimatePresence>
                {showSearchPanel && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setShowSearchPanel(false)}
                            aria-hidden="true"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-[6vw] right-0 h-full w-full md:w-[40vw] z-50 bg-white shadow-lg"
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <button
                                    onClick={() => {
                                        setShowSearchPanel(false);
                                        setSearchQuery('');
                                        setSearchResults([]);
                                    }}
                                    className="text-gray-700 hover:text-black"
                                    aria-label="Đóng ô tìm kiếm"
                                >
                                    <i className="fa-solid fa-xmark mr-2"></i>
                                    Đóng
                                </button>
                                <i
                                    className="fa-solid fa-magnifying-glass text-gray-500"
                                    aria-hidden="true"
                                />
                            </div>
                            <div className="p-6 flex flex-col gap-4 h-[calc(100%-65px)] overflow-auto">
                                <div className="flex items-center border-b pb-2">
                                    <i
                                        className="fa-solid fa-magnifying-glass mr-3 text-gray-500"
                                        aria-hidden="true"
                                    ></i>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        onKeyDown={handleSearchSubmit}
                                        placeholder="Bạn đang tìm kiếm gì?"
                                        className="w-full outline-none"
                                        aria-label="Ô tìm kiếm"
                                        autoFocus
                                    />
                                    {isSearching ? (
                                        <div className="w-5 h-5 border-t-2 border-r-2 border-black rounded-full animate-spin mr-2"></div>
                                    ) : (
                                        searchQuery && (
                                            <button
                                                onClick={() =>
                                                    setSearchQuery('')
                                                }
                                                className="text-gray-400 hover:text-gray-600 mr-2"
                                                aria-label="Xóa tìm kiếm"
                                            >
                                                <i className="fa-solid fa-times"></i>
                                            </button>
                                        )
                                    )}
                                    <button
                                        onClick={handleSearchSubmit}
                                        className="text-gray-500 hover:text-black"
                                        aria-label="Tìm kiếm"
                                    >
                                        <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>

                                {/* Kết quả tìm kiếm */}
                                {searchQuery && searchResults.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-sm font-semibold text-gray-600 mb-3">
                                            Kết quả ({searchResults.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {searchResults
                                                .slice(0, 5)
                                                .map((product) => (
                                                    <div
                                                        key={product._id}
                                                        className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                                                        onClick={() =>
                                                            handleSearchResultClick(
                                                                product._id,
                                                            )
                                                        }
                                                    >
                                                        <img
                                                            src={
                                                                product
                                                                    .images[0]
                                                            }
                                                            alt={
                                                                product.product_name
                                                            }
                                                            className="w-16 h-16 object-cover rounded mr-3"
                                                        />
                                                        <div>
                                                            <h4 className="font-medium">
                                                                {
                                                                    product.product_name
                                                                }
                                                            </h4>
                                                            <p className="text-sm text-gray-500">
                                                                {product.price.toLocaleString()}
                                                                ₫
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}

                                            {searchResults.length > 5 && (
                                                <button
                                                    className="w-full text-center py-2 text-sm text-gray-600 hover:text-black"
                                                    onClick={() => {
                                                        setShowSearchPanel(
                                                            false,
                                                        );
                                                        navigate(
                                                            `/products?search=${encodeURIComponent(
                                                                searchQuery,
                                                            )}`,
                                                        );
                                                    }}
                                                >
                                                    Xem tất cả{' '}
                                                    {searchResults.length} kết
                                                    quả
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Hiển thị "Không tìm thấy kết quả" */}
                                {searchQuery &&
                                    searchResults.length === 0 &&
                                    !isSearching && (
                                        <div className="flex flex-col items-center justify-center py-8">
                                            <i className="fa-solid fa-search-minus text-4xl text-gray-300 mb-2"></i>
                                            <p className="text-gray-500">
                                                Không tìm thấy kết quả nào cho "
                                                {searchQuery}"
                                            </p>
                                            <p className="text-sm text-gray-400 mt-2">
                                                Hãy thử từ khóa khác hoặc duyệt
                                                danh mục sản phẩm của chúng tôi
                                            </p>
                                        </div>
                                    )}

                                {/* Gợi ý tìm kiếm */}
                                {(!searchQuery ||
                                    searchResults.length === 0) && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-600 mb-2">
                                            Gợi ý
                                        </p>
                                        <ul className="text-gray-700 space-y-2 text-sm">
                                            {suggestions.map(
                                                (suggestion, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                                                        onClick={() =>
                                                            handleSuggestionClick(
                                                                suggestion.text,
                                                            )
                                                        }
                                                    >
                                                        <span>
                                                            {suggestion.text}
                                                        </span>
                                                        {suggestion.category && (
                                                            <span className="text-xs text-gray-400">
                                                                {
                                                                    suggestion.category
                                                                }
                                                            </span>
                                                        )}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ... phần Side Menu giữ nguyên ... */}
        </>
    );
};

export default Header;
