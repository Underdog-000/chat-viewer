export const metadata = {
  title: "Chat Viewer",
  description: "Viewer for imported dialogs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#f5f5f5" }}>
        {children}
      </body>
    </html>
  );
}
