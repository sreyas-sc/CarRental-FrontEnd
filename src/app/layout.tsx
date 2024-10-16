'use client'
// import type { Metadata } from "next";
import React, { ReactNode } from 'react'; 
import "./globals.css";
import { Poppins } from 'next/font/google';
import Footer from './components/Footer/footer'
import Navbar from "./components/Header/header";
import { ApolloProvider } from '@apollo/client';
import client from "@/lib/apollo-client";
// import ApolloClientProvider from "@/apollo/ApolloClientProvider";

const poppins = Poppins({
  weight: ['400', '700'],
  subsets: ['latin'],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ApolloProvider client={client}>
    <html lang="en">
      <body className={poppins.className}>
        {/* <ApolloProvider client={client}> */}
          {/* <ApolloClientProvider> */}
          
          <Navbar />
          {children}
          <Footer />
        {/* </ApolloProvider> */}
        {/* </ApolloClientProvider> */}
      </body>
    </html>
    </ApolloProvider>
  );
}