# GitHub OAuth metadata alias

This Cloudflare Worker serves OAuth authorization-server metadata and the
protected-resource metadata for the parallel TARTAROS MCP resource at
`https://github-auth.brumelight.com/mcp`. Authorization and token requests go
directly to GitHub; the Worker does not receive OAuth codes, access tokens, or
client secrets.

Deploy this directory as a Worker and bind the custom domain
`github-auth.brumelight.com`. The public handler is limited to
`/.well-known/oauth-authorization-server` and
`/.well-known/oauth-protected-resource/mcp`; other paths return `404`.

The parallel TARTAROS MCP uses the alias as its resource base so its
`WWW-Authenticate` challenge resolves to this Worker. The existing
`git.brumelight.com` route remains on Brumebox and is not changed here.
