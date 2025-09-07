import AppointmentModal from '../component/AppointmentModal';

export default function AppointmentPage() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 shadow-md">
                <h1 className="text-3xl font-light tracking-wide text-center mb-6">
                    VÉLVERE FASHION
                </h1>
                <p className="text-gray-600 text-center mb-8">
                    Trải nghiệm dịch vụ tư vấn cá nhân hóa với các chuyên gia
                    thời trang của chúng tôi.
                </p>
                <div className="flex justify-center">
                    <AppointmentModal />
                </div>
            </div>
        </main>
    );
}
