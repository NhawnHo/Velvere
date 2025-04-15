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
        <div className=" bg-gray-50">
            <div className="text-center mb-8 fixed top-0 left-0 right-0 z-10">
                <img
                    src={
                        'https://res.cloudinary.com/duongofji/image/upload/v1744732669/bgContact_h4cnbq.jpg'
                    }
                    alt="Contact Us"
                    className="mx-auto w-full h-auto object-cover brightness-50 rounded-lg shadow-lg"
                />
            </div>

            <div className="relative h-screen mt-[600px] z-20 bg-white items-center justify-items-center ">
                <h1 className="text-center font-semibold text-5xl mb-4 absolute top-[-150px] left-1/2 -translate-x-1/2 text-white">
                    CONTACT US
                </h1>
                <p className="text-center py-8 text-gray-500">
                    Trung tâm dịch vụ khách hàng Dior làm việc từ Thứ Hai đến
                    Chủ Nhật <br /> từ 10 giờ sáng đến 9 giờ tối (giờ ICT).{' '}
                    <br />
                    Các cố vấn khách hàng của chúng tôi sẽ rất vui lòng hỗ trợ
                    bạn và cung cấp lời khuyên cá nhân. <br />
                    Để được hỗ trợ về nước hoa và làm đẹp, vui lòng nhấp vào đây
                    .
                </p>

                <div className="grid grid-cols-2  w-full max-w-7xl mt-10 ">
                    <div className="col-span-1 items-center pr-10">
                        <p className="text-lg font-semibold">
                            Viết cho chúng tôi
                        </p>
                        <form className=" bg-white " onSubmit={handleSubmit}>
                            <div className="relative w-full">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="mt-5 w-full py-2 text-lg border-0 border-b border-b-gray-300 focus:outline-none focus:border-b-gray-500"
                                    placeholder="Họ tên"
                                />
                            </div>

                            <div className="">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className=" mt-7 w-full py-2 text-lg border-0 border-b border-b-gray-300 focus:outline-none focus:border-b-gray-500"
                                />
                            </div>
                            <div className="mb-6">
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Nội dung"
                                    rows={5}
                                    className=" mt-7 w-full py-2 text-lg border-0 border-b border-b-gray-300 focus:outline-none focus:border-b-gray-500"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-5 py-3 mb-5 text-lg bg-blue-600 text-white rounded-md hover:bg-blue-700 ou"
                                style={{ backgroundColor: '#B6C99B' }}
                            >
                                Gửi
                            </button>
                        </form>
                        <p className="h-10">
                            {status === 'success' && (
                                <div className="max-w-4xl mx-auto pt 3 text-center text-green-600">
                                    Gửi thành công! Chúng tôi sẽ liên hệ với bạn
                                    sớm nhất.
                                </div>
                            )}
                        </p>
                    </div>
                    <div className="pl-10">
                        <div>
                            <p className="text-lg font-medium">
                                Gọi cho chúng tôi
                            </p>
                            <p className="text-gray-500 mt-3">
                                Các cố vấn khách hàng của chúng tôi rất vui lòng
                                hỗ trợ bạn. <br />
                                Bạn có thể liên hệ với chúng tôi theo số +852
                                800 969 886 . <br />
                                Dịch vụ có sẵn từ Thứ Hai đến Chủ Nhật từ 10 giờ
                                sáng đến 9 giờ tối (ICT)
                            </p>
              </div>
              <div>
                <p>SDT</p>
                <p>dịa chir</p>
                <p>Mail</p>
              </div>
                    </div>
                </div>

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
