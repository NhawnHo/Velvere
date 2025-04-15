import React, { useEffect, useState } from 'react';
import userIcon from '../assets/user.png';
import shoppingBag from '../assets/shopping-bag.png';
import search from '../assets/search.png';
import menu from '../assets/menu.png'

const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 10); // giảm ngưỡng để phản hồi nhanh hơn
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <div className="relative h-[2000px] flex flex-wrap">
            {/* Ảnh nền (tùy chọn bật lại nếu cần) */}
            {/* 
            <div className="absolute inset-0 h-screen w-full -z-10">
                <img
                    src="src/assets/banner.png"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
            </div> 
            */}

            {/* Header có nút Account */}
            <div
                className={`fixed top-0 w-full h-20 z-40 
                    flex items-center justify-end px-8
                    transition-colors duration-900
                    ${
                        scrolled
                            ? 'bg-black backdrop-blur-md shadow-md'
                            : 'bg-transparent'
                    }
                `}
            >
                <div
                    className={`
        flex flex-auto justify-end items-end gap-x-10
        transition-opacity duration-500 ease-in-out
        ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}
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

            {/* Logo */}
            <h1
                className={`
        fixed left-1/2 transform -translate-x-1/2 
        transition-all duration-800 ease-in-out z-50 
        font-serif uppercase 
        ${
            scrolled
                ? 'top-5 text-[2.5vw] tracking-normal text-white '
                : 'top-1/2 -translate-y-1/2 text-[12vw] tracking-[0.2em] text-black'
        }
    `}
            >
                VÉLVERE
            </h1>

            {/* Nội dung trang (tùy chọn bật lại nếu cần) */}
            {/* 
            <div className="pt-[100vh] text-center text-xl text-black px-4">
                <p>Scroll xuống để thấy hiệu ứng của logo!</p>
                <p className="mt-10">Nội dung trang tiếp theo...</p>
            </div> 
            */}
        </div>
    );
};

export default Header;
