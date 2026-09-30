$ErrorActionPreference = 'Stop'

$credentialPath = 'C:\ProgramData\BrumeLight\credentials\github-mcp.env'
$credentialPrefix = 'GITHUB_PERSONAL_ACCESS_TOKEN='
$executablePath = 'C:\Program Files\BrumeLight\GitHubMCP\v1.12.2-brumelight.3171283\github-mcp-server.exe'
$authorizationServerMetadataPath = 'C:\ProgramData\BrumeLight\services\GitHubMCP\authorization-server-metadata.68b6ceb9.json'

if (-not (Test-Path -LiteralPath $credentialPath -PathType Leaf)) {
    throw 'GitHub MCP credential file is missing.'
}
if (-not (Test-Path -LiteralPath $executablePath -PathType Leaf)) {
    throw 'GitHub MCP executable is missing.'
}
if (-not (Test-Path -LiteralPath $authorizationServerMetadataPath -PathType Leaf)) {
    throw 'GitHub OAuth authorization-server metadata is missing.'
}

$credentialFile = [System.IO.File]::ReadAllText($credentialPath).Trim()
if (-not $credentialFile.StartsWith($credentialPrefix, [System.StringComparison]::Ordinal)) {
    throw 'GitHub MCP credential file format is invalid.'
}

$env:GITHUB_PERSONAL_ACCESS_TOKEN = $credentialFile.Substring($credentialPrefix.Length)
if ($env:GITHUB_PERSONAL_ACCESS_TOKEN.Length -lt 20) {
    throw 'GitHub MCP credential is missing.'
}
Remove-Variable credentialFile

# Preserve the existing default toolset; --read-only is intentionally omitted.
& $executablePath http `
    --listen-host 127.0.0.1 `
    --port 8082 `
    --toolsets=default `
    --authorization-server https://github.com/login/oauth `
    --base-url https://git.brumelight.com `
    --base-path /mcp `
    --trust-proxy-headers `
    --authorization-server-metadata-file $authorizationServerMetadataPath

exit $LASTEXITCODE
