import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductPage from '../pages/ProductPage';
import MessageDialog from '../component/MessageDialog'; // Điều chỉnh đường dẫn nếu cần

// Define interfaces for type safety
interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface Product {
    _id?: string;
    product_id?: string;
    product_name: string;
    description: string;
    category_id: string;
    sex: string;
    images: string[];
    price: number;
    xuatXu: string;
    chatLieu: string;
    variants: Variant[];
}

function AddProduct() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // State management
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<Product>({
        product_name: '',
        description: '',
        category_id: 'Áo len',
        sex: 'Nam',
        images: ['', '', ''],
        price: 0,
        xuatXu: '',
        chatLieu: '',
        variants: [{ size: 'S', color: 'Đen', stock: 1000 }],
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [dialog, setDialog] = useState({
        isOpen: false,
        title: '',
        description: '',
        type: '' as 'success' | 'error' | '',
    }); // State for dialog

    // Cuộn lên đầu trang khi component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []); // Chạy một lần khi component được mount

    // Fetch product data for edit mode
    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            setLoading(true);
            fetch(`http://localhost:3000/api/products/${id}`)
                .then((res) => {
                    if (!res.ok)
                        throw new Error('Không thể tải thông tin sản phẩm');
                    return res.json();
                })
                .then((data: Product) => {
                    const images = data.images?.length
                        ? [...data.images]
                        : ['', '', ''];
                    while (images.length < 3) images.push('');
                    setFormData({
                        ...data,
                        product_id: data.product_id || '',
                        product_name: data.product_name || '',
                        description: data.description || '',
                        category_id: data.category_id || 'Áo len',
                        sex: data.sex || 'Nam',
                        images,
                        price: data.price || 0,
                        xuatXu: data.xuatXu || '',
                        chatLieu: data.chatLieu || '',
                        variants: data.variants?.length
                            ? data.variants
                            : [{ size: 'S', color: 'Đen', stock: 1000 }],
                    });
                    setError('');
                })
                .catch((err) => {
                    setError(
                        'Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.',
                    );
                    console.error('Error fetching product:', err);
                })
                .finally(() => setLoading(false));
        } else {
            setIsEditMode(false);
            setFormData({
                product_name: '',
                description: '',
                category_id: 'Áo len',
                sex: 'Nam',
                images: ['', '', ''],
                price: 0,
                xuatXu: '',
                chatLieu: '',
                variants: [{ size: 'S', color: 'Đen', stock: 1000 }],
            });
            setError('');
            setLoading(false);
        }
    }, [id]);

    // Handle input changes
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'price' ? Number(value) : value,
        }));
    };

    // Handle image changes
    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const handleAddImage = () => {
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ''],
        }));
    };

    const handleRemoveImage = (index: number) => {
        if (formData.images.length <= 1) {
            setFormData((prev) => ({ ...prev, images: [''] }));
            return;
        }
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    // Handle variant changes
    const handleVariantChange = (
        index: number,
        field: keyof Variant,
        value: string | number,
    ) => {
        const newVariants = [...formData.variants];
        if (newVariants[index]) {
            newVariants[index] = {
                ...newVariants[index],
                [field]: field === 'stock' ? Number(value) : value,
            };
            setFormData({ ...formData, variants: newVariants });
        }
    };

    const handleAddVariant = () => {
        setFormData((prev) => ({
            ...prev,
            variants: [...prev.variants, { size: 'S', color: 'Đen', stock: 0 }],
        }));
    };

    const handleRemoveVariant = (index: number) => {
        if (formData.variants.length <= 1) {
            setError('Sản phẩm phải có ít nhất một biến thể.');
            return;
        }
        setFormData((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
        setError('');
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (
            !formData.product_name.trim() ||
            !formData.description.trim() ||
            !formData.category_id ||
            !formData.sex ||
            formData.price <= 0 ||
            !formData.xuatXu.trim() ||
            !formData.chatLieu.trim() ||
            formData.variants.length === 0 ||
            formData.variants.some((v) => !v.size || !v.color || v.stock < 0) ||
            formData.images.filter((img) => img.trim() !== '').length === 0
        ) {
            setError(
                'Vui lòng điền đầy đủ thông tin, thêm ít nhất một ảnh và đảm bảo các biến thể hợp lệ.',
            );
            return;
        }

        setLoading(true);
        try {
            const url = isEditMode
                ? `http://localhost:3000/api/products/${id}`
                : 'http://localhost:3000/api/products';
            const method = isEditMode ? 'PUT' : 'POST';

            const dataToSend = {
                ...formData,
                images: formData.images.filter((img) => img.trim() !== ''),
                price: Number(formData.price),
                variants: formData.variants.map((v) => ({
                    ...v,
                    stock: Number(v.stock),
                })),
            };

            if (!isEditMode) delete dataToSend._id;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Lỗi khi lưu sản phẩm');
            }

            // Hiển thị dialog thành công
            setDialog({
                isOpen: true,
                title: isEditMode ? 'Cập nhật thành công' : 'Thêm thành công',
                description: isEditMode
                    ? 'Sản phẩm đã được cập nhật thành công.'
                    : 'Sản phẩm đã được thêm thành công.',
                type: 'success',
            });
          // eslint-disable-next-line
        } catch (err: any) {
            console.error('Error submitting product:', err); // Detailed error log
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            // Hiển thị dialog lỗi
            setDialog({
                isOpen: true,
                title: 'Lỗi',
                description: err.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle dialog close
    const handleCloseDialog = () => {
        setDialog({ isOpen: false, title: '', description: '', type: '' });
        navigate('/admin/productPage', { replace: true }); // Chuyển hướng với scroll to top
    };

    // Render loading state for edit mode
    if (loading && isEditMode) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 mb-4"></div>
                    <h2 className="text-xl font-semibold mb-2 text-gray-700">
                        Đang tải dữ liệu sản phẩm...
                    </h2>
                </div>
            </div>
        );
    }

    // Render error state for failed fetch
    if (!loading && error && isEditMode) {
        return (
            <div className="container mx-auto my-20 py-8 px-4 text-center">
                <div className="p-4 bg-red-100 text-red-700 rounded-lg max-w-md mx-auto">
                    <h2 className="text-xl font-semibold mb-2">Lỗi</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/admin/productPage')}
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                        Quay lại danh sách sản phẩm
                    </button>
                </div>
            </div>
        );
    }

    // Main form UI
    return (
        <div className="max-w-[65vw] mx-auto p-4 md:p-6">
            <h1 className="text-5xl font-serif my-20 text-center">
                {isEditMode ? 'Cập nhật Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h1>

            {error && !loading && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {isEditMode && formData.product_id && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product ID
                            </label>
                            <input
                                type="text"
                                name="product_id"
                                value={formData.product_id}
                                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                disabled
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên sản phẩm
                        </label>
                        <input
                            type="text"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Nhập tên sản phẩm...."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Xuất xứ
                        </label>
                        <input
                            type="text"
                            name="xuatXu"
                            value={formData.xuatXu}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Nhập xuất xứ..."
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md h-50"
                        rows={3}
                        placeholder="Nhập mô tả sản phẩm..."
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chất liệu
                        </label>
                        <input
                            type="text"
                            name="chatLieu"
                            value={formData.chatLieu}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Nhập chất liệu..."
                            required
                        />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Hình ảnh sản phẩm (URL)
                        </label>
                        <button
                            type="button"
                            onClick={handleAddImage}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md flex items-center text-sm hover:bg-gray-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Thêm ảnh
                        </button>
                    </div>
                    <div className="space-y-2">
                        {formData.images.map((image, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-2"
                            >
                                <input
                                    type="text"
                                    value={image}
                                    onChange={(e) =>
                                        handleImageChange(index, e.target.value)
                                    }
                                    className="flex-grow p-2 border border-gray-300 rounded-md"
                                    placeholder={`URL hình ảnh ${index + 1}`}
                                    required={index === 0}
                                />
                                {formData.images.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="p-2 border border-black text-red-600 rounded-md hover:bg-red-100"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.725-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm7 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    {formData.images.filter((img) => img.trim() !== '').length >
                        0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {formData.images
                                .filter((img) => img.trim() !== '')
                                .map((image, index) => (
                                    <div
                                        key={`preview-${index}`}
                                        className="relative h-full bg-gray-100 rounded overflow-hidden"
                                    >
                                        <img
                                            src={image || '/placeholder.svg'}
                                            alt={`Image preview ${index + 1}`}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (
                                                    e.target as HTMLImageElement
                                                ).src = '/placeholder.svg';
                                            }}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        >
                            <option value="aothun">Áo thun</option>
                            <option value="aosomi">Áo sơ mi</option>
                            <option value="aokhoac">Áo khoác</option>
                            <option value="aolen">Áo len</option>
                            <option value="vest">Áo vest</option>
                            <option value="damcongso">Đầm công sở</option>
                            <option value="damdahoi">Đầm dạ hội</option>
                            <option value="dambody">Đầm body</option>
                            <option value="vay">Váy</option>
                            <option value="hat">Mũ</option>
                            <option value="belt">Thắt lưng</option>
                            <option value="khanchoang">Khăn choàng</option>
                            <option value="quanau">Quần âu</option>
                            <option value="quanjean">Quần jean</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giới tính
                        </label>
                        <select
                            name="sex"
                            value={formData.sex}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Unisex">Unisex</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá (VNĐ)
                    </label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="9000000"
                        required
                        min="0"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                            Kích thước sản phẩm
                        </h3>
                        <button
                            type="button"
                            onClick={handleAddVariant}
                            className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md flex items-center text-sm hover:bg-gray-200"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            Thêm size
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.variants.map((variant, index) => (
                            <div key={index} className="border rounded-md p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-700">
                                        Size {index + 1}
                                    </h4>
                                    {formData.variants.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveVariant(index)
                                            }
                                            className="p-1 border border-black text-red-500 rounded-md hover:bg-red-100 text-xs"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.725-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1zm7 0a1 1 0 011 1v6a1 1 0 11-2 0V9a1 1 0 011-1z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kích cỡ
                                        </label>
                                        <select
                                            name="size"
                                            value={variant.size}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    'size',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            required
                                        >
                                            <option value="">
                                                -- Chọn kích cỡ --
                                            </option>
                                            <option value="S">S</option>
                                            <option value="M">M</option>
                                            <option value="L">L</option>
                                            <option value="XL">XL</option>
                                            <option value="XXL">XXL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Màu sắc
                                        </label>
                                        <select
                                            name="color"
                                            value={variant.color}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    'color',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            required
                                        >
                                            <option value="">
                                                -- Chọn màu --
                                            </option>
                                            <option value="Đen">Đen</option>
                                            <option value="Trắng">Trắng</option>
                                            <option value="Xanh dương">
                                                Xanh dương
                                            </option>
                                            <option value="Đỏ">Đỏ</option>
                                            <option value="Xám">Xám</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số lượng tồn kho
                                        </label>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={variant.stock}
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    index,
                                                    'stock',
                                                    e.target.value,
                                                )
                                            }
                                            className="w-full p-2 border border-gray-300 rounded-md"
                                            min="0"
                                            placeholder="1000"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin/productPage', { replace: true })
                        }
                        className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <svg
                                className="animate-spin h-5 w-5 text-white mx-auto"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                ></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"
                                ></path>
                            </svg>
                        ) : isEditMode ? (
                            'Cập nhật sản phẩm'
                        ) : (
                            'Thêm sản phẩm'
                        )}
                    </button>
                </div>
            </form>

            {/* Thêm MessageDialog vào đây */}
            <MessageDialog
                isOpen={dialog.isOpen}
                title={dialog.title}
                description={dialog.description}
                type={dialog.type}
                onClose={handleCloseDialog}
            />

            <ProductPage />
        </div>
    );
}

export default AddProduct;
