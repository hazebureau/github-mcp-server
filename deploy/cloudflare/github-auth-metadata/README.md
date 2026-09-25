# GitHub MCP protected-resource metadata

This Cloudflare Worker serves protected-resource metadata for the parallel
TARTAROS MCP resource at `https://github-auth.brumelight.com/mcp`. It advertises
GitHub's canonical OAuth issuer, `https://github.com/login/oauth`. OAuth
discovery uses GitHub's official metadata at
`https://github.com/.well-known/oauth-authorization-server/login/oauth`, which
advertises PKCE S256 and issuer identification. Authorization and token
requests go directly to GitHub; this Worker does not receive OAuth codes,
access tokens, or client secrets.

Deploy this directory as a Worker and bind the custom domain
`github-auth.brumelight.com`. The public handler is limited to
`/.well-known/oauth-protected-resource/mcp`; other paths return `404`.

The parallel TARTAROS MCP uses this host as its resource base so its
`WWW-Authenticate` challenge resolves to this Worker. Its resource metadata
names GitHub's canonical issuer. Metadata responses send
`Cache-Control: no-store` to avoid retaining stale issuer data.
The existing `git.brumelight.com` route remains on Brumebox and is not changed
here.
