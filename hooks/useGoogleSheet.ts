import { useState, useEffect, useCallback } from 'react';

/**
 * Phân tích cú pháp một chuỗi CSV thành một mảng các đối tượng.
 * Xử lý các trường được trích dẫn chứa dấu phẩy.
 * @param csvText Chuỗi CSV thô.
 * @returns Một mảng các đối tượng, trong đó mỗi đối tượng đại diện cho một hàng.
 */
const parseCSV = (csvText: string): Record<string, string>[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 1) return [];

  // Trích xuất tiêu đề, cắt bỏ khoảng trắng và loại bỏ dấu ngoặc kép
  const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
  const data = [];

  // Xử lý các hàng
  for (let i = 1; i < lines.length; i++) {
    // Regex để tách bằng dấu phẩy nhưng bỏ qua dấu phẩy trong dấu ngoặc kép
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (values.length !== headers.length) {
        continue; // Bỏ qua các hàng bị lỗi
    }
    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Cắt bỏ khoảng trắng và loại bỏ dấu ngoặc kép bao quanh giá trị
      entry[header] = value.trim().replace(/^"|"$/g, '');
    });
    data.push(entry);
  }

  return data;
};

/**
 * Custom hook để lấy và phân tích cú pháp dữ liệu từ một Google Sheet công khai.
 * @param spreadsheetId ID của Google Spreadsheet.
 * @param sheetGid GID của trang tính cụ thể.
 * @returns Một đối tượng với các trạng thái data, loading, error và hàm refetch.
 */
const useGoogleSheet = (spreadsheetId: string, sheetGid: string) => {
  const [data, setData] = useState<Record<string, string>[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState<number>(0);

  const refetch = useCallback(() => {
    setTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!spreadsheetId || !sheetGid) {
        setError("Phải cung cấp Spreadsheet ID và Sheet GID.");
        setLoading(false);
        return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${sheetGid}&t=${Date.now()}`;
        // Sử dụng một CORS proxy vì Google Sheets CSV export không gửi CORS headers.
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl);

        if (!response.ok) {
          throw new Error(`Không thể lấy dữ liệu: ${response.status} ${response.statusText}`);
        }
        
        const csvText = await response.text();
        if(!csvText) {
          throw new Error("Nhận được phản hồi trống từ máy chủ.");
        }
        
        const parsedData = parseCSV(csvText);
        setData(parsedData);
      } catch (e: any) {
        console.error("Không thể lấy dữ liệu Google Sheet:", e);
        setError(`Không thể tải dữ liệu. Vui lòng kiểm tra xem Google Sheet có công khai và được chia sẻ đúng cách không. Lỗi: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [spreadsheetId, sheetGid, trigger]);

  return { data, loading, error, refetch };
};

export default useGoogleSheet;