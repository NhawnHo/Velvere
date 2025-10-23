/* eslint-disable */
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
import { Button } from '../../../components_bonus/my-button/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../../../components_bonus/my-card/components/ui/card';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../../components_bonus/my-tab/components/ui/tabs';
import { DatePicker } from '../../../component/DatePicker';
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
            const apiBaseUrl =
                window.location.hostname === 'localhost'
                    ? 'http://localhost:3000'
              : import.meta.env.VITE_API_BASE_URL;
          
            const response = await fetch(
                `${apiBaseUrl}/api/orders/revenue?${params.toString()}`,
                {
                    method: 'GET',
                    credentials: 'include',
                },
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
            const apiBaseUrl =
                import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            const res = await fetch(`${apiBaseUrl}/api/orders/min-max-total`, {
                method: 'GET',
                credentials: 'include', // ✅ Thêm dòng này
            });
            if (!res.ok) throw new Error('Failed to fetch min/max order');

            const data = await res.json();

            setSummary((prev) => ({
                ...prev,
                highestOrder: data.maxTotalAmount,
                lowestOrder: data.minTotalAmount,
            }));
        } catch (err) {
            console.error('Error fetching highest/lowest orders:', err);
        }
    };

    useEffect(() => {
        fetchRevenueData();
        fetchHighestAndLowestOrders();
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
            name: 'CÔNG TY TNHH VÉLVERE',
            address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
            phone: '+84 2838614107',
            email: 'welcome@velveremail.com',
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
                            ...revenueData.map((item) => [
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

                        vLineWidth: function () {
                            return 0;
                        },

                        hLineColor: function (i: number) {
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

                        paddingLeft: function () {
                            return 10;
                        },

                        paddingRight: function () {
                            return 10;
                        },

                        paddingTop: function () {
                            return 8;
                        },

                        paddingBottom: function () {
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
            .createPdf(docDefinition as any)
            .download(
                `bao-cao-doanh-thu-${period.toLowerCase()}-${today.replace(
                    /\//g,
                    '-',
                )}.pdf`,
            );
    };

    const exportToExcel = () => {
        // Tạo workbook mới
        const workbook = XLSX.utils.book_new();

        // Xác định tên file dựa vào tab hoạt động
        const period =
            activeTab === 'daily'
                ? 'ngay'
                : activeTab === 'monthly'
                ? 'thang'
                : 'nam';
        const fileName = `bao-cao-doanh-thu-${period}.xlsx`;

        // Tạo style cho báo cáo
        const headerStyle = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '4472C4' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        const currencyStyle = {
            numFmt: '#,##0 ₫',
            border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        const normalStyle = {
            border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        const titleStyle = {
            font: { bold: true, size: 16, color: { rgb: '000000' } },
            alignment: { horizontal: 'center' },
        };

        const subTitleStyle = {
            font: { bold: true, size: 12, color: { rgb: '666666' } },
            alignment: { horizontal: 'center' },
        };

        const highlightStyle = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'E2EFDA' } },
            border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' },
            },
        };

        // --- TRANG TỔNG QUAN ---

        // Tạo dữ liệu cho trang tổng quan
        const summaryData = [
            ['BÁO CÁO TỔNG QUAN DOANH THU'],
            [''],
            [`Thời gian: ${getReportPeriodTitle()}`],
            [''],
            ['Chỉ số', 'Giá trị'],
            ['Tổng doanh thu', summary.totalRevenue],
            ['Tổng đơn hàng', summary.totalOrders],
            ['Giá trị đơn hàng trung bình', summary.averageOrderValue],
            ['Tỷ lệ tăng trưởng', `${getGrowthRate()}%`],
            [''],
            ['Phân tích nhanh:'],
            [`• ${getQuickAnalysis()}`],
        ];

        // Tạo worksheet cho trang tổng quan
        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);

        // Định dạng các ô
        summaryWS['!cols'] = [{ width: 30 }, { width: 20 }];

        // Thêm định dạng vào worksheet
        applyStyles(summaryWS, 'A1:B1', titleStyle);
        applyStyles(summaryWS, 'A3:B3', subTitleStyle);
        applyStyles(summaryWS, 'A5:B5', headerStyle);
        applyStyles(summaryWS, 'A6:A9', normalStyle);
        applyStyles(summaryWS, 'B6', currencyStyle);
        applyStyles(summaryWS, 'B8', currencyStyle);
        applyStyles(summaryWS, 'B7:B9', normalStyle);
        applyStyles(summaryWS, 'A11:B11', highlightStyle);

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, summaryWS, 'Tổng Quan');

        // --- TRANG CHI TIẾT DOANH THU ---

        // Tạo worksheet từ dữ liệu chi tiết
        const detailWS = XLSX.utils.json_to_sheet(revenueData);

        // Chỉnh sửa định dạng cho worksheet chi tiết
        detailWS['!cols'] = [
            { width: 15 }, // Thời gian
            { width: 20 }, // Doanh thu
            { width: 15 }, // Số đơn hàng
            { width: 20 }, // Giá trị đơn hàng TB
        ];

        // Thêm tiêu đề cho worksheet chi tiết
        XLSX.utils.sheet_add_aoa(
            detailWS,
            [
                ['BÁO CÁO CHI TIẾT DOANH THU'],
                [''],
                [`Thời gian: ${getReportPeriodTitle()}`],
                [''],
            ],
            { origin: 'A1' },
        );

        // Định dạng tiêu đề cho worksheet chi tiết
        applyStyles(detailWS, 'A1:D1', titleStyle);
        applyStyles(detailWS, 'A3:D3', subTitleStyle);

        // Định dạng header columns
        const headerRow = getHeaderRowPosition();
        applyStyles(detailWS, `A${headerRow}:D${headerRow}`, headerStyle);

        // Định dạng các cột dữ liệu
        for (let i = headerRow + 1; i <= headerRow + revenueData.length; i++) {
            applyStyles(detailWS, `A${i}`, normalStyle);
            applyStyles(detailWS, `B${i}`, currencyStyle);
            applyStyles(detailWS, `C${i}`, normalStyle);
            applyStyles(detailWS, `D${i}`, currencyStyle);
        }

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, detailWS, 'Chi Tiết Doanh Thu');

        // --- TRANG BIỂU ĐỒ ---

        // Tạo dữ liệu cho biểu đồ
        const chartData = prepareChartData();
        const chartWS = XLSX.utils.aoa_to_sheet([
            ['BÁO CÁO BIỂU ĐỒ DOANH THU'],
            [''],
            [`Thời gian: ${getReportPeriodTitle()}`],
            [''],
            ['Thời gian', 'Doanh thu', 'Số đơn hàng'],
        ]);

        // Thêm dữ liệu cho biểu đồ
        XLSX.utils.sheet_add_aoa(chartWS, chartData, { origin: 'A5' });

        // Định dạng cho worksheet biểu đồ
        chartWS['!cols'] = [{ width: 15 }, { width: 20 }, { width: 15 }];

        // Thêm định dạng vào worksheet biểu đồ
        applyStyles(chartWS, 'A1:C1', titleStyle);
        applyStyles(chartWS, 'A3:C3', subTitleStyle);
        applyStyles(chartWS, 'A5:C5', headerStyle);

        // Định dạng dữ liệu biểu đồ
        for (let i = 6; i < 6 + chartData.length; i++) {
            applyStyles(chartWS, `A${i}`, normalStyle);
            applyStyles(chartWS, `B${i}`, currencyStyle);
            applyStyles(chartWS, `C${i}`, normalStyle);
        }

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, chartWS, 'Biểu Đồ');

        // --- TRANG PHÂN TÍCH ---

        // Tạo worksheet phân tích
        const analysisWS = XLSX.utils.aoa_to_sheet([
            ['PHÂN TÍCH DOANH THU'],
            [''],
            [`Thời gian: ${getReportPeriodTitle()}`],
            [''],
            ['Tiêu chí', 'Phân tích'],
            ['Xu hướng doanh thu', getRevenueTrend()],
            ['Biến động đơn hàng', getOrderFluctuation()],
            ['Điểm nổi bật', getHighlights()],
            ['Rủi ro', getRisks()],
            ['Đề xuất', getRecommendations()],
        ]);

        // Định dạng cho worksheet phân tích
        analysisWS['!cols'] = [{ width: 20 }, { width: 50 }];

        // Thêm định dạng vào worksheet phân tích
        applyStyles(analysisWS, 'A1:B1', titleStyle);
        applyStyles(analysisWS, 'A3:B3', subTitleStyle);
        applyStyles(analysisWS, 'A5:B5', headerStyle);

        // Định dạng nội dung phân tích
        for (let i = 6; i <= 10; i++) {
            applyStyles(analysisWS, `A${i}:B${i}`, normalStyle);
        }

        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbook, analysisWS, 'Phân Tích');

        // Lưu file Excel
        XLSX.writeFile(workbook, fileName);

        // Hiển thị thông báo
        alert(`Đã xuất báo cáo thành công: ${fileName}`);
    };

    // Hàm hỗ trợ để áp dụng style cho các ô
    function applyStyles(
        worksheet: XLSX.WorkSheet,
        range: string,
        style: {
            font?:
                | { bold: boolean; color: { rgb: string } }
                | { bold: boolean; size: number; color: { rgb: string } }
                | { bold: boolean; size: number; color: { rgb: string } }
                | { bold: boolean };
            alignment?:
                | { horizontal: string; vertical: string }
                | { horizontal: string }
                | { horizontal: string };
            fill?: { fgColor: { rgb: string } } | { fgColor: { rgb: string } };
            border?:
                | {
                      top: { style: string };
                      bottom: { style: string };
                      left: { style: string };
                      right: { style: string };
                  }
                | {
                      top: { style: string };
                      bottom: { style: string };
                      left: { style: string };
                      right: { style: string };
                  }
                | {
                      top: { style: string };
                      bottom: { style: string };
                      left: { style: string };
                      right: { style: string };
                  }
                | {
                      top: { style: string };
                      bottom: { style: string };
                      left: { style: string };
                      right: { style: string };
                  };
            numFmt?: string;
        },
    ) {
        const [start, end] = range.split(':');
        const startCell = XLSX.utils.decode_cell(start);
        const endCell = end ? XLSX.utils.decode_cell(end) : startCell;

        for (let r = startCell.r; r <= endCell.r; r++) {
            for (let c = startCell.c; c <= endCell.c; c++) {
                const cellAddress = XLSX.utils.encode_cell({ r, c });
                if (!worksheet[cellAddress]) {
                    worksheet[cellAddress] = { v: '' };
                }

                worksheet[cellAddress].s = style;
            }
        }
    }

    // Hàm lấy vị trí hàng header trong trang chi tiết
    function getHeaderRowPosition() {
        return 5; // Sau các tiêu đề và dòng trống
    }

    // Hàm tạo tiêu đề cho báo cáo dựa vào loại báo cáo
    function getReportPeriodTitle() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        if (activeTab === 'daily') {
            return `Ngày ${now.getDate()}/${month}/${year}`;
        } else if (activeTab === 'monthly') {
            return `Tháng ${month}/${year}`;
        } else {
            return `Năm ${year}`;
        }
    }

    // Hàm tạo dữ liệu cho biểu đồ
    function prepareChartData() {
        return revenueData.map((item) => [
            item.period,
            item.revenue,
            item.orders,
        ]);
    }

    // Hàm tạo phần tích tỷ lệ tăng trưởng (giả định)
    function getGrowthRate() {
        // Giả định: Tỷ lệ tăng trưởng được tính toán từ dữ liệu
        // Trong thực tế, bạn sẽ tính toán dựa trên so sánh với kỳ trước
        const growth = calculateGrowthRate();
        return growth.toFixed(2);
    }

    // Hàm tính toán tỷ lệ tăng trưởng
    function calculateGrowthRate() {
        // Giả định: Tỷ lệ tăng trưởng
        // Trong thực tế, bạn sẽ tính toán dựa trên so sánh với kỳ trước
        if (revenueData.length < 2) return 0;

        const currentRevenue = summary.totalRevenue;
        // Giả sử chúng ta có dữ liệu từ kỳ trước
        const previousRevenue = currentRevenue * 0.9; // Giả định giá trị cho mục đích minh họa

        return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    }

    // Các hàm phân tích dữ liệu
    function getQuickAnalysis() {
        const growth = calculateGrowthRate();
        if (growth > 10) {
            return `Doanh thu tăng trưởng mạnh (${growth.toFixed(
                2,
            )}%), có thể do chiến dịch marketing thành công hoặc ra mắt sản phẩm mới.`;
        } else if (growth > 0) {
            return `Doanh thu tăng nhẹ (${growth.toFixed(
                2,
            )}%), phù hợp với kỳ vọng tăng trưởng.`;
        } else {
            return `Doanh thu giảm (${growth.toFixed(
                2,
            )}%), cần phân tích nguyên nhân và có kế hoạch khắc phục.`;
        }
    }

    function getRevenueTrend() {
        // Phân tích xu hướng doanh thu dựa trên dữ liệu
        // Đây là phân tích giả định, trong thực tế bạn sẽ có hàm phân tích chính xác hơn
        if (revenueData.length < 3) {
            return 'Cần thêm dữ liệu để phân tích xu hướng chính xác';
        }

        let trend = 'ổn định';
        let increases = 0;
        let decreases = 0;

        for (let i = 1; i < revenueData.length; i++) {
            if (revenueData[i].revenue > revenueData[i - 1].revenue) {
                increases++;
            } else if (revenueData[i].revenue < revenueData[i - 1].revenue) {
                decreases++;
            }
        }

        if (increases > decreases * 2) {
            trend = 'tăng mạnh';
        } else if (increases > decreases) {
            trend = 'tăng nhẹ';
        } else if (decreases > increases * 2) {
            trend = 'giảm mạnh';
        } else if (decreases > increases) {
            trend = 'giảm nhẹ';
        }

        return `Doanh thu có xu hướng ${trend} trong giai đoạn báo cáo, với ${increases} lần tăng và ${decreases} lần giảm.`;
    }

    function getOrderFluctuation() {
        // Phân tích biến động số lượng đơn hàng
        // Đây là phân tích giả định
        const avgOrders = summary.totalOrders / revenueData.length;
        let maxDeviation = 0;

        revenueData.forEach((item) => {
            const deviation = Math.abs(item.orders - avgOrders) / avgOrders;
            if (deviation > maxDeviation) maxDeviation = deviation;
        });

        if (maxDeviation > 0.5) {
            return 'Số lượng đơn hàng có biến động lớn, cần nghiên cứu nguyên nhân của các đỉnh và đáy trong dữ liệu.';
        } else if (maxDeviation > 0.2) {
            return 'Số lượng đơn hàng có một số biến động nhưng vẫn trong mức kiểm soát.';
        } else {
            return 'Số lượng đơn hàng khá ổn định trong giai đoạn báo cáo.';
        }
    }

    function getHighlights() {
        // Tìm điểm nổi bật trong dữ liệu
        if (revenueData.length === 0) return 'Không có dữ liệu để phân tích';

        // Tìm điểm cao nhất
        let highestRevenue = revenueData[0];
        revenueData.forEach((item) => {
            if (item.revenue > highestRevenue.revenue) highestRevenue = item;
        });

        // Kiểm tra tỷ lệ tăng trưởng
        const growth = calculateGrowthRate();

        return `Doanh thu cao nhất đạt được vào ${
            highestRevenue.period
        } với ${formatCurrency(
            highestRevenue.revenue,
        )}. Tỷ lệ tăng trưởng chung là ${growth.toFixed(2)}%.`;
    }

    function getRisks() {
        // Phân tích rủi ro
        // Đây là phân tích giả định
        const growth = calculateGrowthRate();

        if (growth < 0) {
            return 'Doanh thu đang giảm, có thể do áp lực cạnh tranh hoặc thay đổi hành vi khách hàng. Cần phân tích chi tiết nguyên nhân.';
        }

        if (revenueData.length < 3) {
            return 'Cần thêm dữ liệu để đánh giá rủi ro chính xác.';
        }

        // Kiểm tra nếu có sự sụt giảm liên tiếp
        let consecutiveDecreases = 0;
        let maxConsecutiveDecreases = 0;

        for (let i = 1; i < revenueData.length; i++) {
            if (revenueData[i].revenue < revenueData[i - 1].revenue) {
                consecutiveDecreases++;
                if (consecutiveDecreases > maxConsecutiveDecreases) {
                    maxConsecutiveDecreases = consecutiveDecreases;
                }
            } else {
                consecutiveDecreases = 0;
            }
        }

        if (maxConsecutiveDecreases >= 3) {
            return 'Có dấu hiệu sụt giảm doanh thu liên tiếp qua nhiều kỳ. Cần kiểm tra chính sách giá và chất lượng sản phẩm.';
        }

        return 'Không phát hiện rủi ro đáng kể trong giai đoạn báo cáo, nhưng cần theo dõi biến động thị trường.';
    }

    function getRecommendations() {
        // Đề xuất dựa trên phân tích
        // Đây là đề xuất giả định
        const growth = calculateGrowthRate();

        if (growth > 10) {
            return 'Tiếp tục đầu tư vào các kênh marketing đang hiệu quả. Xem xét mở rộng thị trường với các sản phẩm/dịch vụ tương tự.';
        } else if (growth > 0) {
            return 'Duy trì chiến lược hiện tại nhưng cần có thêm các chương trình khuyến mãi để kích thích tăng trưởng.';
        } else {
            return 'Cần đánh giá lại chiến lược giá và sản phẩm. Xem xét các chiến dịch marketing mới để thu hút khách hàng.';
        }
    }

    // Hàm định dạng tiền tệ
    function formatCurrency(value: number | bigint) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
    }

    return (
        <div className="container mx-auto py-8">
            <div className="flex justify-end items-end mt-10 mb-6">
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
