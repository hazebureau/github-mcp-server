package github

import (
	"context"
	"encoding/base64"
	"net/http"
	"strings"
	"testing"

	"github.com/github/github-mcp-server/internal/toolsnaps"
	"github.com/github/github-mcp-server/pkg/translations"
	"github.com/google/go-github/v89/github"
	"github.com/google/jsonschema-go/jsonschema"
	"github.com/modelcontextprotocol/go-sdk/mcp"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func runGetFileTextTest(t *testing.T, raw []byte, reportedSize int, args map[string]any) *mcp.CallToolResult {
	t.Helper()

	content := &github.RepositoryContent{
		Name:     github.Ptr("README.md"),
		Path:     github.Ptr("README.md"),
		SHA:      github.Ptr(gitBlobSHA(raw)),
		Type:     github.Ptr("file"),
		Size:     github.Ptr(reportedSize),
		Encoding: github.Ptr("base64"),
	}
	if raw != nil {
		content.Content = github.Ptr(base64.StdEncoding.EncodeToString(raw))
	}

	client := mustNewGHClient(t, MockHTTPClientWithHandlers(map[string]http.HandlerFunc{
		GetReposGitRefByOwnerByRepoByRef: mockResponse(t, http.StatusOK, &github.Reference{
			Ref:    github.Ptr("refs/heads/main"),
			Object: &github.GitObject{SHA: github.Ptr(strings.Repeat("a", 40)), Type: github.Ptr("commit")},
		}),
		GetReposContentsByOwnerByRepoByPath: mockResponse(t, http.StatusOK, content),
	}))
	deps := BaseDeps{Client: client}
	tool := GetFileText(translations.NullTranslationHelper)
	handler := tool.Handler(deps)
	request := createMCPRequest(args)
	result, err := handler(ContextWithDeps(context.Background(), deps), &request)
	require.NoError(t, err)
	return result
}

func Test_GetFileText(t *testing.T) {
	serverTool := GetFileText(translations.NullTranslationHelper)
	tool := serverTool.Tool
	require.NoError(t, toolsnaps.Test(tool.Name, tool))

	schema, ok := tool.InputSchema.(*jsonschema.Schema)
	require.True(t, ok, "InputSchema should be *jsonschema.Schema")
	assert.Equal(t, "get_file_text", tool.Name)
	assert.Contains(t, schema.Properties, "owner")
	assert.Contains(t, schema.Properties, "repo")
	assert.Contains(t, schema.Properties, "path")
	assert.Contains(t, schema.Properties, "ref")
	assert.Contains(t, schema.Properties, "sha")
	assert.ElementsMatch(t, []string{"owner", "repo", "path"}, schema.Required)

	tests := []struct {
		name      string
		content   []byte
		size      int
		want      string
		wantError string
		useSHA    bool
	}{
		{
			name:    "markdown is returned directly as text",
			content: []byte("# README\n\nHello from GitHub.\n"),
			size:    len("# README\n\nHello from GitHub.\n"),
			want:    "# README\n\nHello from GitHub.\n",
		},
		{
			name:    "Japanese UTF-8 is preserved",
			content: []byte("# 概要\n\nこんにちは、世界。\n"),
			size:    len([]byte("# 概要\n\nこんにちは、世界。\n")),
			want:    "# 概要\n\nこんにちは、世界。\n",
		},
		{
			name:    "source code is returned directly as text",
			content: []byte("package main\n\nfunc main() {}\n"),
			size:    len("package main\n\nfunc main() {}\n"),
			want:    "package main\n\nfunc main() {}\n",
		},
		{
			name:    "commit SHA is accepted in place of ref",
			content: []byte("# Read from a commit\n"),
			size:    len("# Read from a commit\n"),
			want:    "# Read from a commit\n",
			useSHA:  true,
		},
		{
			name:      "invalid UTF-8 is rejected",
			content:   []byte{0xff, 0xfe, 0xfd},
			size:      3,
			wantError: "not valid UTF-8",
		},
		{
			name:      "binary content is rejected",
			content:   []byte{0x00, 0x01, 0x02, 0x03},
			size:      4,
			wantError: "binary file content",
		},
		{
			name:      "file at the size limit is rejected before decoding",
			size:      maxFileTextBytes,
			wantError: "1 MiB size limit",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			args := map[string]any{
				"owner": "owner",
				"repo":  "repo",
				"path":  "README.md",
				"ref":   "refs/heads/main",
			}
			if tc.useSHA {
				delete(args, "ref")
				args["sha"] = strings.Repeat("b", 40)
			}
			result := runGetFileTextTest(t, tc.content, tc.size, args)
			if tc.wantError != "" {
				require.True(t, result.IsError)
				require.Len(t, result.Content, 1)
				message, ok := result.Content[0].(*mcp.TextContent)
				require.True(t, ok)
				assert.Contains(t, message.Text, tc.wantError)
				return
			}

			require.False(t, result.IsError)
			require.Len(t, result.Content, 1)
			text, ok := result.Content[0].(*mcp.TextContent)
			require.True(t, ok, "file text should be MCP TextContent, not a resource")
			assert.Equal(t, tc.want, text.Text)
		})
	}
}
