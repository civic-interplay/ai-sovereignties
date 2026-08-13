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
	metadataBase: new URL("https://datacentres.civicinterplay.io"),
	title: "Australian Data Centres",
	description:
		"Monitoring data centre investments as a super cycle urban transition.",
	openGraph: {
		title: "Australian Data Centres",
		description:
			"Monitoring data centre investments as a super cycle urban transition.",
		url: "https://datacentres.civicinterplay.io",
		siteName: "Civic Interplay",
		type: "website",
		images: [
			{
				url: "/og.png",
				width: 1200,
				height: 630,
				alt: "Australian Data Centres: monitoring data centre investments as a super cycle urban transition",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "Australian Data Centres",
		description:
			"Monitoring data centre investments as a super cycle urban transition.",
		images: ["/og.png"],
	},
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
			{/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's
			    cz-shortcut-listen) add attributes to <body> before React hydrates.
			    This only covers this element's own attributes, not its children, so
			    real hydration mismatches inside the app still surface. */}
			<body suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} ${firaSans.variable} antialiased`}>{children}</body>
		</html>
	);
}
