import React, { useState, useEffect, useRef } from 'react';

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const NewBagsSection: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 40);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const rectangleWidth = 480;
    const rectangleHeight = 740;

    const commonStyle = {
        width: isScrolled ? `${rectangleWidth}px` : '0px',
        height: isScrolled ? `${rectangleHeight}px` : 'auto',
        transition: 'width 1.5s ease-in-out, height 1.5s ease-in-out',
    };

    return (
        <div className="flex flex-col items-center">
            <div
                className="flex justify-center items-start transition-[align-items] duration-1500 h-[1500px]"
                style={{
                    alignItems: isScrolled ? 'center' : 'normal',
                }}
            >
                {/* Left Image */}
                <div
                    className={cn(
                        'flex relative transition-opacity duration-1500',
                        isScrolled ? 'opacity-100' : 'opacity-0',
                    )}
                    style={commonStyle}
                >
                    <img
                        src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1744715921/snapedit_1744715875579_eobfhm.png"
                        alt="Left Bag"
                        className="object-cover w-full h-full"
                    />
                </div>

                {/* Video */}
                <div
                    className={cn(
                        'flex relative justify-center items-center transition-all duration-2000 ease-in-out',
                        isScrolled ? 'opacity-100' : 'opacity-100',
                    )}
                    style={{
                        width: isScrolled ? `${rectangleWidth}px` : '99vw',
                        height: isScrolled ? `${rectangleHeight}px` : '100vh',
                        transition:
                            'width 1.8s ease-in-out, height 1.8s ease-in-out',
                    }}
                >
                    <video
                        ref={videoRef}
                        src="https://res.cloudinary.com/dvsg1fr4g/video/upload/v1744715417/0415_mpcwmy.mp4"
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="object-cover w-full h-full"
                    />
                </div>

                {/* Right Image */}
                <div
                    className={cn(
                        'flex relative transition-opacity duration-1500 ease-in-out',
                        isScrolled ? 'opacity-100' : 'opacity-0',
                    )}
                    style={commonStyle}
                >
                    <img
                        src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1744716689/snapedit_1744716644486_dmzqtb.png"
                        alt="Right Bag"
                        className="object-cover w-full h-full"
                    />
                </div>
            </div>

            {/* Scroll Content */}
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
