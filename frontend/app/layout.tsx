
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "../components/HeaderWrapper";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Doctor Council | Medical Counselling",
    template: "%s | Doctor Council",
  },
  description:
    "Doctor Council helps students explore medical courses, colleges and admission opportunities with expert counselling guidance.",
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
      <body className="flex min-h-full flex-col">

        <HeaderWrapper />

        <main className="flex-1">
          {children}
        </main>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="colored"
        />

      </body>
    </html>
  );
}
