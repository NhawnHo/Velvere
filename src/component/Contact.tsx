import React, { useState } from 'react';

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });

    const [status, setStatus] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Giả lập gửi dữ liệu
        console.log('Form data:', formData);

        // Giả lập thành công
        setStatus('success');
        setTimeout(() => setStatus(null), 3000);

        // Reset form
        setFormData({
            name: '',
            email: '',
            message: '',
        });
    };

    return (
        <div className="font-sans bg-gray-50 ">
            <div className="text-center mb-8 fixed top-0 left-0 right-0 z-10">
                <img
                    src={
                        'https://media.gucci.com/content/HeroShortMedium_768x230/1739286017/HeroShortMedium_Gucci-SS25-Feb25-Gucci-SS25-Shot3-225-SAFE_001_Default.jpg'
                    }
                    alt="Contact Us"
                    className="mx-auto w-full h-auto object-cover rounded-lg shadow-lg contact-us-container" // 👈 Thêm  contact-us-container chỗ này nè
                />
            </div>

            <div className="relative h-screen mt-[500px] z-20 bg-white">
                <h1 className="text-center text-7xl mb-4 absolute top-[-150px] left-1/2 -translate-x-1/2 text-white">
                    CONTACT US
                </h1>

                <span className="absolute top-[-8px] left-1/2 -translate-x-1/2 bg-red-500">
                    Logo
                </span>

                <p className="text-center text-3xl text-gray-700 mt-2 mb-6">
                    Nếu bạn có bất kỳ câu hỏi nào về sản phẩm quần áo của chúng
                    tôi, vui lòng liên hệ qua thông tin dưới đây:
                </p>

                <form
                    className="max-w-4xl mx-auto mt-5 bg-white p-8 rounded-lg shadow-md"
                    onSubmit={handleSubmit}
                >
                    <div className="mb-6">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Họ và tên"
                            className="w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="mb-6">
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Nội dung"
                            rows={5}
                            className="w-full p-4 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-5 py-3 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 ou"
                        style={{ backgroundColor: '#B6C99B' }}
                    >
                        Gửi
                    </button>
                </form>

                {status === 'success' && (
                    <div className="max-w-4xl mx-auto mt-4 text-center text-green-600">
                        Gửi thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.
                    </div>
                )}

                <div className="max-w-4xl mx-auto text-center mt-10 bg-white p-6 rounded-lg shadow-md">
                    <div className="mb-4 text-lg">
                        <strong>Email:</strong>{' '}
                        <span className="text-blue-600">
                            support@velvere.com
                        </span>
                    </div>
                    <div className="mb-4 text-lg">
                        <strong>Hotline:</strong>{' '}
                        <span className="text-blue-600">0123-456-789</span>
                    </div>
                    <div className="mb-4 text-lg">
                        <strong>Địa chỉ:</strong>{' '}
                        <span className="text-blue-600">
                            123 Đường ABC, Quận XYZ, Thành phố HCM
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
