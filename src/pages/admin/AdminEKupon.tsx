export default function AdminEKupon() {
    return (
        <div className="flex min-h-screen flex-col bg-bg-primary">
            <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-4xl font-bold mb-4">E-Kupon</h1>
                <p className="text-lg text-gray-600">Halaman E-Kupon sedang dalam pengembangan.</p>
                <button 
                    onClick={() => window.history.back()} 
                    className="pressable flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-dark"
                >
                    Kembali
                </button>
    
            {/* QR Code Generator Placeholder */}
            </div>
        </div> 
    )
}