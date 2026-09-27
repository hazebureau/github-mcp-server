const AUTHORIZATION_SERVER = "https://github-auth.brumelight.com";
const RESOURCE = "https://github-auth.brumelight.com/mcp";
const AUTHORIZATION_ENDPOINT = "https://github-auth.brumelight.com/login/oauth/authorize";
const GITHUB_AUTHORIZATION_ENDPOINT = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_ENDPOINT = "https://github.com/login/oauth/access_token";

const RESOURCE_METADATA = {
	resource: RESOURCE,
	authorization_servers: [AUTHORIZATION_SERVER],
	scopes_supported: [
		"repo",
		"read:org",
		"read:user",
		"user:email",
		"read:packages",
		"write:packages",
		"read:project",
		"project",
		"gist",
		"notifications",
	],
	bearer_methods_supported: ["header"],
	resource_name: "GitHub MCP Server",
};

const AUTHORIZATION_SERVER_METADATA = {
	issuer: AUTHORIZATION_SERVER,
	authorization_endpoint: AUTHORIZATION_ENDPOINT,
	token_endpoint: GITHUB_TOKEN_ENDPOINT,
	grant_types_supported: ["authorization_code"],
	response_types_supported: ["code"],
	code_challenge_methods_supported: ["S256"],
	token_endpoint_auth_methods_supported: ["client_secret_post"],
};

const RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource/mcp";
const AUTHORIZATION_ENDPOINT_PATH = "/login/oauth/authorize";
const AUTHORIZATION_SERVER_METADATA_PATH = "/.well-known/oauth-authorization-server";

function corsHeaders() {
	return {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
		"Access-Control-Allow-Headers": "Accept, Content-Type, Authorization",
		"Access-Control-Max-Age": "86400",
	};
}

export default {
	fetch(request) {
		const url = new URL(request.url);
		console.log("metadata_request", request.method, url.pathname);
		if (url.pathname === AUTHORIZATION_ENDPOINT_PATH) {
			if (request.method !== "GET") {
				return new Response("Method not allowed", {
					status: 405,
					headers: {
						Allow: "GET",
						"Cache-Control": "no-store",
					},
				});
			}

			const target = new URL(GITHUB_AUTHORIZATION_ENDPOINT);
			target.search = url.search;
			return new Response(null, {
				status: 302,
				headers: {
					Location: target.toString(),
					"Cache-Control": "no-store",
					"Referrer-Policy": "no-referrer",
				},
			});
		}

		const metadata =
			url.pathname === RESOURCE_METADATA_PATH
				? RESOURCE_METADATA
				: url.pathname === AUTHORIZATION_SERVER_METADATA_PATH
					? AUTHORIZATION_SERVER_METADATA
					: null;
		if (metadata === null) {
			return new Response("Not found", {
				status: 404,
				headers: { "Cache-Control": "no-store" },
			});
		}

		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: { ...corsHeaders(), "Cache-Control": "no-store" },
			});
		}

		if (request.method !== "GET" && request.method !== "HEAD") {
			return new Response("Method not allowed", {
				status: 405,
				headers: {
					...corsHeaders(),
					Allow: "GET, HEAD, OPTIONS",
					"Cache-Control": "no-store",
				},
			});
		}

		return new Response(request.method === "HEAD" ? null : JSON.stringify(metadata), {
			status: 200,
			headers: {
				...corsHeaders(),
				"Cache-Control": "no-store",
				"Content-Type": "application/json; charset=utf-8",
			},
		});
	},
};
