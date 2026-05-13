import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Stars of Africa Football Academy - Trial Registration 2026',
  description: 'Official trial registration for Stars of Africa Football Academy. Register now for June/July 2026 trials in Johannesburg.',
  keywords: 'football academy, trials, registration, Johannesburg, sports',
  openGraph: {
    title: 'Stars of Africa Football Academy - Trial Registration',
    description: 'Join South Africa\'s leading football academy trials.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
