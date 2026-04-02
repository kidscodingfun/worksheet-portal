import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Math Worksheet Generator for Grades 1–8 | WorksheetWiz",
  description:
    "Create printable math worksheets in seconds for Grades 1–8. Choose topics, select difficulty, and generate practice sheets for addition, decimals, fractions, and more.",
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
      <body className="min-h-screen flex flex-col bg-white">
        <div className="flex-1">
          {children}
        </div>

        <footer className="border-t pt-6 pb-6 text-center text-sm text-gray-600 bg-white">
          <p>
            Looking for coding resources for kids in Kitchener-Waterloo?{" "}
            <a
              href="https://www.kidscodingfun.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black"
            >
              Visit KidsCodingFun
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}