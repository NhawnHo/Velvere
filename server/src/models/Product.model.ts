import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    product_id: Number,
    product_name: String,
    description: String,
    category_id: String,
    sex: String,
    images: [String],
    sizes: [
        {
            size: String,
            price: Number,
            stock: Number,
        },
    ],
});

export default mongoose.model('Product', productSchema, 'Products'); // dùng tên collection là 'Products'
