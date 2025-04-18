import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import userIcon from '../assets/user.png';
import shoppingBag from '../assets/shopping-bag.png';
import search from '../assets/search.png';
import menu from '../assets/menu.png';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        if (!isHomePage) return; // Chỉ lắng nghe scroll ở trang chủ
        const onScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [isHomePage]);

    return (
        <div className="relative h-[4.5vw] flex flex-wrap bg-gray-100">
            {/* Header cố định */}
            <div
                className={`fixed top-0 w-full h-[6vw] z-40
                    flex items-center justify-end px-[3vw]
                    transition-colors duration-1000
                    ${
                        isHomePage
                            ? scrolled
                                ? 'bg-black backdrop-blur-md shadow-md'
                                : 'bg-transparent'
                            : 'bg-black backdrop-blur-md shadow-md' // 👈 Luôn có background đen ở trang khác
                    }
                `}
            >
                <div
                    className={`fixed top-0 w-full h-[6vw] z-40
                    flex items-center justify-between px-[3vw]
                    transition-colors duration-1000
                    ${
                        isHomePage
                            ? scrolled
                                ? 'bg-black backdrop-blur-md shadow-md'
                                : 'bg-transparent'
                            : 'bg-black backdrop-blur-md shadow-md'
                    }
                `}
                >
                    <div className="flex items-center">
                        <Link
                            to="/contact"
                            className="duration-800 cursor-pointer ml-[3vw]"
                        >
                           
                            <i className="fa-solid fa-phone text-gray-100 hover:text-gray-400 transition items-start" />
                        </Link>
                    </div>

                    <div
                        className={`flex items-end gap-x-10
                        transition-opacity duration-500 ease-in-out
                        ${
                            isHomePage
                                ? scrolled
                                    ? 'opacity-100'
                                    : 'opacity-0 pointer-events-none'
                                : 'opacity-100'
                        }
                    `}
                    >
                        <button className="duration-800 cursor-pointer">
                            <img
                                src={shoppingBag}
                                alt="Shopping Bag Icon"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px] duration-800"
                            />
                        </button>
                        <button className="duration-800 cursor-pointer">
                            <img
                                src={userIcon}
                                alt="User Icon"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px] duration-800"
                            />
                        </button>
                        <button className="duration-800 cursor-pointer">
                            <img
                                src={search}
                                alt="Search Icon"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px] duration-800 "
                            />
                        </button>
                        <button className="duration-800 cursor-pointer">
                            <img
                                src={menu}
                                alt="menu Icon"
                                className="w-[2vw] h-[2vw] max-w-[22px] max-h-[22px] duration-800 "
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Dòng "BOOK NOW" */}
            {isHomePage && (
                <a
                    href="#"
                    className="top-0 w-full z-50 flex justify-center items-center h-16 text-gray-700 tracking-widest group relative hover:text-black transition-colors duration-300"
                >
                    Book an appointment now
                    <span className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-[1px] bg-gray-700 transition-all duration-500 ease-in-out group-hover:w-1/6" />
                </a>
            )}

            {/* Logo */}
            <h1
                className={`fixed left-1/2 transform -translate-x-1/2 transition-all duration-800 ease-in-out z-50 font-serif uppercase ${
                    isHomePage
                        ? scrolled
                            ? 'top-5 text-[2.5vw] tracking-normal text-white'
                            : 'top-1/4 -translate-y-1/2 text-[12vw] tracking-[0.2em] text-white'
                        : 'top-5 text-[2.5vw] tracking-normal text-white' // 👈 Logo nhỏ hơn và luôn hiển thị ở trang khác
                }`}
            >
                VÉLVERE
            </h1>
        </div>
    );
};

export default Header;
