import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import userIcon from '../assets/user.png';
import shoppingBag from '../assets/shopping-bag.png';
import search from '../assets/search.png';
import menu from '../assets/menu.png';

const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Ẩn dropdown user menu nếu click ra ngoài
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

    // Hiệu ứng scroll trên trang chủ
    useEffect(() => {
        if (!isHomePage) return;
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [isHomePage]);

    // Khóa scroll khi mở search panel
    useEffect(() => {
        if (showSearchPanel) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showSearchPanel]);

    return (
        <>
            <div className="relative h-[4.5vw] flex flex-wrap bg-gray-100">
                {/* Header */}
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

                    <div
                        className={`flex items-end gap-x-10 transition-opacity duration-500
                        ${
                            isHomePage && !scrolled
                                ? 'opacity-0 pointer-events-none'
                                : 'opacity-100'
                        }`}
                    >
                        <button>
                            <img
                                src={shoppingBag}
                                alt="Bag"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            />
                        </button>

                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                            >
                                <img
                                    src={userIcon}
                                    alt="User"
                                    className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                                />
                            </button>
                            {showUserMenu && (
                                <div className="absolute -right-42 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                                    <ul className="py-2 text-sm text-black">
                                        <li>
                                            <Link
                                                to="/signin"
                                                className="block px-4 py-2 hover:bg-gray-100"
                                            >
                                                SIGN IN
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/orders"
                                                className="block px-4 py-2 hover:bg-gray-100"
                                            >
                                                MY ORDERS
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                to="/account-settings"
                                                className="block px-4 py-2 hover:bg-gray-100"
                                            >
                                                ACCOUNT SETTINGS
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Nút mở thanh tìm kiếm */}
                        <button onClick={() => setShowSearchPanel(true)}>
                            <img
                                src={search}
                                alt="Search"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            />
                        </button>

                        <button>
                            <img
                                src={menu}
                                alt="Menu"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            />
                        </button>
                    </div>
                </div>

                {/* Book now */}
                {isHomePage && (
                    <a
                        href="#"
                        className="top-0 w-full z-50 flex justify-center items-center h-16 text-gray-700 tracking-widest group relative hover:text-black transition-colors duration-300"
                    >
                        Book an appointment now
                        <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-gray-700 transition-all duration-500 group-hover:w-1/6" />
                    </a>
                )}

                {/* Logo */}
                <h1
                    className={`fixed left-1/2 transform -translate-x-1/2 z-50 font-serif uppercase transition-all duration-800 ease-in-out
                    ${
                        isHomePage && !scrolled
                            ? 'top-1/4 -translate-y-1/2 text-[12vw] tracking-[0.2em]'
                            : 'top-5 text-[2.5vw] tracking-normal'
                    } text-white`}
                >
                    VÉLVERE
                </h1>
            </div>

            {/* Search panel + overlay */}
            <AnimatePresence>
                {showSearchPanel && (
                    <>
                        {/* Mờ nền + chặn tương tác */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-0 left-0 w-full h-full bg-black/40 backdrop-blur-sm z-40"
                            onClick={() => setShowSearchPanel(false)}
                        />

                        {/* Search panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-[6vw] right-0 h-full w-full md:w-[40vw] z-50 bg-white shadow-lg"
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <button
                                    onClick={() => setShowSearchPanel(false)}
                                    className="text-gray-700 hover:text-black"
                                >
                                    <i className="fa-solid fa-xmark mr-2"></i>
                                    Close
                                </button>
                                <i className="fa-solid fa-magnifying-glass text-gray-500" />
                            </div>

                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex items-center border-b pb-2">
                                    <i className="fa-solid fa-magnifying-glass mr-3 text-gray-500"></i>
                                    <input
                                        type="text"
                                        placeholder="What are you looking for?"
                                        className="w-full outline-none"
                                    />
                                    <i className="fa-solid fa-arrow-right text-gray-400" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">
                                        Suggestions
                                    </p>
                                    <ul className="text-gray-700 space-y-2 text-sm">
                                        <li>Lady Dior</li>
                                        <li>Wallet</li>
                                        <li>Earrings</li>
                                        <li>Shoes</li>
                                        <li>Scarf</li>
                                        <li>Caro bucket</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Header;
