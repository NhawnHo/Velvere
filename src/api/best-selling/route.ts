import { NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectToDatabase } from "../../lib/mongodb"

// Kiểu dữ liệu cho sản phẩm đã bán
type ProductSalesRecord = {
  quantity: number
  revenue: number
}

// Kiểu tổng thể: product_id dạng chuỗi ánh xạ tới doanh số
type ProductSalesMap = {
  [productId: string]: ProductSalesRecord
}

// Định nghĩa schema cho Order
const OrderSchema = new mongoose.Schema({
  order_id: String,
  user_id: mongoose.Schema.Types.ObjectId,
  user_name: String,
  items: Array,
  totalAmount: Number,
  status: String,
  payment_method: String,
  orderDate: Date,
})

// Định nghĩa schema cho Product
const ProductSchema = new mongoose.Schema({
  product_id: Number,
  product_name: String,
  description: String,
  category_id: String,
  sex: String,
  images: [String],
  price: Number,
  xuatXu: String,
  chatLieu: String,
  variants: [
    {
      stock: Number
    }
  ],
})

// Đảm bảo không tạo model trùng
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema)
const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "month"
    const category = searchParams.get("category") || "all"
    const search = searchParams.get("search") || ""

    await connectToDatabase()

    // Tính khoảng thời gian
    const now = new Date()
    const startDate = new Date()
    if (timeRange === "week") {
      startDate.setDate(now.getDate() - 7)
    } else if (timeRange === "month") {
      startDate.setMonth(now.getMonth() - 1)
    } else if (timeRange === "year") {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    // Lọc các đơn hàng đã hoàn thành
    const orders = await Order.find({
      orderDate: { $gte: startDate, $lte: now },
      status: { $ne: "cancelled" },
    }).lean()

    // Gom tất cả item trong đơn hàng
    const orderItems = orders.flatMap((order: any) => order.items)

    // Thống kê doanh số theo sản phẩm
    const productSales: ProductSalesMap = {}
    orderItems.forEach((item: any) => {
      const productId = item.product_id?.toString()
      if (!productId) return

      if (!productSales[productId]) {
        productSales[productId] = { quantity: 0, revenue: 0 }
      }

      productSales[productId].quantity += item.quantity
      productSales[productId].revenue += item.price * item.quantity
    })

    // Truy vấn sản phẩm
    const productQuery: any = {}
    if (category !== "all") {
      productQuery.category_id = category
    }

    if (search) {
      productQuery.$or = [
        { product_name: { $regex: search, $options: "i" } },
        { product_id: { $regex: search, $options: "i" } }, // Lưu ý nếu product_id là số, đoạn này nên bỏ
      ]
    }

    const products = await Product.find(productQuery).lean()

    // Gộp dữ liệu doanh số với sản phẩm
    const productsWithSales = products.map((product: any) => {
      const sales = productSales[product.product_id?.toString()] || { quantity: 0, revenue: 0 }
      return {
        id: product.product_id,
        name: product.product_name,
        category: product.category_id,
        price: product.price,
        sold: sales.quantity,
        revenue: sales.revenue,
        stock: product.variants?.reduce((total: number, variant: any) => total + (variant.stock || 0), 0),
        image: product.images?.[0] || null,
      }
    })

    // Sắp xếp theo số lượng bán
    productsWithSales.sort((a, b) => b.sold - a.sold)

    // Thống kê theo danh mục
    const categoryStats: { [category: string]: { name: string; value: number } } = {}
    productsWithSales.forEach((product) => {
      if (!categoryStats[product.category]) {
        categoryStats[product.category] = { name: product.category, value: 0 }
      }
      categoryStats[product.category].value += product.sold
    })

    const categoryData = Object.values(categoryStats)
    categoryData.sort((a, b) => b.value - a.value)

    // Tính tổng kết
    const totalProducts = products.length
    const totalSold = productsWithSales.reduce((sum, p) => sum + p.sold, 0)
    const totalRevenue = productsWithSales.reduce((sum, p) => sum + p.revenue, 0)
    const totalCategories = categoryData.length

    return NextResponse.json({
      products: productsWithSales,
      categories: categoryData,
      summary: {
        totalProducts,
        totalSold,
        totalRevenue,
        totalCategories,
      },
    })
  } catch (error) {
    console.error("Error fetching best-selling products:", error)
    return NextResponse.json({ error: "Failed to fetch best-selling products" }, { status: 500 })
  }
}
