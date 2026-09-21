import './globals.css';

export const metadata = {
  title: 'Road to HSK 6',
  description: 'Học tiếng Trung theo bộ 标准教程 — 6 cấp, 18 quyển',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
