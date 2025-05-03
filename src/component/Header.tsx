import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [expandedSubMenu, setExpandedSubMenu] = useState<string | null>(null);

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
            const filteredProducts = products.filter((product) =>
                product.product_name
                    .toLowerCase()
                    .includes(query.toLowerCase()),
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

        onScroll(); // 👉 gọi ngay lần đầu để set chính xác trạng thái scrolled

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
                        <Link to="/contact" className="ml-[1vw]">
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
                        <Link to="/">
                            {/* Consider using Link from react-router-dom if this is an internal link */}
                            VÉLVERE
                        </Link>
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
                            <i className="fa-solid fa-bag-shopping text-gray-100 hover:text-gray-400 transition cursor-pointer" />
                            {totalItems > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {totalItems > 99 ? '99+' : totalItems}
                                </span>
                            )}
                        </Link>
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="user-icon-button"
                                aria-label="User account menu"
                            >
                                <i className="fa-solid fa-user text-gray-100 hover:text-gray-400 transition cursor-pointer" />

                                {/* <img
                                    src={userIcon}
                                    alt="User"
                                    className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px] "
                                /> */}
                            </button>
                            {showUserMenu && (
                                <UserDropdownMenu
                                    user={user}
                                    setUser={setUser}
                                />
                            )}
                        </div>

                        <button
                            onClick={() => setShowSearchPanel(true)}
                            aria-label="Open search"
                        >
                            {' '}
                            {/* Added aria-label */}
                            <i className="fa-solid fa-magnifying-glass text-gray-100 hover:text-gray-400 transition cursor-pointer"></i>
                            {/* <img
                                src={search}
                                alt="Search"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            /> */}
                        </button>

                        <button
                            onClick={() => setShowSideMenu(true)}
                            aria-label="Open menu"
                        >
                            {' '}
                            {/* Added aria-label */}
                            <i className="fa-solid fa-bars text-gray-100 hover:text-gray-400 transition cursor-pointer"></i>
                            {/* <img
                                src={menu}
                                alt="Menu"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            /> */}
                        </button>
                    </div>
                </div>

                {isHomePage && (
                    <a
                        href="#"
                        // Consider using Link from react-router-dom if this is an internal link
                        className="top-0 w-full z-40 flex justify-center items-center h-16 text-gray-700 tracking-widest group relative hover:text-black transition-colors duration-300"
                    >
                        Book an appointment now
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

            {/* Side Menu */}
            <AnimatePresence>
                {showSideMenu && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-0 left-0 w-full h-full bg-black/40 z-40"
                            onClick={() => setShowSideMenu(false)}
                            aria-hidden="true"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-0 right-0 h-full w-[80vw] sm:w-[60vw] md:w-[40vw] bg-white z-50 shadow-lg"
                            role="dialog"
                            aria-modal="true"
                        >
                            <div className="p-4 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Menu</h2>
                                <button
                                    onClick={() => setShowSideMenu(false)}
                                    aria-label="Close menu"
                                >
                                    <i className="fa-solid fa-xmark text-lg text-gray-600"></i>
                                </button>
                            </div>
                            <ul className="flex flex-col" role="menu">
                                <li role="none">
                                    <Link
                                        to="/productPage"
                                        onClick={() => setShowSideMenu(false)}
                                        className="block w-full px-6 py-3 hover:bg-gray-100"
                                        role="menuitem"
                                    >
                                        Sản phẩm
                                    </Link>
                                </li>
                                <li role="none">
                                    <button
                                        onClick={() => toggleMenu('men')}
                                        className="w-full px-6 py-3 text-left hover:bg-gray-100 flex justify-between items-center"
                                        aria-expanded={expandedMenu === 'men'}
                                        aria-controls="men-submenu"
                                    >
                                        Thời trang Nam
                                        <i
                                            className={`fa-solid ${
                                                expandedMenu === 'men'
                                                    ? 'fa-chevron-up'
                                                    : 'fa-chevron-down'
                                            }`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {expandedMenu === 'men' && (
                                        <ul
                                            className="pl-8 text-sm text-gray-700"
                                            role="menu"
                                            id="men-submenu"
                                        >
                                            {/* Áo Sub-Submenu */}
                                            <li role="none">
                                                <button
                                                    onClick={() =>
                                                        setExpandedSubMenu(
                                                            (prev) =>
                                                                prev ===
                                                                'men-ao' // Use a unique key for the men's 'Áo' submenu
                                                                    ? null
                                                                    : 'men-ao',
                                                        )
                                                    }
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center" // Added flex for spacing icon
                                                    aria-expanded={
                                                        expandedSubMenu ===
                                                        'men-ao'
                                                    } // Add aria-expanded
                                                    aria-controls="men-ao-sub-submenu" // Add aria-controls
                                                >
                                                    Áo
                                                    <i
                                                        className={`ml-2 fa-solid ${
                                                            expandedSubMenu ===
                                                            'men-ao'
                                                                ? 'fa-chevron-up'
                                                                : 'fa-chevron-down'
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                                {expandedSubMenu ===
                                                    'men-ao' && (
                                                    <ul
                                                        className="pl-4 text-sm text-gray-700"
                                                        role="menu" // Add role="menu"
                                                        id="men-ao-sub-submenu" // Add id
                                                    >
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=vest"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo vest
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=aothun"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo thun
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=aosomi"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo sơ mi
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=aolen"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo len
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=aokhoac"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo khoác
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                )}
                                            </li>
                                            {/* Phụ kiện Sub-Submenu */}
                                            <li role="none">
                                                <button
                                                    onClick={() =>
                                                        setExpandedSubMenu(
                                                            (prev) =>
                                                                prev ===
                                                                'men-phukien' // Use a unique key for the men's 'Phụ kiện' submenu
                                                                    ? null
                                                                    : 'men-phukien',
                                                        )
                                                    }
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center" // Added flex for spacing icon
                                                    aria-expanded={
                                                        expandedSubMenu ===
                                                        'men-phukien'
                                                    } // Add aria-expanded
                                                    aria-controls="men-phukien-sub-submenu" // Add aria-controls
                                                >
                                                    Phụ kiện
                                                    <i
                                                        className={`ml-2 fa-solid ${
                                                            expandedSubMenu ===
                                                            'men-phukien'
                                                                ? 'fa-chevron-up'
                                                                : 'fa-chevron-down'
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                                {expandedSubMenu ===
                                                    'men-phukien' && ( // Correct conditional rendering
                                                    <ul
                                                        className="pl-4 text-sm text-gray-700"
                                                        role="menu" // Add role="menu"
                                                        id="men-phukien-sub-submenu" // Add id
                                                    >
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=mu"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Mũ
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=thatlung"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Thắt lưng
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=khanchoang"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Khăn choàng
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=tui"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Túi
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nam&category_id=trangsuc"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Trang sức
                                                            </Link>
                                                        </li>
                                                    </ul>
                                                )}
                                            </li>
                                            {/* Quần Link */}
                                            <li role="none">
                                                <Link
                                                    to="/productPage?sex=Nam&category_id=quan"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Quần
                                                </Link>
                                            </li>
                                            {/* Giày Link */}
                                            <li role="none">
                                                <Link
                                                    to="/productPage?sex=Nam&category_id=giay"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Giày
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                                <li role="none">
                                    <button
                                        onClick={() => toggleMenu('women')} // Toggles the main women's menu
                                        className="w-full px-6 py-3 text-left hover:bg-gray-100 flex justify-between items-center"
                                        aria-expanded={expandedMenu === 'women'}
                                        aria-controls="women-submenu"
                                    >
                                        Thời trang Nữ
                                        <i
                                            className={`fa-solid ${
                                                expandedMenu === 'women'
                                                    ? 'fa-chevron-up'
                                                    : 'fa-chevron-down'
                                            }`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {expandedMenu === 'women' && (
                                        <ul
                                            className="pl-8 text-sm text-gray-700"
                                            role="menu"
                                            id="women-submenu"
                                        >
                                            {/* Áo Sub-Submenu for Women */}
                                            <li role="none">
                                                <button
                                                    onClick={() =>
                                                        setExpandedSubMenu(
                                                            (prev) =>
                                                                prev ===
                                                                'women-ao' // Unique key for women's 'Áo' submenu
                                                                    ? null
                                                                    : 'women-ao',
                                                        )
                                                    }
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                                                    aria-expanded={
                                                        expandedSubMenu ===
                                                        'women-ao'
                                                    } // aria-expanded matches the state key
                                                    aria-controls="women-ao-sub-submenu" // aria-controls matches the sub-submenu id
                                                >
                                                    Áo
                                                    <i
                                                        className={`ml-2 fa-solid ${
                                                            expandedSubMenu ===
                                                            'women-ao'
                                                                ? 'fa-chevron-up'
                                                                : 'fa-chevron-down'
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                                {expandedSubMenu ===
                                                    'women-ao' && ( // Conditional rendering based on women's 'Áo' key
                                                    <ul
                                                        className="pl-4 text-sm text-gray-700"
                                                        role="menu"
                                                        id="women-ao-sub-submenu" // Unique id for the sub-submenu
                                                    >
                                                        {/* Example women's topwear categories - Updated paths */}
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=aovest"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo vest
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=aothun"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo thun
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=aosomi"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo sơ mi
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=aolen"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo len
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=aokhoac"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Áo khoác
                                                            </Link>
                                                        </li>
                                                        {/* Add other women's topwear links here */}
                                                    </ul>
                                                )}
                                            </li>

                                            {/* Đầm Sub-Submenu for Women */}
                                            <li role="none">
                                                <button
                                                    onClick={() =>
                                                        setExpandedSubMenu(
                                                            (prev) =>
                                                                prev ===
                                                                'women-dam' // Unique key for women's 'Đầm' submenu
                                                                    ? null
                                                                    : 'women-dam',
                                                        )
                                                    }
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                                                    aria-expanded={
                                                        expandedSubMenu ===
                                                        'women-dam'
                                                    } // aria-expanded matches the state key
                                                    aria-controls="women-dam-sub-submenu" // aria-controls matches the sub-submenu id
                                                >
                                                    Đầm
                                                    <i
                                                        className={`ml-2 fa-solid ${
                                                            expandedSubMenu ===
                                                            'women-dam'
                                                                ? 'fa-chevron-up'
                                                                : 'fa-chevron-down'
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                                {expandedSubMenu ===
                                                    'women-dam' && ( // Conditional rendering based on women's 'Đầm' key
                                                    <ul
                                                        className="pl-4 text-sm text-gray-700"
                                                        role="menu"
                                                        id="women-dam-sub-submenu" // Unique id for the sub-submenu
                                                    >
                                                        {/* Women's dress categories - Updated paths */}
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=dambody"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Đầm body
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=damcongso"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Đầm công sở
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=damdahoi"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Đầm dạ hội
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=vay" // Assuming 'vay' maps to skirts
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Váy
                                                            </Link>
                                                        </li>
                                                        {/* Add other women's dress/skirt links here */}
                                                    </ul>
                                                )}
                                            </li>

                                            {/* Phụ kiện Sub-Submenu for Women */}
                                            <li role="none">
                                                <button
                                                    onClick={() =>
                                                        setExpandedSubMenu(
                                                            (prev) =>
                                                                prev ===
                                                                'women-phukien' // Unique key for women's 'Phụ kiện' submenu
                                                                    ? null
                                                                    : 'women-phukien',
                                                        )
                                                    }
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                                                    aria-expanded={
                                                        expandedSubMenu ===
                                                        'women-phukien'
                                                    } // aria-expanded matches the state key
                                                    aria-controls="women-phukien-sub-submenu" // aria-controls matches the sub-submenu id
                                                >
                                                    Phụ kiện
                                                    <i
                                                        className={`ml-2 fa-solid ${
                                                            expandedSubMenu ===
                                                            'women-phukien'
                                                                ? 'fa-chevron-up'
                                                                : 'fa-chevron-down'
                                                        }`}
                                                        aria-hidden="true"
                                                    />
                                                </button>
                                                {expandedSubMenu ===
                                                    'women-phukien' && ( // Conditional rendering based on women's 'Phụ kiện' key
                                                    <ul
                                                        className="pl-4 text-sm text-gray-700"
                                                        role="menu"
                                                        id="women-phukien-sub-submenu" // Unique id for the sub-submenu
                                                    >
                                                        {/* Women's accessories categories - Updated paths */}
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=mu"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Mũ
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=thatlung"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Thắt lưng
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=khanchoang"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Khăn choàng
                                                            </Link>
                                                        </li>

                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=tui"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Túi
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=trangsuc"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Trang sức
                                                            </Link>
                                                        </li>
                                                        <li role="none">
                                                            <Link
                                                                to="/productPage?sex=Nữ&category_id=phukien"
                                                                onClick={() =>
                                                                    setShowSideMenu(
                                                                        false,
                                                                    )
                                                                }
                                                                className="block px-4 py-2 hover:bg-gray-100"
                                                                role="menuitem"
                                                            >
                                                                Phụ kiện
                                                            </Link>
                                                        </li>
                                                        {/* Add other women's accessory links here */}
                                                    </ul>
                                                )}
                                            </li>
                                            {/* Quần Link for Women */}
                                            <li role="none">
                                                <Link
                                                    to="/productPage?sex=Nữ&category_id=quan"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Quần
                                                </Link>
                                            </li>

                                            {/* Giày Link for Women */}
                                            <li role="none">
                                                <Link
                                                    to="/productPage?sex=Nữ&category_id=giay"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem"
                                                >
                                                    Giày
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                            </ul>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
