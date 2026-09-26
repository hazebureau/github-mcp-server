const ISSUER = "https://github-oauth-metadata-test.brumelight.workers.dev";
const DISCOVERY_PATH = "/.well-known/oauth-authorization-server";

const METADATA = {
	issuer: ISSUER,
	authorization_endpoint: "https://github.com/login/oauth/authorize",
	token_endpoint: "https://github.com/login/oauth/access_token",
	grant_types_supported: ["authorization_code"],
	response_types_supported: ["code"],
	code_challenge_methods_supported: ["S256"],
	token_endpoint_auth_methods_supported: ["client_secret_post"],
};

function headers() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
		"Access-Control-Allow-Headers": "Accept, Content-Type",
		"Cache-Control": "no-store",
	};
}

export default {
	fetch(request) {
		const url = new URL(request.url);
		if (url.pathname !== DISCOVERY_PATH) {
			return new Response("Not found", {
				status: 404,
				headers: { "Cache-Control": "no-store" },
			});
		}

		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: headers() });
		}

		if (request.method !== "GET" && request.method !== "HEAD") {
			return new Response("Method not allowed", {
				status: 405,
				headers: { ...headers(), Allow: "GET, HEAD, OPTIONS" },
			});
		}

		return new Response(request.method === "HEAD" ? null : JSON.stringify(METADATA), {
			status: 200,
			headers: { ...headers(), "Content-Type": "application/json; charset=utf-8" },
		});
	},
};
