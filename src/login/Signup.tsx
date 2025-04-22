import { useState } from 'react';

function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        mail: '',
        phone: '',
        birth: '',
        address: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: '' }); // Clear lỗi khi nhập
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newErrors: Record<string, string> = { ...errors };

        switch (name) {
            case 'name':
                if (!value.trim()) newErrors.name = 'Vui lòng nhập họ tên';
                break;
            case 'mail':
                if (!value.trim()) {
                    newErrors.mail = 'Vui lòng nhập email';
                } else if (!/\S+@\S+\.\S+/.test(value)) {
                    newErrors.mail = 'Email không hợp lệ';
                }
                break;
            case 'phone':
                if (!value.trim()) {
                    newErrors.phone = 'Vui lòng nhập số điện thoại';
                } else if (!/^\d{10,11}$/.test(value)) {
                    newErrors.phone = 'Số điện thoại không hợp lệ';
                }
                break;
            case 'birth':
                if (!value.trim()) newErrors.birth = 'Vui lòng chọn ngày sinh';
                break;
            case 'address':
                if (!value.trim()) newErrors.address = 'Vui lòng nhập địa chỉ';
                break;
            case 'password':
                if (!value) {
                    newErrors.password = 'Vui lòng nhập mật khẩu';
                } else if (value.length < 6) {
                    newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
                }
                break;
            case 'confirmPassword':
                if (value !== formData.password) {
                    newErrors.confirmPassword = 'Mật khẩu không khớp';
                }
                break;
        }

        setErrors(newErrors);
    };

    const validate = () => {
        const simulatedEvent = {
            target: { name: '', value: '' },
        } as React.FocusEvent<HTMLInputElement>;
        Object.keys(formData).forEach((key) => {
            simulatedEvent.target.name = key;
            simulatedEvent.target.value =
                formData[key as keyof typeof formData];
            handleBlur(simulatedEvent);
        });

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            console.log('Dữ liệu hợp lệ:', formData);
            // Gửi form
        }
    };

    const renderInput = (
        name: string,
        type: string,
        label: string,
        placeholder = ' ',
    ) => (
        <div className="relative w-full mt-6">
            <input
                type={type}
                name={name}
                value={formData[name as keyof typeof formData]}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className="peer w-full border-0 border-b border-gray-300 bg-transparent pt-6 pb-2 text-sm focus:outline-none focus:border-gray-500"
                placeholder={placeholder}
            />
            <label
                htmlFor={name}
                className="absolute left-0 top-1 text-sm text-gray-500 transition-all duration-200 
                peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 
                peer-focus:top-1 peer-focus:text-sm peer-focus:text-gray-400"
            >
                {label}
            </label>
            {errors[name] && (
                <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
            )}
        </div>
    );

    return (
        <div className='mt-[5vw]'>
            <p className="text-5xl uppercase font-serif text-center">Sign Up</p>
            <div className="mx-[34vw]">
                <div className="max-w-[30vw]">
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white rounded px-8 pt-6 pb-8 w-full"
                    >
                        {renderInput('name', 'text', 'Full name')}
                        {renderInput('mail', 'email', 'Email')}
                        {renderInput('phone', 'text', 'Số điện thoại')}
                        {renderInput('birth', 'date', 'Ngày sinh')}
                        {renderInput('address', 'text', 'Địa chỉ')}
                        {renderInput('password', 'password', 'Mật khẩu')}
                        {renderInput(
                            'confirmPassword',
                            'password',
                            'Xác nhận mật khẩu',
                        )}

                        <div className="flex items-center justify-between mt-6">
                            <button
                                className="font-light uppercas text-lg border w-full py-2 mt-3 hover:bg-black hover:text-white transition duration-300"
                                type="submit"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;
