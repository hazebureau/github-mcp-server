const ISSUER = "https://github-auth.brumelight.com";

const METADATA = {
	issuer: ISSUER,
	authorization_endpoint: "https://github.com/login/oauth/authorize",
	token_endpoint: "https://github.com/login/oauth/access_token",
	response_types_supported: ["code"],
	grant_types_supported: ["authorization_code"],
	token_endpoint_auth_methods_supported: ["client_secret_post"],
	code_challenge_methods_supported: ["S256"],
};

const METADATA_PATH = "/.well-known/oauth-authorization-server";

export default {
	fetch(request) {
		const url = new URL(request.url);

		if (url.pathname !== METADATA_PATH) {
			return new Response("Not found", {
				status: 404,
				headers: { "Cache-Control": "no-store" },
			});
		}

		if (request.method !== "GET" && request.method !== "HEAD") {
			return new Response("Method not allowed", {
				status: 405,
				headers: { Allow: "GET, HEAD", "Cache-Control": "no-store" },
			});
		}

		return new Response(request.method === "HEAD" ? null : JSON.stringify(METADATA), {
			status: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Cache-Control": "public, max-age=300",
				"Content-Type": "application/json; charset=utf-8",
			},
		});
	},
};
