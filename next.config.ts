import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// The legacy subdomain 301s to the canonical one so shared links and search
	// indexing consolidate on datacentres.civicinterplay.io.
	async redirects() {
		return [
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
