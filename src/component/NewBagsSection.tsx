import React, { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button'; // Giả sử bạn có component Button này
// import { cn } from '@/lib/utils'; // Giả sử bạn có tiện ích này

// interface Bag {
//     name: string;
//     shopLink: string;
// }

// Giả định triển khai đơn giản của các hàm bị thiếu
const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');
// const Button: React.FC<any> = ({ children, className, ...props }) => (
//     <button className={className} {...props}>
//         {children}
//     </button>
// );

const NewBagsSection: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const rectangleWidth = 500;
    const rectangleHeight = 600;

    return (
        <div className="flex flex-col">
            <div
                className="flex  gap-2 transition-all duration-1000 h-[1000px]"
                style={{
                    alignItems: isScrolled ? 'center' : 'normal',
                }}
            >
                {/* Hình ảnh bên trái */}
                <div
                    className={cn(
                        'w-200 md:w-1/3 flex transition-all duration-1000 relative ',
                        isScrolled ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    <img
                        src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1744715921/snapedit_1744715875579_eobfhm.png"
                        alt="Left Bag"
                        className="object-cover w-full max-h-[80vh] transition-opacity duration-50"
                        style={{
                            width: isScrolled ? `${rectangleWidth}px` : '0vw',
                            height: isScrolled
                                ? `${rectangleHeight}px`
                                : 'auto',
                            transition: 'width 1s, height 1s',
                        }}
                    />
                </div>

                {/* Video ở giữa */}
                <div
                    className={cn(
                        'w-200 md:w-1/3 relative flex  transition-all duration-3000',
                        isScrolled
                            ? 'items-center justify-center'
                            : 'items-start justify-center md:w-100 w-full',
                    )}
                    style={{
                        width: isScrolled ? `${rectangleWidth}px ` : '1100vw ',
                        height: isScrolled ? `${rectangleHeight}px` : 'auto',
                        transition: 'width 1s, height 1s',
                    }}
                >
                    <video
                        ref={videoRef}
                        src="https://res.cloudinary.com/dvsg1fr4g/video/upload/v1744715417/0415_mpcwmy.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="object-cover w-full max-h-[80vh] transition-all duration-3000"
                        style={{
                            width: isScrolled ? `${rectangleWidth}px` : '100vw',
                            height: isScrolled
                                ? `${rectangleHeight}px`
                                : 'auto',
                            transition: 'width 1.5s, height 1.5s', // Thêm transition riêng cho width và height
                        }}
                    />
                </div>

                {/* Hình ảnh bên phải */}
                <div
                    className={cn(
                        'w-full md:w-1/3 flex justify-start transition-all duration-1000',
                        isScrolled ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    <img
                        src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1744716689/snapedit_1744716644486_dmzqtb.png"
                        alt="Right Bag"
                        className="object-cover w-200 max-h-[80vh] transition-all duration-2000"
                        style={{
                            width: isScrolled ? `${rectangleWidth}px` : '200vw',
                            height: isScrolled
                                ? `${rectangleHeight}px`
                                : 'auto',
                            transition: 'width 1s, height 1s', // Thêm transition riêng cho width và height
                        }}
                    />
                </div>
            </div>
            {/* Nội dung giả để tạo khoảng trống cuộn */}
            <div className="py-20 bg-gray-100 text-gray-800 text-center">
                <h2 className="text-3xl font-bold mb-4">
                    Cuộn xuống để xem hiệu ứng
                </h2>
                <p className="text-lg">
                    Đây là nội dung bổ sung để tạo hiệu ứng cuộn trang.
                </p>
                <p className="text-lg">
                    Bạn có thể thêm bất kỳ nội dung nào ở đây, ví dụ như hình
                    ảnh, văn bản, hoặc các thành phần khác.
                </p>
            </div>
        </div>
    );
};

export default NewBagsSection;
