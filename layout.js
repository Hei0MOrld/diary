import './globals.css'

export const metadata = {
  title: 'KO — 日記',
  description: '日々の記録',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
