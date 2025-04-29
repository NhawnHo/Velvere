'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardFooter } from '../my-card/components/ui/card';

interface ProductProps {
    images: string[];
    title: string;
    price: string;
    isNew?: boolean;
}

export default function ProductCard({
    images = ['/placeholder.svg?height=600&width=500'],
    title = 'Fitted Jacket',
    price = '125.000.000 đ',
    isNew = true,
}: ProductProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex(
            (prev) => (prev - 1 + images.length) % images.length,
        );
    };

    return (
        <Card className="w-full max-w-md mx-auto overflow-hidden border-0 rounded-xl">
            <div className="relative">
                {isNew && (
                    <div className="absolute top-4 left-4 text-gray-500 text-sm">
                        New
                    </div>
                )}

                <div className="relative h-[600px] w-full">
                    <img
                        src={images[currentImageIndex] || '/placeholder.svg'}
                        alt={title}
                        className="w-full h-full object-cover"
                    />

                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-700"
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-700"
                        aria-label="Next image"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

              
            </div>

            <CardFooter className="flex flex-col items-center pt-4 pb-6">
                <h3 className="text-lg font-medium text-center">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{price}</p>
            </CardFooter>
        </Card>
    );
}
