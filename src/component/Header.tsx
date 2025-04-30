import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import UserDropdownMenu from './UserDropdownMenu';

const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearchPanel, setShowSearchPanel] = useState(false);
    const [showSideMenu, setShowSideMenu] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const { totalItems } = useCart();

    // Thêm state user ở đây
    const [user, setUser] = useState<User | null>(null);

    // ✅ Thêm useEffect này để đọc user từ localStorage khi component mount
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser: User = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (error) {
                console.error('Failed to parse user from localStorage:', error);
                localStorage.removeItem('user'); // Clear invalid data
                localStorage.removeItem('token'); // Clear associated token
            }
        }
    }, []); // Dependency rỗng để chỉ chạy một lần khi mount

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
                        <div>
                            <button aria-label="Shopping bag">
                                {' '}
                                {/* Added aria-label */}
                                <i className="fa-solid fa-bag-shopping text-gray-100 hover:text-gray-400 transition cursor-pointer" />
                                {/* <img
                                src={shoppingBag}
                                alt="Bag"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px]"
                            /> */}
                            </button>
                        </div>
                        <div className="relative -mb-1.5" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="user-icon-button" // Added class for potential handleClickOutside improvement
                                aria-label="User account menu" // Added aria-label
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
                        Book an appointment now {/* Consider i18n */}
                        <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-gray-700 transition-all duration-500 group-hover:w-1/6" />
                    </a>
                )}
            </div>

            {/* Search Panel */}
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
                            aria-hidden="true" // Hide from screen readers when used as overlay
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-[6vw] right-0 h-full w-full md:w-[40vw] z-50 bg-white shadow-lg"
                            role="dialog" // Added ARIA role for dialog
                            aria-modal="true" // Indicate it's a modal
                        >
                            <div className="flex items-center justify-between p-4 border-b">
                                <button
                                    onClick={() => setShowSearchPanel(false)}
                                    className="text-gray-700 hover:text-black"
                                    aria-label="Close search panel" // Added aria-label
                                >
                                    <i className="fa-solid fa-xmark mr-2"></i>{' '}
                                    Close {/* Consider i18n */}
                                </button>
                                <i
                                    className="fa-solid fa-magnifying-glass text-gray-500"
                                    aria-hidden="true"
                                />{' '}
                                {/* Hide decorative icon from screen readers */}
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                <div className="flex items-center border-b pb-2">
                                    <i
                                        className="fa-solid fa-magnifying-glass mr-3 text-gray-500"
                                        aria-hidden="true"
                                    ></i>{' '}
                                    {/* Hide decorative icon */}
                                    <input
                                        type="text"
                                        placeholder="What are you looking for?" // Consider i18n
                                        className="w-full outline-none"
                                        aria-label="Search input" // Added aria-label if no visible label
                                    />
                                    <i
                                        className="fa-solid fa-arrow-right text-gray-400"
                                        aria-hidden="true"
                                    />{' '}
                                    {/* Hide decorative icon */}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-600 mb-2">
                                        Suggestions {/* Consider i18n */}
                                    </p>
                                    <ul className="text-gray-700 space-y-2 text-sm">
                                        <li>Lady Dior</li>{' '}
                                        {/* Consider i18n if these are dynamic */}
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
                            aria-hidden="true" // Hide from screen readers
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ duration: 0.3 }}
                            className="fixed top-0 right-0 h-full w-[80vw] sm:w-[60vw] md:w-[40vw] bg-white z-50 shadow-lg"
                            role="dialog" // Added ARIA role
                            aria-modal="true" // Indicate it's a modal
                        >
                            <div className="p-4 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold">Menu</h2>{' '}
                                {/* Consider i18n */}
                                <button
                                    onClick={() => setShowSideMenu(false)}
                                    aria-label="Close menu"
                                >
                                    {' '}
                                    {/* Added aria-label */}
                                    <i className="fa-solid fa-xmark text-lg text-gray-600"></i>
                                </button>
                            </div>
                            <ul className="flex flex-col" role="menu">
                                {' '}
                                {/* Added ARIA role */}
                                <li role="none">
                                    {' '}
                                    {/* Added ARIA role */}
                                    <Link
                                        to="/productPage"
                                        onClick={() => setShowSideMenu(false)}
                                        className="block w-full px-6 py-3 hover:bg-gray-100"
                                        role="menuitem" // Added ARIA role
                                    >
                                        Product {/* Consider i18n */}
                                    </Link>
                                </li>
                                <li role="none">
                                    {' '}
                                    {/* Added ARIA role */}
                                    <button
                                        onClick={() => toggleMenu('men')}
                                        className="w-full px-6 py-3 text-left hover:bg-gray-100 flex justify-between items-center"
                                        aria-expanded={expandedMenu === 'men'} // Added ARIA attribute
                                        aria-controls="men-submenu" // Added ARIA attribute (assuming submenu has this ID)
                                    >
                                        Thời trang Nam {/* Consider i18n */}
                                        <i
                                            className={`fa-solid ${
                                                expandedMenu === 'men'
                                                    ? 'fa-chevron-up'
                                                    : 'fa-chevron-down'
                                            }`}
                                            aria-hidden="true" // Hide decorative icon
                                        />
                                    </button>
                                    {expandedMenu === 'men' && (
                                        <ul
                                            className="pl-8 text-sm text-gray-700"
                                            role="menu"
                                            id="men-submenu"
                                        >
                                            {' '}
                                            {/* Added ARIA role and ID */}
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/men/ao"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Áo {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/men/quan"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Quần {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/men/mu"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Mũ {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/men/khan"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Khăn {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/men/thatlung"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Thắt lưng{' '}
                                                    {/* Consider i18n */}
                                                </Link>
                                            </li>
                                        </ul>
                                    )}
                                </li>
                                <li role="none">
                                    {' '}
                                    {/* Added ARIA role */}
                                    <button
                                        onClick={() => toggleMenu('women')}
                                        className="w-full px-6 py-3 text-left hover:bg-gray-100 flex justify-between items-center"
                                        aria-expanded={expandedMenu === 'women'} // Added ARIA attribute
                                        aria-controls="women-submenu" // Added ARIA attribute (assuming submenu has this ID)
                                    >
                                        Thời trang Nữ {/* Consider i18n */}
                                        <i
                                            className={`fa-solid ${
                                                expandedMenu === 'women'
                                                    ? 'fa-chevron-up'
                                                    : 'fa-chevron-down'
                                            }`}
                                            aria-hidden="true" // Hide decorative icon
                                        />
                                    </button>
                                    {expandedMenu === 'women' && (
                                        <ul
                                            className="pl-8 text-sm text-gray-700"
                                            role="menu"
                                            id="women-submenu"
                                        >
                                            {' '}
                                            {/* Added ARIA role and ID */}
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/women/ao"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Áo {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/women/quan"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Quần {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/women/mu"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Mũ {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/women/khan"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Khăn {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/women/thatlung"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Thắt lưng{' '}
                                                    {/* Consider i18n */}
                                                </Link>
                                            </li>
                                            <li role="none">
                                                {' '}
                                                {/* Added ARIA role */}
                                                <Link
                                                    to="/women/dam"
                                                    onClick={() =>
                                                        setShowSideMenu(false)
                                                    }
                                                    className="block px-4 py-2 hover:bg-gray-100"
                                                    role="menuitem" // Added ARIA role
                                                >
                                                    Đầm {/* Consider i18n */}
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
