import React, { useState, useEffect, useRef } from 'react';

const cn = (...classes: string[]) => classes.filter(Boolean).join(' ');

const NewBagsSection: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 200); 
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const getRectangleSize = () => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        const rectangleWidth = screenWidth * 0.28;
        const rectangleHeight = screenHeight * 0.86;

        return { width: rectangleWidth, height: rectangleHeight };
    };

    const rectangleSize = getRectangleSize();

    const commonStyle = {
        width: isScrolled ? `${rectangleSize.width}px` : '0px',
        height: isScrolled ? `${rectangleSize.height}px` : 'auto',
      transition: 'width 1.5s ease-in-out, height 1.5s ease-in-out',
    };

    return (
        <div className="flex flex-col items-center ">
            <div
                className="flex justify-center items-start transition-[align-items] duration-1500"
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
            style={ commonStyle }
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
                        width: isScrolled
                            ? `${rectangleSize.width}px`
                            : ' 99vw',
                        height: isScrolled
                            ? `${rectangleSize.height}px`
                            : '100vh',
                        transition:
                        'width 1.5s ease-in-out, height 1.5s ease-in-out',
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
            <div className="mt-[4vw] text-center">
                <h2 className="text-[1.5vw] font-serif w-[40vw] text-slate-600 tracking-[.1em]">
                    Enter a realm of starlight, where she reigns as the supreme
                    star, gracefully enchanting with every sway.
                </h2>
            </div>

            <div className="w-full h-auto flex justify-center items-center mt-[10vw]">
                <img
                    src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1744783167/Betterimage.ai_1744782971571_kp9shu.jpg"
                    alt=""
                />
            </div>
            <div className="w-full h-auto flex justify-center items-center mt-[10vw]">
                <img
                    src="https://res.cloudinary.com/dvsg1fr4g/image/upload/v1744738279/Betterimage.ai_1744738215096_xdyp9z.jpg"
                    alt=""
                />
            </div>
        </div>
    );
};

export default NewBagsSection;
