import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product.model';
import Order from '../models/Order.model';

// Interface for best-selling product stats
interface BestSellingProduct {
    id: string;
    name: string;
    category: string;
    price: number;
    sold: number;
    revenue: number;
    stock: number;
    image: string | null;
}

// Interface for category stats
interface CategoryStat {
    name: string;
    value: number;
}

// Interface for summary stats
interface SummaryStats {
    totalProducts: number;
    totalSold: number;
    totalRevenue: number;
    totalCategories: number;
}

const generateProductId = async (): Promise<string> => {
    // Tìm sản phẩm có product_id lớn nhất
    const lastProduct = await Product.findOne({})
        .sort({ product_id: -1 }) // sắp xếp giảm dần theo product_id
        .lean();

    let nextNumber = 1;

    if (lastProduct && lastProduct.product_id) {
        const match = lastProduct.product_id.match(/PROD(\d+)/);
        if (match && match[1]) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }

    // Format lại với padding 0: PROD0001
    return `PROD${nextNumber.toString().padStart(4, '0')}`;
};

// Get all products
export const getAllProducts = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err: unknown) {
        console.error('Lỗi server khi lấy sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Get product by ID
export const getProductById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        res.status(200).json(product);
    } catch (err: unknown) {
        console.error('Lỗi server khi lấy sản phẩm theo ID:', err);
        res.status(500).json({
            message: 'Lỗi server',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Add a new product
export const addProduct = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const {
            product_name,
            description,
            category_id,
            sex,
            images,
            price,
            xuatXu,
            chatLieu,
            variants,
        } = req.body;

        // Validate required fields
        if (
            !product_name?.trim() ||
            !description?.trim() ||
            !category_id ||
            !sex ||
            !price ||
            price <= 0 ||
            !xuatXu?.trim() ||
            !chatLieu?.trim() ||
            !variants ||
            !Array.isArray(variants) ||
            variants.length === 0 ||
            variants.some(
                (v: { size: string; color: string; stock: number }) =>
                    !v.size || !v.color || v.stock < 0,
            ) ||
            !images ||
            !Array.isArray(images) ||
            images.filter((img: string) => img.trim() !== '').length === 0
        ) {
            res.status(400).json({
                message:
                    'Vui lòng cung cấp đầy đủ thông tin hợp lệ, bao gồm ít nhất một ảnh và một biến thể hợp lệ.',
            });
            return;
        }

        // Generate a unique product_id
        const product_id = await generateProductId();

        // Create a new product
        const newProduct = new Product({
            product_id,
            product_name,
            description,
            category_id,
            sex,
            images: images.filter((img: string) => img.trim() !== ''),
            price: Number(price),
            xuatXu,
            chatLieu,
            variants: variants.map(
                (v: { size: string; color: string; stock: number }) => ({
                    size: v.size,
                    color: v.color,
                    stock: Number(v.stock),
                }),
            ),
        });

        // Save the product
        const savedProduct = await newProduct.save();

        res.status(201).json({
            message: 'Sản phẩm đã được thêm thành công',
            product: savedProduct,
        });
    } catch (err: unknown) {
        console.error('Lỗi khi thêm sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi thêm sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Update an existing product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const {
            product_name,
            description,
            category_id,
            sex,
            images,
            price,
            xuatXu,
            chatLieu,
            variants,
        } = req.body;

        // Validate required fields
        if (
            !product_name?.trim() ||
            !description?.trim() ||
            !category_id ||
            !sex ||
            !price ||
            price <= 0 ||
            !xuatXu?.trim() ||
            !chatLieu?.trim() ||
            !variants ||
            !Array.isArray(variants) ||
            variants.length === 0 ||
            variants.some((v: { size: string; color: string; stock: number }) => !v.size || !v.color || v.stock < 0) ||
            !images ||
            !Array.isArray(images) ||
            images.filter((img: string) => img.trim() !== '').length === 0
        ) {
            res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin hợp lệ, bao gồm ít nhất một ảnh và một biến thể hợp lệ.',
            });
            return;
        }

        // Find the product by _id instead of product_id
        const product = await Product.findById(id);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }

        // Update the product fields
        product.product_name = product_name;
        product.description = description;
        product.category_id = category_id;
        product.sex = sex;
        product.images = images.filter((img: string) => img.trim() !== '');
        product.price = Number(price);
        product.xuatXu = xuatXu;
        product.chatLieu = chatLieu;
        product.variants = variants.map((v: { size: string; color: string; stock: number }) => ({
            size: v.size,
            color: v.color,
            stock: Number(v.stock),
        }));

        // Save the updated product
        const updatedProduct = await product.save();

        res.status(200).json({
            message: 'Sản phẩm đã được cập nhật thành công',
            product: updatedProduct,
        });
    } catch (err: unknown) {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Update stock for a single product
export const updateProductStock = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { productId, size, color, quantity } = req.body;

        if (
            !productId ||
            !size ||
            !color ||
            quantity === undefined ||
            quantity === null
        ) {
            res.status(400).json({
                message:
                    'Thiếu thông tin cần thiết: productId, size, color, quantity',
            });
            return;
        }

        // Tìm sản phẩm bằng product_id thay vì _id
        const product = await Product.findOne({ product_id: productId });
        
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }

        const variantIndex = product.variants.findIndex(
            (variant: { size: string; color: string; stock: number }) =>
                variant.size === size && variant.color === color,
        );

        if (variantIndex === -1) {
            res.status(404).json({
                message:
                    'Không tìm thấy biến thể của sản phẩm với size và color đã chọn',
            });
            return;
        }

        if (quantity > 0 && product.variants[variantIndex].stock < quantity) {
            res.status(400).json({
                message: 'Số lượng trong kho không đủ',
                available: product.variants[variantIndex].stock,
            });
            return;
        }

        product.variants[variantIndex].stock -= quantity;
        await product.save();

        res.status(200).json({
            message: 'Cập nhật số lượng sản phẩm thành công',
            updatedStock: product.variants[variantIndex].stock,
        });
    } catch (err: unknown) {
        console.error('Lỗi khi cập nhật số lượng sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật số lượng sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Update stock for multiple products
export const updateMultipleProductsStock = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                message: 'Danh sách sản phẩm không hợp lệ',
            });
            return;
        }

        const updateResults: Array<{
            productId: string;
            success: boolean;
            message?: string;
            updatedStock?: number;
            available?: number;
            wasCreated?: boolean;
        }> = [];
        let hasError = false;

        for (const item of items) {
            const { productId, size, color, quantity, product_name } = item;
            if (
                !productId ||
                !size ||
                !color ||
                quantity === undefined ||
                quantity === null
            ) {
                updateResults.push({
                    productId: productId || 'unknown',
                    success: false,
                    message:
                        'Thiếu thông tin cần thiết cho sản phẩm trong danh sách',
                });
                hasError = true;
                continue;
            }

            try {
                // Tìm sản phẩm bằng product_id
                let product = await Product.findOne({ product_id: productId });
                
                // Nếu không tìm thấy sản phẩm, tạo mới sản phẩm với thông tin cơ bản
                if (!product) {
                    console.log(`Sản phẩm ${productId} không tồn tại, tạo mới sản phẩm`);
                    
                    // Sử dụng tên sản phẩm từ giỏ hàng hoặc tạo tên mặc định
                    const newProductName = product_name || `Sản phẩm ${productId}`;
                    
                    product = new Product({
                        product_id: productId,
                        product_name: newProductName,
                        description: `Mô tả cho ${newProductName}`,
                        category_id: 'Khác',
                        sex: 'Unisex',
                        images: ['/placeholder.svg'],
                        price: 0, // Giá sẽ được cập nhật sau
                        xuatXu: 'Việt Nam',
                        chatLieu: 'Chưa xác định',
                        variants: [{
                            size: size,
                            color: color,
                            stock: Math.max(quantity + 10, 20) // Tạo tồn kho mặc định
                        }]
                    });
                    
                    await product.save();
                    
                    updateResults.push({
                        productId,
                        success: true,
                        message: 'Đã tạo sản phẩm mới và cập nhật số lượng',
                        updatedStock: Math.max(quantity + 10, 20) - quantity,
                        wasCreated: true
                    });
                    continue;
                }

                // Kiểm tra xem biến thể đã tồn tại chưa
                let variantIndex = product.variants.findIndex(
                    (variant: { size: string; color: string; stock: number }) =>
                        variant.size === size && variant.color === color,
                );

                // Nếu không tìm thấy biến thể, thêm biến thể mới
                if (variantIndex === -1) {
                    console.log(`Biến thể size=${size}, color=${color} không tồn tại, thêm biến thể mới`);
                    
                    // Thêm biến thể mới với số lượng tồn kho đủ
                    product.variants.push({
                        size: size,
                        color: color,
                        stock: Math.max(quantity + 10, 20) // Tạo tồn kho đủ để đáp ứng đơn hàng
                    });
                    
                    // Lấy index của biến thể vừa thêm
                    variantIndex = product.variants.length - 1;
                    
                    await product.save();
                    
                    updateResults.push({
                        productId,
                        success: true,
                        message: 'Đã thêm biến thể mới và cập nhật số lượng',
                        updatedStock: Math.max(quantity + 10, 20) - quantity
                    });
                    continue;
                }

                // Kiểm tra xem số lượng tồn kho có đủ không
                if (
                    quantity > 0 &&
                    product.variants[variantIndex].stock < quantity
                ) {
                    // Nếu không đủ, tự động cập nhật số lượng tồn kho lên cao hơn để đáp ứng đơn hàng
                    product.variants[variantIndex].stock = Math.max(quantity + 10, product.variants[variantIndex].stock + 20);
                    await product.save();
                    
                    updateResults.push({
                        productId,
                        success: true,
                        message: `Đã tự động bổ sung số lượng tồn kho`,
                        updatedStock: product.variants[variantIndex].stock - quantity
                    });
                    
                    // Cập nhật số lượng tồn kho sau khi bổ sung
                    product.variants[variantIndex].stock -= quantity;
                    await product.save();
                    continue;
                }

                // Trường hợp bình thường: cập nhật số lượng tồn kho
                product.variants[variantIndex].stock -= quantity;
                await product.save();

                updateResults.push({
                    productId,
                    success: true,
                    updatedStock: product.variants[variantIndex].stock,
                });
            } catch (err: unknown) {
                console.error(
                    `Lỗi khi cập nhật sản phẩm ${item.productId}:`,
                    err,
                );
                updateResults.push({
                    productId,
                    success: false,
                    message: 'Lỗi server khi xử lý sản phẩm',
                });
                hasError = true;
            }
        }

        if (hasError) {
            res.status(207).json({
                message:
                    'Đã xử lý yêu cầu, nhưng có lỗi xảy ra với một số sản phẩm',
                results: updateResults,
            });
        } else {
            res.status(200).json({
                message: 'Cập nhật số lượng tất cả sản phẩm thành công',
                results: updateResults,
            });
        }
    } catch (err: unknown) {
        console.error('Lỗi server khi cập nhật số lượng nhiều sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi xử lý yêu cầu cập nhật số lượng',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Get best-selling products
export const getBestSellingProduct = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        const {
            timeRange = 'month',
            category = 'all',
            search = '',
        } = req.query as {
            timeRange?: string;
            category?: string;
            search?: string;
        };

        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }
        
        // Fetch valid orders within the time range, excluding cancelled orders
        const orders = await Order.find({
            orderDate: { $gte: startDate, $lte: now },
            status: { $nin: ['cancelled'] },
        }).lean();

        // Build product query based on category and search parameters
        const productQuery: Record<string, unknown> = {};
        if (category !== 'all') {
            productQuery.category_id = category;
        }
        if (search) {
            productQuery.$or = [
                { product_name: { $regex: search, $options: 'i' } },
                { product_id: { $regex: search, $options: 'i' } },
            ];
        }

        // Fetch all products matching the query
        const products = await Product.find(productQuery).lean();
        
        // Create a map of product IDs for faster lookups
        const productMap = new Map();
        
        // Add all products to the map with both _id and product_id as keys
        products.forEach(product => {
            const objectIdString = product._id.toString();
            productMap.set(objectIdString, product);
            
            if (product.product_id) {
                productMap.set(product.product_id, product);
            }
        });
        
        // Process all order items to build revenue data by product
        const productStats = new Map(); // Map to store aggregated stats
        
        orders.forEach(order => {
            order.items?.forEach(item => {
                // Try to match the product using product_id
                const productId = item.product_id;
                if (!productId) return;
                
                // Initialize stats object if first occurrence
                if (!productStats.has(productId)) {
                    productStats.set(productId, {
                        totalQuantity: 0,
                        totalRevenue: 0
                    });
                }
                
                // Update stats
                const stats = productStats.get(productId);
                stats.totalQuantity += item.quantity;
                stats.totalRevenue += (item.quantity * item.price);
            });
        });
        
        // Enrich products with sales data
        const enrichedProducts = products.map(product => {
            const id = product._id.toString();
            const productId = product.product_id || id;
            
            // Get stats for this product (might be undefined if no sales)
            const stats = productStats.get(productId) || productStats.get(id) || {
                totalQuantity: 0,
                totalRevenue: 0
            };
            
            return {
                id,
                name: product.product_name,
                category: product.category_id,
                price: product.price,
                sold: stats.totalQuantity,
                revenue: stats.totalRevenue,
                stock: product.variants.reduce(
                    (sum: number, v: { stock?: number }) => sum + (v.stock || 0),
                    0
                ),
                image: getImage(product.images),
            } as BestSellingProduct;
        });

        // Sort products by sales (best-selling first)
        enrichedProducts.sort((a, b) => b.sold - a.sold);

        // Generate category statistics
        const categoryStats = enrichedProducts.reduce(
            (acc: Record<string, CategoryStat>, p: BestSellingProduct) => {
                if (!acc[p.category]) {
                    acc[p.category] = { name: p.category, value: 0 };
                }
                acc[p.category].value += p.sold;
                return acc;
            },
            {}
        );
        
        const categoryData = Object.values(categoryStats).sort(
            (a, b) => b.value - a.value
        );

        // Calculate summary statistics
        const summary: SummaryStats = {
            totalProducts: products.length,
            totalSold: enrichedProducts.reduce((sum, p) => sum + p.sold, 0),
            totalRevenue: enrichedProducts.reduce((sum, p) => sum + p.revenue, 0),
            totalCategories: categoryData.length,
        };

        res.status(200).json({
            products: enrichedProducts,
            categories: categoryData,
            summary,
        });
    } catch (err: unknown) {
        console.error('Lỗi khi lấy sản phẩm bán chạy:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy sản phẩm bán chạy',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};

// Helper: Get first non-video image
function getImage(images: string[] | undefined): string | null {
    if (!images || images.length === 0) return null;
    const firstImage = images[0];
    if (isVideo(firstImage)) {
        return images[1] || null;
    }
    return firstImage;
}

// Helper: Check if URL is a video
function isVideo(url: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
    return videoExtensions.some((extension) =>
        url.toLowerCase().endsWith(extension),
    );
}
