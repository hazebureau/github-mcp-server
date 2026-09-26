# Test-only GitHub OAuth metadata adapter

This isolated Worker serves a deliberately small OAuth authorization-server
metadata document at `/.well-known/oauth-authorization-server`. It advertises
GitHub's authorization and token endpoints and the PKCE `S256` method, using
the Worker URL as a test issuer.

The test issuer differs from GitHub's actual issuer. Use this Worker only to
isolate ChatGPT's connector-creation metadata check. Do not complete an OAuth
authorization flow through this alias, and do not use it as a production
authorization server. GitHub's canonical issuer and the production Brumebox
endpoint remain unchanged.

The Worker accepts only `GET`, `HEAD`, and `OPTIONS`, returns no secret or
user-specific data, and serves no OAuth authorization or token requests.
