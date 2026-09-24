# GitHub OAuth metadata alias

This Cloudflare Worker serves protected-resource metadata for the parallel
TARTAROS MCP resource at `https://github-auth.brumelight.com/mcp`, plus OAuth
authorization-server metadata at `https://github-auth.brumelight.com`.
The alias advertises GitHub's authorization and token endpoints with PKCE
S256, because GitHub's OpenID Connect discovery document does not advertise
PKCE even though its OAuth 2.0 metadata does. Authorization and token requests
go directly to GitHub. The Worker does not receive OAuth codes, access tokens,
or client secrets.

Deploy this directory as a Worker and bind the custom domain
`github-auth.brumelight.com`. The public handler is limited to
`/.well-known/oauth-protected-resource/mcp` and
`/.well-known/oauth-authorization-server`; other paths return `404`.

The parallel TARTAROS MCP uses the alias as its resource base so its
`WWW-Authenticate` challenge resolves to this Worker. Its protected-resource
metadata names the alias issuer, and its OAuth metadata points authorization
and token requests directly to GitHub. The existing `git.brumelight.com` route
remains on Brumebox and is not changed here.
