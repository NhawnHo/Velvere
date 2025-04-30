import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';

// Định nghĩa kiểu dữ liệu cho sản phẩm trong giỏ hàng
export interface CartItem {
    _id: string;
    product_id: number;
    product_name: string;
    image: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
}

// Định nghĩa các hàm và state cho context
interface CartContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string, size: string, color: string) => void;
    updateQuantity: (
        itemId: string,
        size: string,
        color: string,
        quantity: number,
    ) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

// Tạo Context với giá trị mặc định là null
const CartContext = createContext<CartContextType | null>(null);

// Hook tùy chỉnh để sử dụng context
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart phải được sử dụng trong CartProvider');
    }
    return context;
};

// Props cho CartProvider
interface CartProviderProps {
    children: ReactNode;
}

// Component Provider
export const CartProvider = ({ children }: CartProviderProps) => {
    // State để lưu trữ giỏ hàng
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Tính tổng số lượng sản phẩm trong giỏ hàng
    const totalItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    // Tính tổng tiền
    const totalPrice = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
    );

    // Load giỏ hàng từ localStorage khi khởi động
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // Lưu giỏ hàng vào localStorage khi có thay đổi
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = (item: CartItem) => {
        setCartItems((prevItems) => {
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa (cùng id, size và color)
            const existingItemIndex = prevItems.findIndex(
                (cartItem) =>
                    cartItem._id === item._id &&
                    cartItem.size === item.size &&
                    cartItem.color === item.color,
            );

            // Nếu sản phẩm đã tồn tại, tăng số lượng
            if (existingItemIndex !== -1) {
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex].quantity += item.quantity;
                return updatedItems;
            }

            // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
            return [...prevItems, item];
        });
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = (itemId: string, size: string, color: string) => {
        setCartItems((prevItems) =>
            prevItems.filter(
                (item) =>
                    !(
                        item._id === itemId &&
                        item.size === size &&
                        item.color === color
                    ),
            ),
        );
    };

    // Cập nhật số lượng sản phẩm
    const updateQuantity = (
        itemId: string,
        size: string,
        color: string,
        quantity: number,
    ) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === itemId &&
                item.size === size &&
                item.color === color
                    ? { ...item, quantity }
                    : item,
            ),
        );
    };

    // Xóa toàn bộ giỏ hàng
    const clearCart = () => {
        setCartItems([]);
    };

    // Giá trị của context
    const value: CartContextType = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
    };

    return (
        <CartContext.Provider value={value}>{children}</CartContext.Provider>
    );
};
