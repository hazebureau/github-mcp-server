# GitHub OAuth metadata alias

This Cloudflare Worker serves only the OAuth authorization-server metadata
endpoint for `github-auth.brumelight.com`. Authorization and token requests go
directly to GitHub; the Worker does not receive OAuth codes, access tokens, or
client secrets.

Deploy this directory as a Worker and bind the custom domain
`github-auth.brumelight.com`. The public handler is limited to
`/.well-known/oauth-authorization-server`; other paths return `404`.

The alias is used by the parallel TARTAROS MCP endpoint while the existing
`git.brumelight.com` route remains on Brumebox. Do not switch the existing
production route as part of deploying this metadata Worker.
