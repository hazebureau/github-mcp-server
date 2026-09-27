# GitHub MCP OAuth metadata

This Cloudflare Worker serves OAuth metadata for the parallel TARTAROS MCP
resource at `https://github-auth.brumelight.com/mcp` and serves OAuth discovery
metadata for browser clients. Its authorization-server issuer is
`https://github-auth.brumelight.com`; the authorization endpoint is a fixed
redirect alias on this host, and the token endpoint remains GitHub's
`https://github.com/login/oauth/access_token`. The metadata advertises PKCE
`S256` and `client_secret_post`, which the ChatGPT connector requires during
OAuth discovery.

The Worker serves protected-resource metadata at
`/.well-known/oauth-protected-resource/mcp`, RFC 8414 metadata at
`/.well-known/oauth-authorization-server`, and OIDC discovery metadata at
`/.well-known/openid-configuration`. The latter two return the same issuer and
endpoints. The fixed `/login/oauth/authorize` alias redirects to GitHub's
`https://github.com/login/oauth/authorize`, preserving the query string. GitHub
returns the authorization code to the registered ChatGPT `redirect_uri`; token
requests go directly to GitHub. This Worker does not receive OAuth codes,
access tokens, or client secrets.

Deploy this directory as a Worker and bind the custom domain
`github-auth.brumelight.com`. The public handler serves only the three
metadata paths and the authorization alias; other paths return `404`.
The Worker's application log records request methods and paths only. Cloudflare's
Events view also displays platform invocation URLs, which may include query
strings. The application logger does not write request headers or bodies.

The parallel TARTAROS MCP uses this host as its resource base so its
`WWW-Authenticate` challenge resolves to this Worker. Its resource metadata
names the local metadata-proxy issuer. Metadata responses send
`Cache-Control: no-store` to avoid retaining stale issuer data.
The existing `git.brumelight.com` route remains on Brumebox and is not changed
here.
