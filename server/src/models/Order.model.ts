import mongoose from 'mongoose';

// Schema cho từng sản phẩm trong đơn hàng
const orderItemSchema = new mongoose.Schema(
    {
        product_id: { type: String, required: true },
        product_name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
    },
    { _id: false }
);

// Schema cho đơn hàng
const orderSchema = new mongoose.Schema(
    {
        order_id: { type: String, required: true, unique: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        user_name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        items: [orderItemSchema],
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
            default: 'pending',
        },
        payment_method: {
            type: String,
            required: true,
            enum: ['COD', 'banking', 'momo'],
            default: 'COD',
        },
        orderDate: { type: Date, default: Date.now },
        estimatedDelivery: { type: Date, required: true },
    },
    { timestamps: true }
);

export default mongoose.model('Order', orderSchema, 'Orders');