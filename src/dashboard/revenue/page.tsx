'use client';

import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import {
    Calendar,
    FileSpreadsheet,
    FileText,
    Filter,
    Loader2,
} from 'lucide-react';
import { Button } from '../../components_bonus/my-button/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../components_bonus/my-card/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../components_bonus/my-tab/components/ui/tabs';
import { DatePicker } from '../../component/DatePicker';
import * as XLSX from 'xlsx';
// Import autoTable explicitly
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Gắn font để pdfmake nhận dạng
pdfMake.vfs = pdfFonts.vfs;

// Format date for API requests
const formatDateForApi = (date: Date) => {
    return date.toISOString().split('T')[0];
};

// Format date for display
function formatDate(input: string, type: string) {
    const d = new Date(input);
    switch (type) {
        case 'daily':
            return d.toISOString().slice(0, 10); // "2025-05-02"
        case 'monthly':
            return `${d.getFullYear()}-${d.getMonth() + 1}`; // "2025-5"
        case 'yearly':
            return `${d.getFullYear()}`; // "2025"
        default:
            return input;
    }
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

export default function RevenuePage() {
    const [activeTab, setActiveTab] = useState('daily');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        highestOrder: 0,
        lowestOrder: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRevenueData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Build query parameters
            const params = new URLSearchParams();
            params.append('period', activeTab);

            if (startDate) {
                params.append('startDate', formatDateForApi(startDate));
            }

            if (endDate) {
                params.append('endDate', formatDateForApi(endDate));
            }

            const response = await fetch(
                `http://localhost:3000/api/orders?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error('Failed to fetch revenue data');
            }

            const result = await response.json();

            // Format dates for display
            const formattedData = result.data.map((item: any) => ({
                ...item,
                date: formatDate(item.date, activeTab),
            }));
            console.log('formattedData', formattedData);

            setRevenueData(formattedData);
            setSummary(result.summary);
        } catch (err) {
            console.error('Error fetching revenue data:', err);
            setError('Failed to load revenue data. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };
    const fetchHighestAndLowestOrders = async () => {
        try {
            const [maxRes, minRes] = await Promise.all([
                fetch('http://localhost:3000/api/orders/total-amount?type=max'),
                fetch('http://localhost:3000/api/orders/total-amount?type=min'),
            ]);
    
            if (!maxRes.ok || !minRes.ok) {
                throw new Error('Failed to fetch highest or lowest order');
            }
    
            const maxOrder = await maxRes.json();
            const minOrder = await minRes.json();
    
            setSummary(prev => ({
                ...prev,
                highestOrder: maxOrder.order.totalAmount,
                lowestOrder: minOrder.order.totalAmount
            }));
        } catch (err) {
            console.error('Error fetching highest/lowest orders:', err);
        }
    };
    

    useEffect(() => {
        fetchRevenueData();
        // fetchHighestAndLowestOrders();
    }, [activeTab]);

    const handleFilterClick = () => {
        fetchRevenueData();
    };

    const exportToPDF = () => {
        const period =
            activeTab === 'daily'
                ? 'Ngày'
                : activeTab === 'monthly'
                ? 'Tháng'
                : 'Năm';
        const today = new Date().toLocaleDateString('vi-VN');

        // Định nghĩa màu sắc chính cho báo cáo
        const primaryColor = '#1a73e8'; // Màu xanh chính
        const textColor = '#202124'; // Màu văn bản chính
        const subtextColor = '#5f6368'; // Màu văn bản phụ
        const borderColor = '#dadce0'; // Màu viền bảng

        // Tạo thông tin công ty (bạn sẽ thay thế thông tin này)
        const companyInfo = {
            name: 'CÔNG TY ABC',
            address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
            phone: '028.1234.5678',
            email: 'info@congtyabc.com',
            taxCode: '0123456789',
        };

        // Tạo định nghĩa cho tài liệu PDF
        const docDefinition = {
            pageSize: 'A4',
            pageMargins: [40, 60, 40, 60],

            footer: function (
                currentPage: { toString: () => string },
                pageCount: string,
            ) {
                return {
                    columns: [
                        {
                            text: companyInfo.name,
                            alignment: 'left',
                            fontSize: 8,
                            color: subtextColor,
                            margin: [40, 0, 0, 0],
                        },
                        {
                            text:
                                'Trang ' +
                                currentPage.toString() +
                                ' / ' +
                                pageCount,
                            alignment: 'right',
                            fontSize: 8,
                            color: subtextColor,
                            margin: [0, 0, 40, 0],
                        },
                    ],
                };
            },

            content: [
                // Header với thông tin báo cáo
                {
                    columns: [
                        {
                            stack: [
                                {
                                    text: companyInfo.name,
                                    style: 'companyName',
                                },
                                {
                                    text: companyInfo.address,
                                    style: 'companyInfo',
                                },
                                {
                                    text: `Điện thoại: ${companyInfo.phone}`,
                                    style: 'companyInfo',
                                },
                                {
                                    text: `MST: ${companyInfo.taxCode}`,
                                    style: 'companyInfo',
                                },
                            ],
                            width: '*',
                        },
                        {
                            stack: [
                                { text: 'BÁO CÁO DOANH THU', style: 'header' },
                                {
                                    text: `Thống kê theo: ${period}`,
                                    style: 'subheader',
                                },
                                {
                                    text: `Ngày xuất báo cáo: ${today}`,
                                    style: 'date',
                                },
                            ],
                            width: '*',
                            alignment: 'right',
                        },
                    ],
                    margin: [0, 0, 0, 30],
                },

                // Đường ngăn cách
                {
                    canvas: [
                        {
                            type: 'line',
                            x1: 0,
                            y1: 5,
                            x2: 515,
                            y2: 5,
                            lineWidth: 1,
                            lineColor: primaryColor,
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },

                // Thông tin tổng quan
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                {
                                    table: {
                                        widths: ['auto', '*'],
                                        headerRows: 0,
                                        body: [
                                            [
                                                {
                                                    text: 'Tổng doanh thu:',
                                                    style: 'summaryLabel',
                                                },
                                                {
                                                    text: formatCurrency(
                                                        summary.totalRevenue,
                                                    ),
                                                    style: 'summaryValue',
                                                },
                                            ],
                                            [
                                                {
                                                    text: 'Tổng số đơn hàng:',
                                                    style: 'summaryLabel',
                                                },
                                                {
                                                    text: summary.totalOrders,
                                                    style: 'summaryValue',
                                                },
                                            ],
                                            [
                                                {
                                                    text: 'Giá trị trung bình:',
                                                    style: 'summaryLabel',
                                                },
                                                {
                                                    text: formatCurrency(
                                                        summary.averageOrderValue,
                                                    ),
                                                    style: 'summaryValue',
                                                },
                                            ],
                                        ],
                                    },
                                    layout: 'noBorders',
                                },
                            ],
                        },
                        {
                            width: '*',
                            stack: [
                                {
                                    table: {
                                        widths: ['auto', '*'],
                                        headerRows: 0,
                                        body: [
                                            [
                                                {
                                                    text: 'Đơn giá trị cao nhất:',
                                                    style: 'summaryLabel',
                                                },
                                                {
                                                    text: formatCurrency(
                                                        summary.highestOrder ||
                                                            0,
                                                    ),
                                                    style: 'summaryValue',
                                                },
                                            ],
                                            [
                                                {
                                                    text: 'Đơn giá trị thấp nhất:',
                                                    style: 'summaryLabel',
                                                },
                                                {
                                                    text: formatCurrency(
                                                        summary.lowestOrder ||
                                                            0,
                                                    ),
                                                    style: 'summaryValue',
                                                },
                                            ],
                                            [
                                                {
                                                    text: 'Tỷ lệ hoàn thành:',
                                                    style: 'summaryLabel',
                                                },
                                                {
                                                    text: `${'100'}%`,
                                                    style: 'summaryValue',
                                                },
                                            ],
                                        ],
                                    },
                                    layout: 'noBorders',
                                },
                            ],
                        },
                    ],
                    margin: [0, 0, 0, 30],
                },

                // Bảng dữ liệu chi tiết với màu nền xen kẽ
                {
                    text: 'CHI TIẾT DOANH THU',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 10],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Thời gian', style: 'tableHeader' },
                                { text: 'Doanh thu', style: 'tableHeader' },
                                { text: 'Số đơn hàng', style: 'tableHeader' },
                                { text: 'TB/Đơn hàng', style: 'tableHeader' },
                            ],
                            ...revenueData.map((item, index) => [
                                { text: item.date, style: 'tableCell' },
                                {
                                    text: formatCurrency(item.revenue),
                                    style: 'tableCellRight',
                                },
                                {
                                    text: item.orders.toString(),
                                    style: 'tableCellCenter',
                                },
                                {
                                    text: formatCurrency(
                                        item.revenue / (item.orders || 1),
                                    ),
                                    style: 'tableCellRight',
                                },
                            ]),
                        ],
                    },
                    layout: {
                        hLineWidth: function (
                            i: number,
                            node: { table: { body: string | any[] } },
                        ) {
                            return i === 0 ||
                                i === 1 ||
                                i === node.table.body.length
                                ? 1
                                : 0.5;
                        },
                        vLineWidth: function (i: any) {
                            return 0;
                        },
                        hLineColor: function (i: number, node: any) {
                            return i === 0 || i === 1
                                ? primaryColor
                                : borderColor;
                        },
                        fillColor: function (rowIndex: number) {
                            if (rowIndex === 0) {
                                return primaryColor;
                            }
                            return rowIndex % 2 === 0 ? '#f8f9fa' : null;
                        },
                        paddingLeft: function (i: any) {
                            return 10;
                        },
                        paddingRight: function (i: any) {
                            return 10;
                        },
                        paddingTop: function (i: any) {
                            return 8;
                        },
                        paddingBottom: function (i: any) {
                            return 8;
                        },
                    },
                },

                // Thêm phần phân tích hoặc ghi chú (nếu có)
                {
                    text: 'PHÂN TÍCH VÀ NHẬN XÉT',
                    style: 'sectionHeader',
                    margin: [0, 30, 0, 10],
                },
                {
                    text: 'Phân tích xu hướng doanh thu trong kỳ báo cáo:',
                    style: 'analysisHeader',
                    margin: [0, 0, 0, 10],
                },
                {
                    ol: [
                        {
                            text: [
                                'Doanh thu ',
                                { text: 'tăng/giảm', italics: true },
                                ' so với kỳ trước: ',
                                { text: '+10%', bold: true, color: '#34a853' },
                            ],
                        },
                        {
                            text: [
                                'Số lượng đơn hàng ',
                                { text: 'tăng/giảm', italics: true },
                                ' so với kỳ trước: ',
                                { text: '+5%', bold: true, color: '#34a853' },
                            ],
                        },
                        {
                            text: [
                                'Giá trị trung bình mỗi đơn hàng ',
                                { text: 'tăng/giảm', italics: true },
                                ' so với kỳ trước: ',
                                { text: '+4.8%', bold: true, color: '#34a853' },
                            ],
                        },
                    ],
                    margin: [0, 0, 0, 20],
                },
                {
                    text: 'GHI CHÚ BÁO CÁO',
                    style: 'sectionHeader',
                    margin: [0, 0, 0, 10],
                },
                {
                    text: 'Báo cáo này được tạo tự động từ hệ thống quản lý doanh thu. Các số liệu được tổng hợp từ dữ liệu thực tế và có thể có sai số không đáng kể. Vui lòng liên hệ bộ phận CNTT nếu có thắc mắc về tính chính xác của báo cáo.',
                    style: 'note',
                    margin: [0, 0, 0, 20],
                },

                // Chữ ký và xác nhận
                {
                    columns: [
                        {
                            width: '*',
                            text: 'Người lập báo cáo',
                            style: 'signatureHeader',
                            alignment: 'center',
                        },
                        {
                            width: '*',
                            text: 'Người phê duyệt',
                            style: 'signatureHeader',
                            alignment: 'center',
                        },
                    ],
                    margin: [0, 40, 0, 30],
                },
                {
                    columns: [
                        {
                            width: '*',
                            stack: [
                                {
                                    text: '(Ký và ghi rõ họ tên)',
                                    style: 'signatureSubtext',
                                    alignment: 'center',
                                },
                                {
                                    text: '',
                                    margin: [0, 40, 0, 0],
                                },
                                {
                                    text: '___________________',
                                    alignment: 'center',
                                },
                            ],
                        },
                        {
                            width: '*',
                            stack: [
                                {
                                    text: '(Ký và ghi rõ họ tên)',
                                    style: 'signatureSubtext',
                                    alignment: 'center',
                                },
                                {
                                    text: '',
                                    margin: [0, 40, 0, 0],
                                },
                                {
                                    text: '___________________',
                                    alignment: 'center',
                                },
                            ],
                        },
                    ],
                },
            ],

            styles: {
                companyName: {
                    fontSize: 14,
                    bold: true,
                    color: primaryColor,
                    margin: [0, 0, 0, 5],
                },
                companyInfo: {
                    fontSize: 8,
                    color: subtextColor,
                    margin: [0, 0, 0, 1],
                },
                header: {
                    fontSize: 18,
                    bold: true,
                    color: primaryColor,
                    margin: [0, 0, 0, 5],
                },
                subheader: {
                    fontSize: 14,
                    color: textColor,
                    margin: [0, 0, 0, 3],
                },
                date: {
                    fontSize: 10,
                    color: subtextColor,
                    italics: true,
                },
                sectionHeader: {
                    fontSize: 12,
                    bold: true,
                    color: primaryColor,
                    decoration: 'underline',
                },
                summaryLabel: {
                    fontSize: 10,
                    bold: true,
                    color: textColor,
                    margin: [0, 3, 0, 3],
                },
                summaryValue: {
                    fontSize: 10,
                    color: textColor,
                    margin: [0, 3, 0, 3],
                },
                tableHeader: {
                    fontSize: 10,
                    bold: true,
                    color: 'white',
                    fillColor: primaryColor,
                    alignment: 'left',
                },
                tableCell: {
                    fontSize: 9,
                    color: textColor,
                },
                tableCellRight: {
                    fontSize: 9,
                    color: textColor,
                    alignment: 'right',
                },
                tableCellCenter: {
                    fontSize: 9,
                    color: textColor,
                    alignment: 'center',
                },
                analysisHeader: {
                    fontSize: 10,
                    bold: true,
                    color: textColor,
                },
                note: {
                    fontSize: 8,
                    italics: true,
                    color: subtextColor,
                },
                signatureHeader: {
                    fontSize: 10,
                    bold: true,
                    color: textColor,
                },
                signatureSubtext: {
                    fontSize: 8,
                    italics: true,
                    color: subtextColor,
                },
            },
            defaultStyle: {
                fontSize: 10,
                color: textColor,
            },
        };

        // Tạo và tải PDF
        pdfMake
            .createPdf(docDefinition)
            .download(
                `bao-cao-doanh-thu-${period.toLowerCase()}-${today.replace(
                    /\//g,
                    '-',
                )}.pdf`,
            );
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(revenueData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Doanh Thu');

        // Add summary sheet
        const summaryData = [
            {
                Metric: 'Tổng doanh thu',
                Value: formatCurrency(summary.totalRevenue),
            },
            { Metric: 'Tổng đơn hàng', Value: summary.totalOrders },
            {
                Metric: 'Giá trị đơn hàng trung bình',
                Value: formatCurrency(summary.averageOrderValue),
            },
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng Kết');

        // Save the Excel file
        const period =
            activeTab === 'daily'
                ? 'ngay'
                : activeTab === 'monthly'
                ? 'thang'
                : 'nam';
        XLSX.writeFile(workbook, `bao-cao-doanh-thu-${period}.xlsx`);
    };

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">
                    Thống Kê Doanh Thu
                </h1>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={exportToPDF}
                        disabled={isLoading || revenueData.length === 0}
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Xuất PDF
                    </Button>
                    <Button
                        variant="outline"
                        onClick={exportToExcel}
                        disabled={isLoading || revenueData.length === 0}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Xuất Excel
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Tổng Doanh Thu
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
                            Tổng Đơn Hàng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary.totalOrders}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">
                            Giá Trị Đơn Hàng Trung Bình
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(summary.averageOrderValue)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-6 h-[40vw]">
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
                        <CardTitle>Biểu Đồ Doanh Thu</CardTitle>
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <DatePicker
                                    date={startDate}
                                    setDate={setStartDate}
                                    placeholder="Từ ngày"
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <DatePicker
                                    date={endDate}
                                    setDate={setEndDate}
                                    placeholder="Đến ngày"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleFilterClick}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Filter className="mr-2 h-4 w-4" />
                                )}
                                Lọc
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-full w-full">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="h-full w-full"
                    >
                        <TabsList className="mb-4">
                            <TabsTrigger value="daily">Theo ngày</TabsTrigger>
                            <TabsTrigger value="monthly">
                                Theo tháng
                            </TabsTrigger>
                            <TabsTrigger value="yearly">Theo năm</TabsTrigger>
                        </TabsList>

                        {error ? (
                            <div className="flex justify-center items-center h-[400px] text-red-500">
                                {error}
                            </div>
                        ) : isLoading ? (
                            <div className="flex justify-center items-center h-[400px]">
                                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                            </div>
                        ) : revenueData.length === 0 ? (
                            <div className="flex justify-center items-center h-[400px] text-gray-500">
                                Không có dữ liệu
                            </div>
                        ) : (
                            <TabsContent
                                value={activeTab}
                                className="w-full h-full "
                            >
                                <ResponsiveContainer
                                    key={activeTab} // 👈 ép remount lại khi tab đổi
                                    width="100%"
                                    height="100%"
                                >
                                    {activeTab === 'daily' ? (
                                        <LineChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis
                                                tick={{
                                                    dx: 0,
                                                    dy: 0.355,
                                                    fontSize: 14,
                                                    fill: '#666',
                                                }}
                                                tickFormatter={(value) =>
                                                    (
                                                        value / 1_000_000
                                                    ).toLocaleString('vi-VN', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 1,
                                                    })
                                                }
                                                label={{
                                                    value: '(triệu đồng)',
                                                    angle: -90,
                                                    position: 'insideLeft',
                                                    offset: 0,
                                                    style: {
                                                        textAnchor: 'middle',
                                                    },
                                                }}
                                            />
                                            <Tooltip
                                                formatter={(value) =>
                                                    `${(
                                                        (value as number) /
                                                        1_000_000
                                                    ).toLocaleString('vi-VN', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 1,
                                                    })} triệu`
                                                }
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#8884d8"
                                                name="Doanh thu"
                                                strokeWidth={3}
                                            />
                                        </LineChart>
                                    ) : activeTab === 'monthly' ? (
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis
                                                tick={{
                                                    dx: 0,
                                                    dy: 0.355,
                                                    fontSize: 14,
                                                    fill: '#666',
                                                }}
                                                tickFormatter={(value) =>
                                                    (
                                                        value / 1_000_000
                                                    ).toLocaleString('vi-VN', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 1,
                                                    })
                                                }
                                                label={{
                                                    value: '(triệu đồng)',
                                                    angle: -90,
                                                    position: 'insideLeft',
                                                    offset: 0,
                                                    style: {
                                                        textAnchor: 'middle',
                                                    },
                                                }}
                                            />
                                            <Tooltip
                                                formatter={(value) =>
                                                    `${(
                                                        (value as number) /
                                                        1_000_000
                                                    ).toLocaleString('vi-VN', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 1,
                                                    })} triệu`
                                                }
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="revenue"
                                                fill="#8884d8"
                                                name="Doanh thu"
                                            />
                                        </BarChart>
                                    ) : (
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="year" />
                                            <YAxis
                                                tick={{
                                                    dx: 0,
                                                    dy: 0.355,
                                                    fontSize: 14,
                                                    fill: '#666',
                                                }}
                                                tickFormatter={(value) =>
                                                    (
                                                        value / 1_000_000
                                                    ).toLocaleString('vi-VN', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 1,
                                                    })
                                                }
                                                label={{
                                                    value: '(triệu đồng)',
                                                    angle: -90,
                                                    position: 'insideLeft',
                                                    offset: 0,
                                                    style: {
                                                        textAnchor: 'middle',
                                                    },
                                                }}
                                            />
                                            <Tooltip
                                                formatter={(value) =>
                                                    `${(
                                                        (value as number) /
                                                        1_000_000
                                                    ).toLocaleString('vi-VN', {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 1,
                                                    })} triệu`
                                                }
                                            />
                                            <Legend />
                                            <Bar
                                                dataKey="revenue"
                                                fill="#8884d8"
                                                name="Doanh thu"
                                            />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </TabsContent>
                        )}
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Chi Tiết Doanh Thu</CardTitle>
                    <CardDescription>
                        {activeTab === 'daily'
                            ? 'Doanh thu theo ngày'
                            : activeTab === 'monthly'
                            ? 'Doanh thu theo tháng'
                            : 'Doanh thu theo năm'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-[200px]">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                        </div>
                    ) : revenueData.length === 0 ? (
                        <div className="flex justify-center items-center h-[200px] text-gray-500">
                            Không có dữ liệu
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-3 px-4 text-left">
                                            Thời gian
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Doanh thu
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Số đơn hàng
                                        </th>
                                        <th className="py-3 px-4 text-left">
                                            Giá trị trung bình
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueData.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="border-b hover:bg-gray-50"
                                        >
                                            <td className="py-3 px-4">
                                                {item.date}
                                            </td>
                                            <td className="py-3 px-4">
                                                {formatCurrency(item.revenue)}
                                            </td>
                                            <td className="py-3 px-4">
                                                {item.orders}
                                            </td>
                                            <td className="py-3 px-4">
                                                {formatCurrency(
                                                    item.orders > 0
                                                        ? item.revenue /
                                                              item.orders
                                                        : 0,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
