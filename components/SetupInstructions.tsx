import React from 'react';

interface SetupInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetId: string;
}

const SetupInstructions: React.FC<SetupInstructionsProps> = ({ isOpen, onClose, spreadsheetId }) => {
  if (!isOpen) return null;

  const scriptCode = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data = JSON.parse(e.postData.contents);
    
    // Lấy tiêu đề cột từ hàng đầu tiên
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Tạo mảng hàng mới dựa trên tiêu đề
    var nextRow = headers.map(function(header) {
      return data[header] || "";
    });

    sheet.appendRow(nextRow);

    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl mx-auto flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Cấu hình Ghi dữ liệu Google Sheet
          </h3>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4 text-slate-700 dark:text-slate-300">
          <p>
            Để cho phép ứng dụng web ghi vào Google Sheet của bạn mà không cần backend, bạn cần tạo một 
            <strong> Google Apps Script Web App</strong> đơn giản.
          </p>
          
          <ol className="list-decimal list-inside space-y-3">
            <li>
              Mở Google Sheet của bạn (ID: <code>{spreadsheetId.substring(0, 8)}...</code>): 
              <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">
                Mở Sheet ngay
              </a>
            </li>
            <li>Chọn menu <strong>Extensions (Tiện ích mở rộng)</strong> &gt; <strong>Apps Script</strong>.</li>
            <li>Xóa mã mặc định và dán đoạn mã sau vào:</li>
          </ol>

          <div className="relative group">
            <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-md overflow-x-auto text-xs sm:text-sm font-mono border border-slate-200 dark:border-slate-700">
              {scriptCode}
            </pre>
          </div>

          <ol className="list-decimal list-inside space-y-3" start={4}>
            <li>Lưu dự án (Nhấn biểu tượng đĩa mềm).</li>
            <li>
              Nhấn nút <strong>Deploy (Triển khai)</strong> &gt; <strong>New deployment (Bài triển khai mới)</strong>.
            </li>
            <li>
              Chọn loại: <strong>Web app</strong>.
              <ul className="list-disc list-inside ml-5 mt-1 text-sm text-slate-600 dark:text-slate-400">
                <li>Description: "API"</li>
                <li>Execute as: <strong>Me (Tôi)</strong></li>
                <li>Who has access: <strong>Anyone (Bất kỳ ai)</strong> - Quan trọng!</li>
              </ul>
            </li>
            <li>Nhấn <strong>Deploy</strong> và sao chép <strong>Web App URL</strong>.</li>
            <li>Dán URL đó vào biến <code>GOOGLE_SCRIPT_URL</code> trong file <code>App.tsx</code> (hoặc nhập vào phần cài đặt).</li>
          </ol>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Đã hiểu, đóng lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupInstructions;