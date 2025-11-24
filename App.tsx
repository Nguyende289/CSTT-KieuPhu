import React, { useState, useEffect } from 'react';
import useGoogleSheet from './hooks/useGoogleSheet';
import DataTable from './components/DataTable';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import AddDataModal from './components/AddDataModal';
import SetupInstructions from './components/SetupInstructions';
import SettingsModal from './components/SettingsModal';

// MẶC ĐỊNH (Sẽ được ghi đè bởi localStorage nếu có)
const DEFAULT_SPREADSHEET_ID = '1joX5ArafkL4t3YcSdRXE_l-tSlY3R5Mfp8BHKCOyHQs';
const DEFAULT_SHEET_GID = '0';
const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwLCDcRbTyKBH89f0UNBEhFJLclQqFNFc6r3GM0ve9wqZGGB8f5pJP0ZFOEuXniTjNCxQ/exec"; 

const App: React.FC = () => {
  // Khởi tạo config từ localStorage hoặc mặc định
  // Sử dụng khóa _v2 để đảm bảo các giá trị mặc định mới được áp dụng cho người dùng cũ
  const [config, setConfig] = useState(() => {
    const savedId = localStorage.getItem('spreadsheetId_v2');
    const savedGid = localStorage.getItem('sheetGid_v2');
    const savedUrl = localStorage.getItem('scriptUrl_v2');
    
    return {
      spreadsheetId: savedId || DEFAULT_SPREADSHEET_ID,
      sheetGid: savedGid || DEFAULT_SHEET_GID,
      scriptUrl: savedUrl || DEFAULT_SCRIPT_URL
    };
  });

  const { data, loading, error, refetch } = useGoogleSheet(config.spreadsheetId, config.sheetGid);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenAddModal = () => {
    if (!config.scriptUrl) {
      setIsSetupOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleSaveSettings = (newConfig: { spreadsheetId: string; sheetGid: string; scriptUrl: string }) => {
    setConfig(newConfig);
    // Lưu vào localStorage với khóa mới _v2
    localStorage.setItem('spreadsheetId_v2', newConfig.spreadsheetId);
    localStorage.setItem('sheetGid_v2', newConfig.sheetGid);
    localStorage.setItem('scriptUrl_v2', newConfig.scriptUrl);
  };

  const handleAddData = async (newData: Record<string, string>) => {
    if (!config.scriptUrl) {
        throw new Error("URL Script chưa được cấu hình.");
    }

    try {
        const response = await fetch(config.scriptUrl, {
            method: 'POST',
            body: JSON.stringify(newData)
        });
        
        if (!response.ok) {
           throw new Error(`Lỗi máy chủ: ${response.status}`);
        }
        
        setTimeout(() => {
            refetch();
        }, 1500);

    } catch (e: any) {
        console.error("Lỗi khi thêm dữ liệu:", e);
        throw new Error(`Không thể thêm dữ liệu: ${e.message}`);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorMessage message={error} />;
    }
    if (data && data.length > 0) {
      return <DataTable data={data} />;
    }
    if (data) {
        return <p className="text-center text-slate-500">Không tìm thấy dữ liệu trong trang tính.</p>
    }
    return null;
  };

  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
      <header className="w-full max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Trình quản lý Google Sheet
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Xem và thêm dữ liệu vào Google Sheet công khai.
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              title="Cài đặt kết nối"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </button>

            {!config.scriptUrl && (
                <button
                    onClick={() => setIsSetupOpen(true)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                    Hướng dẫn
                </button>
            )}
            <button
            onClick={handleOpenAddModal}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md transition-all transform hover:scale-105 flex items-center gap-2"
            disabled={loading}
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Thêm mới
            </button>
        </div>
      </header>
      
      <main className="w-full max-w-7xl mx-auto bg-white dark:bg-slate-800 shadow-lg rounded-xl p-4 sm:p-6 min-h-[400px]">
        {renderContent()}
      </main>

      <AddDataModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        headers={headers}
        onSubmit={handleAddData}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={config}
        onSave={handleSaveSettings}
      />

      <SetupInstructions 
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        spreadsheetId={config.spreadsheetId}
      />
    </div>
  );
};

export default App;