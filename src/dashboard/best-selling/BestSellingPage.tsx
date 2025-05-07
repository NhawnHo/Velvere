'use client';

import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { FileSpreadsheet, FileText, Search, Loader2 } from 'lucide-react';
import { Button } from '../../components_bonus/my-button/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../components_bonus/my-card/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components_bonus/my-select/components/ui/select';
import { Input } from '../../components_bonus/my-input/components/ui/input';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D',
    '#FFC658',
    '#8DD1E1',
    '#A4DE6C',
    '#D0ED57',
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

export default function BestSellingPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [timeRange, setTimeRange] = useState('month');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalSold: 0,
        totalRevenue: 0,
        totalCategories: 0,
    });

    // Top 10 products for charts
    const top10Products = products.slice(0, 10);

    const fetchProductData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build query parameters
            const params = new URLSearchParams();
            params.append('timeRange', timeRange);

            if (categoryFilter !== 'all') {
                params.append('category', categoryFilter);
            }

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            const response = await fetch(
                `http://localhost:3000/api/products/best-selling?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error('Failed to fetch product data');
            }

            const result = await response.json();

            setProducts(result.products);
            setFilteredProducts(result.products);
            setCategoryData(result.categories);
            setSummary(result.summary);
        } catch (err) {
            console.error('Error fetching product data:', err);
            setError('Failed to load product data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [timeRange]);

    useEffect(() => {
        let result = products;

        // Apply search filter
        if (searchTerm) {
            result = result.filter(
                (p: any) =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.id
                        .toString()
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            );
        }

        // Apply category filter
        if (categoryFilter !== 'all') {
            result = result.filter((p: any) => p.category === categoryFilter);
        }

        setFilteredProducts(result);
    }, [searchTerm, categoryFilter, products]);

    const handleSearch = () => {
        fetchProductData();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(18);
        doc.text('Báo Cáo Sản Phẩm Bán Chạy', 105, 15, { align: 'center' });

        // Add period
        doc.setFontSize(12);
        const period =
            timeRange === 'week'
                ? 'Tuần'
                : timeRange === 'month'
                ? 'Tháng'
                : 'Năm';
        doc.text(`Thống kê theo ${period}`, 105, 25, { align: 'center' });

        // Add date
        const today = new Date().toLocaleDateString('vi-VN');
        doc.text(`Ngày xuất báo cáo: ${today}`, 105, 35, { align: 'center' });

        // Add table
        doc.setFontSize(10);
        let y = 50;

        // Table header
        doc.text('Mã SP', 20, y);
        doc.text('Tên sản phẩm', 45, y);
        doc.text('Danh mục', 100, y);
        doc.text('Đã bán', 140, y);
        doc.text('Doanh thu', 165, y);
        y += 10;

        // Table rows
        filteredProducts.slice(0, 20).forEach((product: any) => {
            doc.text(product.id.toString(), 20, y);
            doc.text(product.name.substring(0, 25), 45, y);
            doc.text(product.category, 100, y);
            doc.text(product.sold.toString(), 140, y);
            doc.text(formatCurrency(product.revenue), 165, y);
            y += 10;

            // Add new page if needed
            if (y > 280) {
                doc.addPage();
                y = 20;
            }
        });

        // Save the PDF
        doc.save(`bao-cao-san-pham-ban-chay-${period.toLowerCase()}.pdf`);
    };

    const exportToExcel = () => {
        // Prepare data for export
        const exportData = filteredProducts.map((p: any) => ({
            'Mã SP': p.id,
            'Tên sản phẩm': p.name,
            'Danh mục': p.category,
            'Giá bán': formatCurrency(p.price),
            'Số lượng đã bán': p.sold,
            'Doanh thu': formatCurrency(p.revenue),
            'Tồn kho': p.stock,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sản Phẩm Bán Chạy');

        // Add category summary sheet
        const categorySummary = categoryData.map((c: any) => ({
            'Danh mục': c.name,
            'Số lượng đã bán': c.value,
            'Tỷ lệ': `${(
                (c.value /
                    categoryData.reduce(
                        (sum: number, cat: any) => sum + cat.value,
                        0,
                    )) *
                100
            ).toFixed(2)}%`,
        }));
        const categorySheet = XLSX.utils.json_to_sheet(categorySummary);
        XLSX.utils.book_append_sheet(
            workbook,
            categorySheet,
            'Thống Kê Danh Mục',
        );

        // Save the Excel file
        const period =
            timeRange === 'week'
                ? 'tuan'
                : timeRange === 'month'
                ? 'thang'
                : 'nam';
        XLSX.writeFile(workbook, `bao-cao-san-pham-ban-chay-${period}.xlsx`);
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Sản Phẩm Bán Chạy
                </h1>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={exportToPDF}
                        disabled={isLoading || filteredProducts.length === 0}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Xuất PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={exportToExcel}
                        disabled={isLoading || filteredProducts.length === 0}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng Sản Phẩm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalProducts}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng Đã Bán
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalSold}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Doanh Thu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.totalRevenue)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Danh Mục
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalCategories}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Sản Phẩm Bán Chạy</CardTitle>
                        <CardDescription>Số lượng đã bán</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                            </div>
                        ) : top10Products.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-500">
                                Không có dữ liệu
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={top10Products}
                                    layout="vertical"
                                    margin={{
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={150}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [
                                            `${value} sản phẩm`,
                                            'Đã bán',
                                        ]}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="sold"
                                        fill="#8884d8"
                                        name="Số lượng đã bán"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Phân Bố Theo Danh Mục</CardTitle>
                        <CardDescription>
                            Tỷ lệ sản phẩm bán ra theo danh mục
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                            </div>
                        ) : categoryData.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-500">
                                Không có dữ liệu
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) =>
                                            `${name}: ${(percent * 100).toFixed(
                                                0,
                                            )}%`
                                        }
                                    >
                                        {categoryData.map(
                                            (entry: any, index: number) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        COLORS[
                                                            index %
                                                                COLORS.length
                                                        ]
                                                    }
                                                />
                                            ),
                                        )}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [
                                            `${value} sản phẩm`,
                                            'Đã bán',
                                        ]}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
                        <CardTitle>Danh Sách Sản Phẩm</CardTitle>
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={timeRange}
                                    onValueChange={setTimeRange}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Chọn thời gian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="week">
                                            Tuần này
                                        </SelectItem>
                                        <SelectItem value="month">
                                            Tháng này
                                        </SelectItem>
                                        <SelectItem value="year">
                                            Năm nay
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={categoryFilter}
                                    onValueChange={setCategoryFilter}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Chọn danh mục" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Tất cả danh mục
                                        </SelectItem>
                                        {categoryData.map(
                                            (category: any, index: number) => (
                                                <SelectItem
                                                    key={index}
                                                    value={category.name}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="relative flex items-center">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Tìm kiếm sản phẩm..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                                <Button
                                    variant="outline"
                                    className="ml-2"
                                    onClick={handleSearch}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Tìm'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[200px]">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex justify-center items-center h-[200px] text-gray-500">
                            Không có dữ liệu
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3 px-4 text-left">
                                            Mã SP
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Hình ảnh
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Tên sản phẩm
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Danh mục
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Giá bán
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Đã bán
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Doanh thu
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Tồn kho
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(
                                        (product: any, index: number) => (
                                            <tr
                                                key={index}
                                                className="border-b hover:bg-gray-50"
                                            >
                                                <td className="py-3 px-4">
                                                    {product.id}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <img
                                                        src={
                                                            product.image ||
                                                            '/placeholder.svg?height=40&width=40'
                                                        }
                                                        alt={product.name}
                                                        className="w-10 h-10 object-cover rounded"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.name}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.category}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatCurrency(
                                                        product.price,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.sold}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {formatCurrency(
                                                        product.revenue,
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {product.stock}
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
