import "@/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import { Geist, Geist_Mono } from "next/font/google";
import { useRouter } from 'next/router'

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  const { pathname } = useRouter()

  return (
    <ClerkProvider {...pageProps}>
      <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <Navbar />
        <Component {...pageProps} />
      </div>
    </ClerkProvider>
  );
}
