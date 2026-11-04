import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import DashboardLayout from '../components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: 'DevFlow AI - AI-Powered Software Development & Project Intelligence Platform',
  description: 'DevFlow AI: AI-Powered Software Development & Project Intelligence Platform with predictive risk analytics, milestone forecasting, and automated governance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        <ThemeProvider>
          <AuthProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

