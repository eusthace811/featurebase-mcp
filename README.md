# Featurebase MCP Server

[![smithery badge](https://smithery.ai/badge/@eusthace811/featurebase-mcp)](https://smithery.ai/server/@eusthace811/featurebase-mcp)

A Model Context Protocol (MCP) server that provides access to the Featurebase API for managing posts, comments, and changelogs. Built with native Node.js 22+ fetch API for optimal performance and minimal dependencies.

## Features

- **Posts Management**
  - List posts with filtering options
  - Create new posts
  - Update existing posts
  - Delete posts
  - Get post upvoters
  - Add upvoters to posts
  - Resolve post slugs
  - Find similar submissions

- **Comments Management**
  - Get comments for posts/changelogs
  - Create new comments or replies
  - Update comments
  - Delete comments

- **Changelogs Management**
  - List changelogs with filtering (draft/live)
  - Create new changelogs (HTML or Markdown)
  - Update existing changelogs
  - Publish/unpublish changelogs with email notifications
  - Delete changelogs
  - Manage changelog subscribers
  - Add/remove subscribers

## Installation

### From GitHub (Recommended)

Use npx to run directly from GitHub:

```bash
npx -y github:eusthace811/featurebase-mcp
```

### From npm (Once Published)

```bash
npx -y featurebase-mcp
```

Or install globally:

```bash
npm install -g featurebase-mcp
```

### From Source

```bash
git clone https://github.com/eusthace811/featurebase-mcp.git
cd featurebase-mcp
pnpm install
pnpm build
```

## Usage

### Claude Desktop Configuration

Add this server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Using npx with GitHub (Recommended)

```json
{
  "mcpServers": {
    "featurebase": {
      "command": "npx",
      "args": [
        "-y",
        "github:eusthace811/featurebase-mcp",
        "--api-key",
        "your-api-key-here"
      ]
    }
  }
}
```

Optional: Add `--org-url` if you need slug resolution:

```json
{
  "mcpServers": {
    "featurebase": {
      "command": "npx",
      "args": [
        "-y",
        "github:eusthace811/featurebase-mcp",
        "--api-key",
        "your-api-key-here",
        "--org-url",
        "https://your-org.featurebase.app"
      ]
    }
  }
}
```

#### Using npx with npm (Once Published)

```json
{
  "mcpServers": {
    "featurebase": {
      "command": "npx",
      "args": [
        "-y",
        "featurebase-mcp",
        "--api-key",
        "your-api-key-here"
      ]
    }
  }
}
```

#### Using Global Installation

```json
{
  "mcpServers": {
    "featurebase": {
      "command": "featurebase-mcp",
      "args": [
        "--api-key",
        "your-api-key-here"
      ]
    }
  }
}
```

#### Using Local Installation

```json
{
  "mcpServers": {
    "featurebase": {
      "command": "node",
      "args": [
        "/path/to/featurebase-mcp/build/index.js",
        "--api-key",
        "your-api-key-here"
      ]
    }
  }
}
```

#### Alternative: Using Environment Variables

You can also use environment variables instead of CLI arguments (or in combination):

```json
{
  "mcpServers": {
    "featurebase": {
      "command": "npx",
      "args": ["-y", "github:eusthace811/featurebase-mcp"],
      "env": {
        "FEATUREBASE_API_KEY": "your-api-key-here",
        "FEATUREBASE_ORG_URL": "https://your-org.featurebase.app"
      }
    }
  }
}
```

**Note**: CLI arguments take precedence over environment variables.

### Getting Your API Key

1. Log in to your Featurebase account
2. Navigate to your account settings
3. Generate an API key
4. Keep it secure - never commit it to version control

### Configuration Options

The server can be configured using either CLI arguments (recommended) or environment variables.

#### CLI Arguments (Recommended)

- `--api-key`: Your FeatureBase API key (required)
- `--org-url`: Your organization's FeatureBase URL (e.g., "https://feedback.spacelift.io"). Required only if using `resolve_post_slug` tool.
- `--base-url`: Custom API base URL (defaults to "https://do.featurebase.app/v2")

Example:
```bash
npx -y github:eusthace811/featurebase-mcp --api-key "your-api-key" --org-url "https://your-org.featurebase.app"
```

#### Environment Variables (Alternative)

- `FEATUREBASE_API_KEY`: Your FeatureBase API key (required if not using `--api-key`)
- `FEATUREBASE_ORG_URL`: Your organization's FeatureBase URL (optional)
- `FEATUREBASE_BASE_URL`: Custom API base URL (optional)

You can set them:

1. In your Claude Desktop configuration (see examples above)
2. Export in your shell: `export FEATUREBASE_API_KEY="your-api-key-here"`
3. When running the server: `FEATUREBASE_API_KEY="your-api-key-here" npx featurebase-mcp`

**Note**: CLI arguments take precedence over environment variables.

## Available Tools

### Posts

#### `list_posts`
List posts with optional filtering.

Parameters:
- `id`: Find specific post by ID
- `q`: Search posts by title or content
- `category`: Filter by board names (array)
- `status`: Filter by status IDs (array)
- `sortBy`: Sort order (e.g., "date:desc", "upvotes:desc")
- `startDate`: Posts created after this date
- `endDate`: Posts created before this date
- `limit`: Results per page
- `page`: Page number

#### `create_post`
Create a new post.

Parameters:
- `title` (required): Post title (min 2 characters)
- `category` (required): Board/category name
- `content`: Post content
- `email`: Submitter's email
- `authorName`: Name for new users
- `tags`: Array of tag names
- `commentsAllowed`: Enable/disable comments
- `status`: Post status
- `date`: Creation date
- `customInputValues`: Custom field values

#### `update_post`
Update an existing post.

Parameters:
- `id` (required): Post ID to update
- `title`: New title
- `content`: New content
- `status`: New status
- `commentsAllowed`: Enable/disable comments
- `category`: New category
- `sendStatusUpdateEmail`: Email upvoters about status change
- `tags`: New tags
- `inReview`: Put post in review
- `date`: Creation date
- `customInputValues`: Custom field values

#### `delete_post`
Permanently delete a post.

Parameters:
- `id` (required): Post ID to delete

#### `get_post_upvoters`
Get list of users who upvoted a post.

Parameters:
- `submissionId` (required): Post ID
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10, max: 100)

#### `add_upvoter`
Add an upvoter to a post.

Parameters:
- `id` (required): Post ID
- `email` (required): Upvoter's email
- `name` (required): Upvoter's name

#### `resolve_post_slug`
Convert a post slug to post ID and get complete post details.

Parameters:
- `slug` (required): Post slug from URL (e.g., "spacectl-stack-local-preview-target")

Returns the complete post data including ID, title, content, and metadata.

#### `get_similar_submissions`
Find posts similar to the given query text.

Parameters:
- `query` (required): Search query text to find similar submissions
- `locale`: Locale for search (default: "en")

Returns a list of similar posts based on content similarity.

### Comments

#### `get_comments`
Get comments for a post or changelog.

Parameters:
- `submissionId`: Post ID or slug (required if no changelogId)
- `changelogId`: Changelog ID or slug (required if no submissionId)
- `privacy`: Filter by privacy ("public", "private", "all")
- `inReview`: Filter for comments in review
- `commentThreadId`: Get all comments in a thread
- `limit`: Results per page (default: 10)
- `page`: Page number (default: 1)
- `sortBy`: Sort order ("best", "top", "new", "old")

#### `create_comment`
Create a new comment or reply.

Parameters:
- `content` (required): Comment content
- `submissionId`: Post ID or slug (required if no changelogId)
- `changelogId`: Changelog ID or slug (required if no submissionId)
- `parentCommentId`: Parent comment ID for replies
- `isPrivate`: Make comment private (admins only)
- `sendNotification`: Notify voters (default: true)
- `createdAt`: Set creation date
- `author`: Post as specific user (object with name, email, profilePicture)

#### `update_comment`
Update an existing comment.

Parameters:
- `id` (required): Comment ID
- `content`: New content
- `isPrivate`: Make private (admins only)
- `pinned`: Pin comment to top
- `inReview`: Put comment in review
- `createdAt`: Update creation date

#### `delete_comment`
Delete a comment (soft delete if it has replies).

Parameters:
- `id` (required): Comment ID to delete

### Changelogs

#### `list_changelogs`
List changelogs with optional filtering.

Parameters:
- `id`: Find specific changelog by ID
- `q`: Search changelogs by title or content
- `categories`: Filter by category names (array)
- `state`: Filter by state ("draft" or "live")
- `limit`: Results per page (max: 100)
- `page`: Page number
- `select`: Fields to return (e.g., "id,title" or "title,state,categories")

#### `create_changelog`
Create a new changelog entry (starts in draft state).

Parameters:
- `title` (required): Changelog title
- `htmlContent`: HTML content of the changelog (use this OR markdownContent)
- `markdownContent`: Markdown content of the changelog (use this OR htmlContent)
- `changelogCategories`: Array of category identifiers (e.g., ["New", "Fixed", "Improved"])

**Note**: Use `changelogCategories` (not `categories`) when creating changelogs.

#### `update_changelog`
Update an existing changelog (does not change publish state).

Parameters:
- `id` (required): Changelog ID to update
- `title`: New title
- `htmlContent`: New HTML content
- `markdownContent`: New markdown content
- `changelogCategories`: New categories (array)

**Note**: To change publish state, use `publish_changelog` or `unpublish_changelog` tools.

#### `publish_changelog`
Publish a changelog and optionally send email notifications to subscribers.

Parameters:
- `id` (required): Changelog ID to publish
- `sendEmail` (required): Whether to send email notification to subscribers
- `locales`: Array of locales to publish to (defaults to empty array = all locales if not specified)
- `scheduledDate`: Future date to schedule publication (ISO 8601 format)

**Note**: The `locales` parameter is optional. If not provided, the changelog will be published to all locales by default.

#### `unpublish_changelog`
Unpublish a changelog (change state from live to draft).

Parameters:
- `id` (required): Changelog ID to unpublish
- `locales`: Array of locales to unpublish from (defaults to empty array = all locales if not specified)

**Note**: The `locales` parameter is optional. If not provided, the changelog will be unpublished from all locales by default.

#### `delete_changelog`
Delete a changelog permanently.

Parameters:
- `id` (required): Changelog ID to delete

#### `get_changelog_subscribers`
Get list of changelog subscribers.

Parameters:
- `limit`: Results per page (default: 10, max: 100)
- `page`: Page number (default: 1)

#### `add_changelog_subscriber`
Add a subscriber to changelog updates.

Parameters:
- `email` (required): Subscriber email
- `name` (required): Subscriber name

#### `remove_changelog_subscriber`
Remove a subscriber from changelog updates.

Parameters:
- `email` (required): Subscriber email to remove

## Development

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm build

# Run in development mode
pnpm dev
```

### Technical Details

- **Node.js**: Requires Node.js 22.0.0 or higher
- **Dependencies**: Built with native fetch API (no axios dependency)
- **Package Manager**: Uses pnpm for faster, more efficient installs
- **TypeScript**: Fully typed with TypeScript 5.7+

## Security

- Never hardcode your API key in your code
- Use CLI arguments or environment variables for API keys
- Keep your API key secure and rotate it regularly
- The server will not start without a valid API key (via `--api-key` argument or `FEATUREBASE_API_KEY` environment variable)

## Publishing

This server is available on:
- [Smithery](https://smithery.ai/server/featurebase) - MCP server registry
- [npm](https://www.npmjs.com/package/featurebase-mcp) - Node package manager

For publishing instructions, see [PUBLISHING.md](./PUBLISHING.md).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
