# GitHub OAuth resource metadata alias

This Cloudflare Worker serves only protected-resource metadata for the
parallel TARTAROS MCP resource at
`https://github-auth.brumelight.com/mcp`. The canonical GitHub.com OAuth
issuer is `https://github.com/login/oauth`; GitHub publishes its own RFC 8414
metadata at `https://github.com/.well-known/oauth-authorization-server/login/oauth`.
Authorization and token requests go directly to GitHub. The Worker does not
receive OAuth codes, access tokens, or client secrets.

Deploy this directory as a Worker and bind the custom domain
`github-auth.brumelight.com`. The public handler is limited to
`/.well-known/oauth-protected-resource/mcp`; other paths return `404`.

The parallel TARTAROS MCP uses the alias as its resource base so its
`WWW-Authenticate` challenge resolves to this Worker. The metadata names
GitHub's canonical OAuth issuer so clients discover GitHub's own PKCE metadata.
The existing `git.brumelight.com` route remains on Brumebox and is not changed
here.
