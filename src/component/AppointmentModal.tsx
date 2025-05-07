'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AppointmentModal() {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [formSubmitted, setFormSubmitted] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Xử lý đóng modal khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    // Xử lý khóa scroll khi modal mở
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Xử lý logic gửi form ở đây
        setFormSubmitted(true);

        // Reset form sau 3 giây và đóng modal
        setTimeout(() => {
            setFormSubmitted(false);
            setOpen(false);
        }, 3000);
    };

    // Tạo mảng các ngày trong tháng hiện tại
    const getDaysInMonth = () => {
        if (!date) return [];

        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        // Tạo mảng các ngày trong tháng
        const days = [];

        // Thêm các ô trống cho các ngày trước ngày đầu tiên của tháng
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Thêm các ngày trong tháng
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const days = getDaysInMonth();

    // Tạo mảng tên các ngày trong tuần
    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Chuyển đến tháng trước
    const prevMonth = () => {
        if (date) {
            const newDate = new Date(date);
            newDate.setMonth(newDate.getMonth() - 1);
            setDate(newDate);
        }
    };

    // Chuyển đến tháng sau
    const nextMonth = () => {
        if (date) {
            const newDate = new Date(date);
            newDate.setMonth(newDate.getMonth() + 1);
            setDate(newDate);
        }
    };

    // Kiểm tra xem ngày có phải là ngày hiện tại không
    const isToday = (day: Date) => {
        const today = new Date();
        return (
            day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear()
        );
    };

    // Kiểm tra xem ngày có phải là ngày được chọn không
    const isSelected = (day: Date) => {
        if (!date) return false;
        return (
            day.getDate() === date.getDate() &&
            day.getMonth() === date.getMonth() &&
            day.getFullYear() === date.getFullYear()
        );
    };

    // Kiểm tra xem ngày có phải là ngày trong quá khứ không
    const isPastDay = (day: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return day < today;
    };

    // Format ngày tháng
    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div>
            {/* Nút mở modal */}
            <button
                onClick={() => setOpen(true)}
                className="bg-black hover:bg-gray-900 text-white font-medium px-6 py-3 rounded-3xl"
            >
                Book an Appointment Now
            </button>

            {/* Overlay - Thay đổi từ bg-black bg-opacity-50 thành bg-opacity-30 để có hiệu ứng mờ hơn */}
            {open && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
                    {/* Modal - Thay đổi max-height và thêm overflow-y-auto để có scroll */}
                    <div
                        ref={modalRef}
                        className="bg-white w-full max-w-[40vw] max-h-[46vw] relative my-6 overflow-y-auto"
                    >
                        {!formSubmitted ? (
                            <>
                                {/* Header */}
                                <div className="bg-black text-white p-6 relative sticky top-0 z-10">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="absolute right-6 top-6 text-white hover:text-gray-300"
                                    >
                                        <X className="h-5 w-5" />
                                        <span className="sr-only">Đóng</span>
                                    </button>
                                    <h2 className="text-2xl font-light tracking-wide text-center">
                                        BOOK AN APPOINTMENT
                                    </h2>
                                    <p className="text-gray-300 mt-2 text-sm text-center">
                                        Đặt lịch hẹn để được tư vấn trực tiếp về
                                        các sản phẩm của chúng tôi.
                                    </p>
                                </div>

                                {/* Form */}
                                <form
                                    onSubmit={handleSubmit}
                                    className="p-6 space-y-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="name"
                                                className="text-sm font-medium block"
                                            >
                                                Họ và tên
                                            </label>
                                            <input
                                                id="name"
                                                placeholder="Nhập họ và tên của bạn"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="email"
                                                className="text-sm font-medium block"
                                            >
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="email@example.com"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="phone"
                                                className="text-sm font-medium block"
                                            >
                                                Số điện thoại
                                            </label>
                                            <input
                                                id="phone"
                                                placeholder="Nhập số điện thoại của bạn"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label
                                                htmlFor="location"
                                                className="text-sm font-medium block"
                                            >
                                                Cửa hàng
                                            </label>
                                            <select
                                                id="location"
                                                defaultValue=""
                                                className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none"
                                            >
                                                <option value="" disabled>
                                                    Chọn cửa hàng
                                                </option>
                                                <option value="hanoi">
                                                    Hà Nội Flagship Store
                                                </option>
                                                <option value="hochiminh">
                                                    Hồ Chí Minh Luxury Mall
                                                </option>
                                                <option value="danang">
                                                    Đà Nẵng Boutique
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium block">
                                            Ngày hẹn
                                        </label>
                                        <div className="border border-gray-300 p-4 flex justify-center">
                                            {/* Calendar */}
                                            <div className="w-full max-w-[320px]">
                                                <div className="flex justify-between items-center mb-4">
                                                    <button
                                                        type="button"
                                                        onClick={prevMonth}
                                                        className="p-1 hover:bg-gray-100"
                                                    >
                                                        &lt;
                                                    </button>
                                                    <div className="font-medium">
                                                        {date &&
                                                            formatMonth(date)}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={nextMonth}
                                                        className="p-1 hover:bg-gray-100"
                                                    >
                                                        &gt;
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-7 gap-1 text-center">
                                                    {weekdays.map((day, i) => (
                                                        <div
                                                            key={i}
                                                            className="text-sm font-medium py-1"
                                                        >
                                                            {day}
                                                        </div>
                                                    ))}

                                                    {days.map((day, i) => (
                                                        <div
                                                            key={i}
                                                            className="aspect-square"
                                                        >
                                                            {day ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setDate(
                                                                            day,
                                                                        )
                                                                    }
                                                                    disabled={isPastDay(
                                                                        day,
                                                                    )}
                                                                    className={`w-full h-full flex items-center justify-center text-sm
                                    ${isToday(day) ? 'bg-gray-200' : ''}
                                    ${
                                        isSelected(day)
                                            ? 'bg-black text-white'
                                            : ''
                                    }
                                    ${
                                        isPastDay(day)
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'hover:bg-gray-100'
                                    }
                                  `}
                                                                >
                                                                    {day.getDate()}
                                                                </button>
                                                            ) : (
                                                                <div></div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="time"
                                            className="text-sm font-medium block"
                                        >
                                            Thời gian
                                        </label>
                                        <select
                                            id="time"
                                            defaultValue=""
                                            className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none"
                                        >
                                            <option value="" disabled>
                                                Chọn thời gian
                                            </option>
                                            <option value="10:00">
                                                10:00 AM
                                            </option>
                                            <option value="11:00">
                                                11:00 AM
                                            </option>
                                            <option value="14:00">
                                                2:00 PM
                                            </option>
                                            <option value="15:00">
                                                3:00 PM
                                            </option>
                                            <option value="16:00">
                                                4:00 PM
                                            </option>
                                            <option value="17:00">
                                                5:00 PM
                                            </option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="purpose"
                                            className="text-sm font-medium block"
                                        >
                                            Mục đích cuộc hẹn
                                        </label>
                                        <select
                                            id="purpose"
                                            defaultValue=""
                                            className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none"
                                        >
                                            <option value="" disabled>
                                                Chọn mục đích
                                            </option>
                                            <option value="shopping">
                                                Tư vấn mua sắm
                                            </option>
                                            <option value="styling">
                                                Tư vấn phong cách
                                            </option>
                                            <option value="fitting">
                                                Thử và chỉnh sửa
                                            </option>
                                            <option value="collection">
                                                Xem bộ sưu tập mới
                                            </option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label
                                            htmlFor="notes"
                                            className="text-sm font-medium block"
                                        >
                                            Ghi chú thêm
                                        </label>
                                        <textarea
                                            id="notes"
                                            placeholder="Nhập thông tin bổ sung nếu cần"
                                            className="w-full px-3 py-2 border border-gray-300 focus:border-black focus:outline-none min-h-[100px]"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3"
                                        >
                                            Xác nhận đặt lịch
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-500 text-center">
                                        Bằng cách đặt lịch, bạn đồng ý với các
                                        điều khoản và chính sách bảo mật của
                                        chúng tôi.
                                    </p>
                                </form>
                            </>
                        ) : (
                            <div className="p-10 text-center space-y-4">
                                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mx-auto">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-light tracking-wide">
                                    ĐẶT LỊCH THÀNH CÔNG
                                </h3>
                                <p className="text-gray-600">
                                    Cảm ơn bạn đã đặt lịch hẹn. Chúng tôi sẽ
                                    liên hệ với bạn trong thời gian sớm nhất để
                                    xác nhận.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
