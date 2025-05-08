import { Request, Response } from 'express';
import Product from '../models/Product.model';
import Order from '../models/Order.model';
import mongoose from 'mongoose';
import { ProductDocument } from '../models/ProductDocument.model ';

export const getAllProducts = async (req: Request, res: Response) => {
    try {
      const products = await Product.find();
      res.json(products);
      
    } catch (err) {
        console.error('Lỗi server khi lấy sản phẩm:', err);
        res.status(500).json({ message: 'Lỗi server khi lấy sản phẩm', err });
  }
  
};

export const getProductById = async (
    req: Request,
    res: Response,
): Promise<void> => {
    try {
        // Kiểm tra tính hợp lệ của ID
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const product = await Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        res.status(200).json(product);
    } catch (err) {
        console.error('Lỗi server khi lấy sản phẩm theo ID:', err);
        res.status(500).json({ message: 'Lỗi server', err });
    }
};

// Hàm cập nhật số lượng sản phẩm trong kho sau khi đặt hàng (cho một sản phẩm)
// Lưu ý: Hàm này có vẻ không được sử dụng trong luồng đặt hàng nhiều sản phẩm
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
            // Kiểm tra quantity rõ ràng
            res.status(400).json({
                message:
                    'Thiếu thông tin cần thiết: productId, size, color, quantity',
            });
            return;
        }

        // Kiểm tra tính hợp lệ của productId
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        } // Tìm sản phẩm để cập nhật

        const product = (await Product.findById(
            productId,
        )) as ProductDocument | null; // Cast to ProductDocument
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        } // Tìm variant phù hợp

        const variantIndex = product.variants.findIndex(
            (variant) => variant.size === size && variant.color === color,
        );

        if (variantIndex === -1) {
            res.status(404).json({
                message:
                    'Không tìm thấy biến thể của sản phẩm với size và color đã chọn',
            });
            return;
        } // Kiểm tra nếu kho còn đủ hàng (chỉ khi quantity > 0, tức là trừ đi)

        if (quantity > 0 && product.variants[variantIndex].stock < quantity) {
            res.status(400).json({
                message: 'Số lượng trong kho không đủ',
                available: product.variants[variantIndex].stock,
            });
            return;
        } // Cập nhật số lượng trong kho (trừ đi nếu quantity > 0, cộng lại nếu quantity < 0)

        product.variants[variantIndex].stock -= quantity; // Lưu thay đổi vào database

        await product.save();

        res.status(200).json({
            message: 'Cập nhật số lượng sản phẩm thành công',
            updatedStock: product.variants[variantIndex].stock,
        });
    } catch (err) {
        console.error('Lỗi khi cập nhật số lượng sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật số lượng sản phẩm',
            error: err,
        });
    }
};

// Hàm cập nhật số lượng cho nhiều sản phẩm cùng lúc (dùng cho đặt hàng nhiều sản phẩm)
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

        const updateResults = [];
        let hasError = false; // Duyệt qua từng sản phẩm và cập nhật số lượng

        for (const item of items) {
            const { productId, size, color, quantity } = item; // Kiểm tra thông tin cần thiết cho từng item
            if (
                !productId ||
                !size ||
                !color ||
                quantity === undefined ||
                quantity === null
            ) {
                updateResults.push({
                    productId: productId || 'unknown', // Ghi log productId nếu có
                    success: false,
                    message:
                        'Thiếu thông tin cần thiết cho sản phẩm trong danh sách',
                });
                hasError = true;
                continue;
            }

            // Kiểm tra tính hợp lệ của productId
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                updateResults.push({
                    productId: productId,
                    success: false,
                    message: 'ID sản phẩm không hợp lệ',
                });
                hasError = true;
                continue;
            }

            try {
                // Tìm sản phẩm để cập nhật
                const product = (await Product.findById(
                    productId,
                )) as ProductDocument | null; // Cast to ProductDocument
                if (!product) {
                    updateResults.push({
                        productId: String(productId),
                        success: false,
                        message: 'Không tìm thấy sản phẩm',
                    });
                    hasError = true;
                    continue;
                } // Tìm variant phù hợp

                const variantIndex = product.variants.findIndex(
                    (variant) =>
                        variant.size === size && variant.color === color,
                );

                if (variantIndex === -1) {
                    updateResults.push({
                        productId: productId,
                        success: false,
                        message:
                            'Không tìm thấy biến thể sản phẩm với size và color đã chọn',
                    });
                    hasError = true;
                    continue;
                } // Kiểm tra nếu kho còn đủ hàng (chỉ khi quantity > 0, tức là trừ đi)

                if (
                    quantity > 0 &&
                    product.variants[variantIndex].stock < quantity
                ) {
                    updateResults.push({
                        productId: productId,
                        success: false,
                        message: `Số lượng trong kho không đủ (${product.variants[variantIndex].stock} có sẵn)`,
                        available: product.variants[variantIndex].stock,
                    });
                    hasError = true;
                    continue;
                } // Cập nhật số lượng trong kho (trừ đi nếu quantity > 0, cộng lại nếu quantity < 0)

                product.variants[variantIndex].stock -= quantity; // Lưu thay đổi vào database

                await product.save();

                updateResults.push({
                    productId: productId,
                    success: true,
                    updatedStock: product.variants[variantIndex].stock,
                });
            } catch (err) {
                console.error(
                    `Lỗi khi cập nhật sản phẩm ${item.productId}:`,
                    err,
                );
                updateResults.push({
                    productId: productId,
                    success: false,
                    message: 'Lỗi server khi xử lý sản phẩm',
                    error: (err as Error).message, // Trích xuất message từ error
                });
                hasError = true;
            }
        } // Trả về trạng thái 207 nếu có lỗi xảy ra với ít nhất một sản phẩm

        if (hasError) {
            res.status(207).json({
                // Multi-Status
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
    } catch (err) {
        console.error('Lỗi server khi cập nhật số lượng nhiều sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi xử lý yêu cầu cập nhật số lượng', // Thông báo lỗi chung
            error: (err as Error).message, // Trích xuất message từ error
        });
    }
};
// Thống kê sản phẩm bán chạy nhất
export const getBestSellingProduct = async (req: Request, res: Response) => {
  try {
    // Lấy các tham số từ query params
    const { timeRange = 'month', category = 'all', search = '' } = req.query;

    // Tính khoảng thời gian lọc
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

    // Lấy các đơn hàng đã hoàn thành trong khoảng thời gian đó
    const orders = await Order.find({
      orderDate: { $gte: startDate, $lte: now },
      status: { $nin: ['cancelled'] },
    }).lean();

    // Gộp tất cả sản phẩm từ các đơn hàng
    const allItems = orders.flatMap((order: any) => order.items);

    // Gom nhóm sản phẩm theo product_id
    const productSales = allItems.reduce((acc: any, item: any) => {
      const id = item.product_id;
      if (!acc[id]) {
        acc[id] = { quantity: 0, revenue: 0 };
      }
      acc[id].quantity += item.quantity;
      acc[id].revenue += item.quantity * item.price;
      return acc;
    }, {});

    // Tạo điều kiện truy vấn Product
    const productQuery: any = {};
    if (category !== 'all') {
      productQuery.category_id = category;
    }

    if (search) {
      productQuery.$or = [
        { product_name: { $regex: search, $options: 'i' } },
        { product_id: { $regex: search, $options: 'i' } },
      ];
    }

    // Lấy thông tin sản phẩm
    const products = await Product.find(productQuery).lean();

    // Ghép thông tin doanh số với sản phẩm
    const enrichedProducts = await Promise.all(
        products.map(async (product: any) => {
            const id = product.product_id?.toString();
    
            const stats = await Order.aggregate([
                {
                    $match: {
                        status: { $ne: 'Cancelled' },
                        'items.product_id': id, // Dùng product_id thay vì product_name
                    },
                },
                {
                    $unwind: '$items',
                },
                {
                    $match: {
                        'items.product_id': id,
                    },
                },
                {
                    $group: {
                        _id: '$items.product_id',
                        totalQuantity: { $sum: '$items.quantity' },
                        totalRevenue: {
                            $sum: {
                                $multiply: ['$items.quantity', '$items.price'],
                            },
                        },
                    },
                },
            ]);
        
            // Kiểm tra nếu có kết quả từ aggregation
            const statsResult = stats.length > 0 ? stats[0] : { totalQuantity: 0, totalRevenue: 0 };
            
    
            return {
                id,
                name: product.product_name,
                category: product.category_id,
                price: product.price,
                sold: statsResult.totalQuantity,
                revenue: statsResult.totalRevenue,
                stock: product.variants?.reduce(
                    (sum: number, v: any) => sum + (v.stock || 0),
                    0
                ),
                image: getImage(product.images),
            };
        })
    );
    

    // console.log("sold", enrichedProducts)

    // Sắp xếp theo sản phẩm bán chạy
    enrichedProducts.sort((a, b) => b.sold - a.sold);

    // Thống kê theo danh mục
    const categoryStats = enrichedProducts.reduce((acc: any, p: any) => {
      if (!acc[p.category]) {
        acc[p.category] = { name: p.category, value: 0 };
      }
      acc[p.category].value += p.sold;
      return acc;
    }, {});
    const categoryData = Object.values(categoryStats).sort(
      (a: any, b: any) => b.value - a.value,
    );

    // Tổng kết
    const summary = {
      totalProducts: products.length,
      totalSold: enrichedProducts.reduce((sum, p) => sum + p.sold, 0),
      totalRevenue: enrichedProducts.reduce(
        (sum, p) => sum + p.revenue,
        0,
      ),
      totalCategories: categoryData.length,
    };
    // console.log("Summary:" , summary)

    // Trả về kết quả
    res.json({
      products: enrichedProducts,
      categories: categoryData,
      summary,
    });
  } catch (error) {
    console.error('Error fetching best-selling products:', error);
    res.status(500).json({
      error: 'Failed to fetch best-selling products',
    });
  }
};
// Hàm kiểm tra và lấy ảnh đầu tiên hoặc ảnh thứ hai nếu ảnh đầu tiên là video
function getImage(images: string[] | undefined): string | null {
    if (!images || images.length === 0) return null;

    // Kiểm tra nếu ảnh đầu tiên là video (ví dụ kiểm tra đuôi .mp4)
    const firstImage = images[0];
    if (isVideo(firstImage)) {
        // Nếu ảnh đầu tiên là video, trả về ảnh thứ 2 (nếu có)
        return images[1] || null; // Nếu không có ảnh thứ hai thì trả về null
    }

    // Nếu ảnh đầu tiên không phải video, trả về ảnh đầu tiên
    return firstImage;
}

// Hàm kiểm tra xem file có phải video hay không (dựa vào đuôi file)
function isVideo(url: string): boolean {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
    return videoExtensions.some(extension => url.toLowerCase().endsWith(extension));
}
