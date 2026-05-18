import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppHeader from "@/components/AppHeader";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Scholar Sync",
    description: "Scholar Sync — University learning platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">
                <AppHeader />
                <main className="flex-1">{children}</main>
                <footer className="w-full border-t border-black/6 py-6">
                    <div className="max-w-6xl mx-auto px-6 text-sm text-slate-600">
                        © {new Date().getFullYear()} Scholar Sync
                    </div>
                </footer>
            </body>
        </html>
    );
}
