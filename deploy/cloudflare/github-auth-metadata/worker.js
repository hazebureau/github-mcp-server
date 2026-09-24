const ISSUER = "https://github-auth.brumelight.com";

const METADATA = {
	issuer: ISSUER,
	authorization_endpoint: "https://github.com/login/oauth/authorize",
	token_endpoint: "https://github.com/login/oauth/access_token",
	response_types_supported: ["code"],
	grant_types_supported: ["authorization_code"],
	token_endpoint_auth_methods_supported: ["client_secret_post"],
	code_challenge_methods_supported: ["S256"],
	authorization_response_iss_parameter_supported: false,
};

const RESOURCE_METADATA = {
 resource: ISSUER + "/mcp",
	authorization_servers: [ISSUER],
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

const METADATA_PATH = "/.well-known/oauth-authorization-server";
const RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource/mcp";

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
		const metadata =
			url.pathname === METADATA_PATH
				? METADATA
				: url.pathname === RESOURCE_METADATA_PATH
					? RESOURCE_METADATA
					: null;

		if (!metadata) {
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
				"Cache-Control": "public, max-age=300",
				"Content-Type": "application/json; charset=utf-8",
			},
		});
	},
};
