import type { Metadata } from "next";
import { Geist, Geist_Mono, Fira_Sans } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// Civic Interplay heading typeface, used for the map overlay chrome.
const firaSans = Fira_Sans({
	variable: "--font-fira",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
	title: "AI Sovereignties",
	description: "A live map of Australia's AI infrastructure and who owns it.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${geistSans.variable} ${geistMono.variable} ${firaSans.variable} antialiased`}>{children}</body>
		</html>
	);
}
