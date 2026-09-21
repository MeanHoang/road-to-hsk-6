import './globals.css';

export const metadata = {
  title: 'Road to HSK 6',
  description: 'Học tiếng Trung theo bộ 标准教程 — 6 cấp, 18 quyển',
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f8fb' },
    { media: '(prefers-color-scheme: dark)', color: '#0d131d' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <main className="app-shell">{children}</main>
      </body>
    </html>
  );
}
