import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Interactive Coding Assistant',
  description: 'AI-powered coding assistant with desktop automation and rich interfaces',
  keywords: ['AI', 'Coding', 'Assistant', 'Desktop', 'Automation', 'Gemini', 'Ant Design'],
  authors: [{ name: 'MiniMax Agent' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1677ff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ConfigProvider
          theme={{
            algorithm: theme.defaultAlgorithm,
            token: {
              colorPrimary: '#1677ff',
              borderRadius: 8,
              colorBgContainer: '#ffffff',
              colorBgElevated: '#ffffff',
              colorBorder: '#d9d9d9',
              fontFamily: inter.style.fontFamily,
            },
            components: {
              Button: {
                borderRadius: 8,
              },
              Card: {
                borderRadius: 12,
              },
              Input: {
                borderRadius: 8,
              },
              Message: {
                borderRadius: 8,
              },
            },
          }}
          locale={zhCN}
        >
          {children}
        </ConfigProvider>
      </body>
    </html>
  )
}
