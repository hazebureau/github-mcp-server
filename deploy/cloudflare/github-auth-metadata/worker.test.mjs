import assert from "node:assert/strict";
import test from "node:test";
import worker from "./worker.js";

const origin = "https://github-auth.brumelight.com";

test("serves OAuth authorization metadata with PKCE S256", async () => {
	const response = await worker.fetch(
		new Request(`${origin}/.well-known/oauth-authorization-server`),
	);
	const metadata = await response.json();

	assert.equal(response.status, 200);
	assert.equal(metadata.issuer, origin);
	assert.deepEqual(metadata.code_challenge_methods_supported, ["S256"]);
	assert.equal(metadata.authorization_endpoint, `${origin}/login/oauth/authorize`);
	assert.equal(metadata.token_endpoint, "https://github.com/login/oauth/access_token");
});

test("does not advertise OpenID Connect for the GitHub OAuth App", async () => {
	const response = await worker.fetch(
		new Request(`${origin}/.well-known/openid-configuration`),
	);

	assert.equal(response.status, 404);
});

test("keeps the MCP protected-resource metadata available", async () => {
	const response = await worker.fetch(
		new Request(`${origin}/.well-known/oauth-protected-resource/mcp`),
	);
	const metadata = await response.json();

	assert.equal(response.status, 200);
	assert.equal(metadata.resource, `${origin}/mcp`);
	assert.deepEqual(metadata.authorization_servers, [origin]);
});
