import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// The legacy subdomain 301s to the canonical one so shared links and search
	// indexing consolidate on datacentres.civicinterplay.io.
	async redirects() {
		return [
			// The root needs its own rule. On "/" the :path* segment matches
			// nothing, and the placeholder is left unsubstituted, so the old
			// hostname's home page was redirecting to a literal
			// https://datacentres.civicinterplay.io/:path* — which resolves
			// nowhere. Every deeper path substituted correctly. Order matters:
			// first match wins, so this sits above the catch-all.
			{
				source: "/",
				has: [{ type: "host", value: "sovereignties.civicinterplay.io" }],
				destination: "https://datacentres.civicinterplay.io/",
				permanent: true,
			},
			{
				source: "/:path*",
				has: [{ type: "host", value: "sovereignties.civicinterplay.io" }],
				destination: "https://datacentres.civicinterplay.io/:path*",
				permanent: true,
			},
		];
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
