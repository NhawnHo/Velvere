import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
    {
        size: { type: String, required: true },
        color: { type: String, required: true },
        stock: { type: Number, required: true },
    },
    { _id: false },
);

const productSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product_id: { type: Number, required: true },
    product_name: { type: String, required: true },
    description: { type: String },
    category_id: { type: String },
    sex: { type: String },
    images: [String],
    price: { type: Number, required: true },
    xuatXu: { type: String },
    chatLieu: { type: String },
    variants: [variantSchema],
});

export default mongoose.model('Product', productSchema, 'Products'); // Collection tên 'Products'
