#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import mask from "json-mask";

const commentModel = "upvoted, downvoted, inReview, isSpam, pinned, emailSent, sendNotification, organization, submission, author, authorId, authorPicture, isPrivate, isDeleted, confidenceScore, content, upvotes, downvotes, score, parentComment, path, createdAt, updatedAt, id";

interface FeaturebaseConfig {
  apiKey: string;
  baseUrl?: string;
  orgUrl?: string;
}

class FeaturebaseAPI {
  private baseUrl: string;
  private apiKey: string;
  private orgUrl: string;

  constructor(config: FeaturebaseConfig) {
    this.baseUrl = config.baseUrl || "https://do.featurebase.app/v2";
    this.apiKey = config.apiKey;
    this.orgUrl = config.orgUrl || "";
  }

  private async request<T>(
    path: string,
    options: RequestInit & { params?: Record<string, any> } = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${this.baseUrl}${path}`;

    // Add query parameters if provided
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "X-API-Key": this.apiKey,
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage: string;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = JSON.stringify(errorJson);
      } catch {
        errorMessage = errorBody || response.statusText;
      }
      throw new Error(`HTTP ${response.status}: ${errorMessage}`);
    }

    return response.json() as Promise<T>;
  }

  // Posts endpoints
  async listPosts(params?: {
    id?: string;
    q?: string;
    category?: string[];
    status?: string[];
    sortBy?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
  }) {
    return this.request<any>("/posts", { params });
  }

  async createPost(data: {
    title: string;
    category: string;
    content?: string;
    email?: string;
    authorName?: string;
    tags?: string[];
    commentsAllowed?: boolean;
    status?: string;
    date?: string;
    customInputValues?: Record<string, any>;
  }) {
    return this.request<any>("/posts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePost(data: {
    id: string;
    title?: string;
    content?: string;
    status?: string;
    commentsAllowed?: boolean;
    category?: string;
    sendStatusUpdateEmail?: boolean;
    tags?: string[];
    inReview?: boolean;
    date?: string;
    customInputValues?: Record<string, any>;
  }) {
    return this.request<any>("/posts", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string) {
    return this.request<any>("/posts", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  }

  async getPostUpvoters(
    submissionId: string,
    page: number = 1,
    limit: number = 10
  ) {
    return this.request<any>("/posts/upvoters", {
      params: { submissionId, page, limit },
    });
  }

  async addUpvoter(id: string, email: string, name: string) {
    return this.request<any>("/posts/upvoters", {
      method: "POST",
      body: JSON.stringify({ id, email, name }),
    });
  }

  async resolvePostSlug(slug: string) {
    if (!this.orgUrl) {
      throw new Error("FEATUREBASE_ORG_URL environment variable is required for slug resolution");
    }
    const url = new URL("/api/v1/submission", this.orgUrl);
    url.searchParams.append("slug", slug);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  async getSimilarSubmissions(query: string, locale: string = "en") {
    if (!this.orgUrl) {
      throw new Error("FEATUREBASE_ORG_URL environment variable is required for similar submissions");
    }
    const url = new URL("/api/v1/submission/getSimilarSubmissions", this.orgUrl);
    url.searchParams.append("query", query);
    url.searchParams.append("locale", locale);
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // Comments endpoints
  async getComments(params: {
    submissionId?: string;
    changelogId?: string;
    privacy?: "public" | "private" | "all";
    inReview?: boolean;
    commentThreadId?: string;
    limit?: number;
    page?: number;
    sortBy?: "best" | "top" | "new" | "old";
  }) {
    return this.request<any>("/comment", { params });
  }

  async createComment(data: {
    submissionId?: string;
    changelogId?: string;
    content: string;
    parentCommentId?: string;
    isPrivate?: boolean;
    sendNotification?: boolean;
    createdAt?: string;
    author?: {
      name: string;
      email: string;
      profilePicture?: string;
    };
  }) {
    return this.request<any>("/comment", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateComment(data: {
    id: string;
    content?: string;
    isPrivate?: boolean;
    pinned?: boolean;
    inReview?: boolean;
    createdAt?: string;
  }) {
    return this.request<any>("/comment", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteComment(id: string) {
    return this.request<any>("/comment", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  }

  // Changelog endpoints
  async listChangelogs(params?: {
    id?: string;
    q?: string;
    category?: string[];
    state?: "draft" | "live";
    limit?: number;
    page?: number;
  }) {
    return this.request<any>("/changelog", { params });
  }

  async createChangelog(data: {
    title: string;
    htmlContent?: string;
    markdownContent?: string;
    categories?: string[];
  }) {
    return this.request<any>("/changelog", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateChangelog(data: {
    id: string;
    title?: string;
    htmlContent?: string;
    markdownContent?: string;
    categories?: string[];
    state?: "draft" | "live";
  }) {
    return this.request<any>("/changelog", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteChangelog(id: string) {
    return this.request<any>("/changelog", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  }

  async getChangelogSubscribers(params?: {
    limit?: number;
    page?: number;
  }) {
    return this.request<any>("/changelog/subscribers", { params });
  }

  async addChangelogSubscriber(data: {
    email: string;
    name: string;
  }) {
    return this.request<any>("/changelog/subscribers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeChangelogSubscriber(email: string) {
    return this.request<any>("/changelog/subscribers", {
      method: "DELETE",
      body: JSON.stringify({ email }),
    });
  }
}

/**
 * Parse command-line arguments
 */
function parseArgs(): { apiKey?: string; baseUrl?: string; orgUrl?: string } {
  const args = process.argv.slice(2);
  const result: { apiKey?: string; baseUrl?: string; orgUrl?: string } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api-key' && i + 1 < args.length) {
      result.apiKey = args[i + 1];
      i++;
    } else if (args[i] === '--base-url' && i + 1 < args.length) {
      result.baseUrl = args[i + 1];
      i++;
    } else if (args[i] === '--org-url' && i + 1 < args.length) {
      result.orgUrl = args[i + 1];
      i++;
    }
  }

  return result;
}

class FeaturebaseMCPServer {
  private server: Server;
  private api: FeaturebaseAPI;

  constructor() {
    // Parse command-line arguments (takes precedence over environment variables)
    const cliArgs = parseArgs();

    const apiKey = cliArgs.apiKey || process.env.FEATUREBASE_API_KEY;
    if (!apiKey) {
      throw new Error("API key is required. Provide via --api-key argument or FEATUREBASE_API_KEY environment variable");
    }

    const baseUrl = cliArgs.baseUrl || process.env.FEATUREBASE_BASE_URL;
    const orgUrl = cliArgs.orgUrl || process.env.FEATUREBASE_ORG_URL;
    this.api = new FeaturebaseAPI({ apiKey, baseUrl, orgUrl });

    this.server = new Server(
      {
        name: "featurebase-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Posts tools
        {
          name: "list_posts",
          description:
            "List posts with optional filtering. Available fields: id, title, content, author, authorId, authorPicture, commentsAllowed, organization, upvotes, upvoted, postCategory(category,private,prefill,roles,hiddenFromRoles,id), postTags(name,color,private,id), postStatus(name,color,type,isDefault,id), date, lastModified, comments, isSubscribed, inReview, lastDraggedTimestamps",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Find submission by its id" },
              q: {
                type: "string",
                description: "Search for posts by title or content",
              },
              category: {
                type: "array",
                items: { type: "string" },
                description: "Filter posts by category (board) names",
              },
              status: {
                type: "array",
                items: { type: "string" },
                description: "Filter posts by status ids",
              },
              sortBy: {
                type: "string",
                description: 'Sort posts (e.g., "date:desc" or "upvotes:desc")',
              },
              startDate: {
                type: "string",
                description: "Get posts created after this date",
              },
              endDate: {
                type: "string",
                description: "Get posts created before this date",
              },
              limit: {
                type: "number",
                description: "Number of results per page",
              },
              page: { type: "number", description: "Page number" },
              select: {
                type: "string",
                description:
                  'Fields to return. Examples: "id,title,upvotes" | "title,author(name)" | "postCategory(category),postStatus(name)". Leave empty for all fields.',
              },
            },
            required: [],
          },
        },
        {
          name: "create_post",
          description: "Create a new post",
          inputSchema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Post title (min 2 characters)",
              },
              category: {
                type: "string",
                description: "The board (category) for the post",
              },
              content: {
                type: "string",
                description: "Post content (can be empty)",
              },
              email: {
                type: "string",
                description: "Email of the user submitting",
              },
              authorName: {
                type: "string",
                description: "Name for new user if email not found",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "Array of tag names",
              },
              commentsAllowed: {
                type: "boolean",
                description: "Allow comments on post",
              },
              status: { type: "string", description: "Post status" },
              date: { type: "string", description: "Post creation date" },
              customInputValues: {
                type: "object",
                description: "Custom field values",
              },
            },
            required: ["title", "category"],
          },
        },
        {
          name: "update_post",
          description: "Update an existing post",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Post ID to update" },
              title: { type: "string", description: "New title" },
              content: { type: "string", description: "New content" },
              status: { type: "string", description: "New status" },
              commentsAllowed: {
                type: "boolean",
                description: "Allow comments",
              },
              category: { type: "string", description: "New category" },
              sendStatusUpdateEmail: {
                type: "boolean",
                description: "Send status update email to upvoters",
              },
              tags: {
                type: "array",
                items: { type: "string" },
                description: "New tags",
              },
              inReview: { type: "boolean", description: "Put post in review" },
              date: { type: "string", description: "Post creation date" },
              customInputValues: {
                type: "object",
                description: "Custom field values",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "delete_post",
          description: "Delete a post permanently",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Post ID to delete" },
            },
            required: ["id"],
          },
        },
        {
          name: "get_post_upvoters",
          description: "Get list of users who upvoted a post",
          inputSchema: {
            type: "object",
            properties: {
              submissionId: { type: "string", description: "Post ID" },
              page: { type: "number", description: "Page number (default: 1)" },
              limit: {
                type: "number",
                description: "Results per page (default: 10, max: 100)",
              },
            },
            required: ["submissionId"],
          },
        },
        {
          name: "add_upvoter",
          description: "Add an upvoter to a post",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Post ID" },
              email: { type: "string", description: "Upvoter email" },
              name: { type: "string", description: "Upvoter name" },
            },
            required: ["id", "email", "name"],
          },
        },
        // Comments tools
        {
          name: "get_comments",
          description:
            `Get comments for a post or changelog. Available fields: ${commentModel}, replies(${commentModel})`,
          inputSchema: {
            type: "object",
            properties: {
              submissionId: {
                type: "string",
                description: "Post ID or slug (required if no changelogId)",
              },
              changelogId: {
                type: "string",
                description:
                  "Changelog ID or slug (required if no submissionId)",
              },
              privacy: {
                type: "string",
                enum: ["public", "private", "all"],
                description: "Filter by privacy setting",
              },
              inReview: {
                type: "boolean",
                description: "Filter for comments in review",
              },
              commentThreadId: {
                type: "string",
                description: "Get all comments in a thread",
              },
              limit: {
                type: "number",
                description: "Results per page (default: 10)",
              },
              page: { type: "number", description: "Page number (default: 1)" },
              sortBy: {
                type: "string",
                enum: ["best", "top", "new", "old"],
                description: "Sort order (default: best)",
              },
              select: {
                type: "string",
                description:
                  'Fields to return. Examples: "id,content,author(name)" | "content,upvotes,createdAt" | "author(name,email),replies(content)". Leave empty for all fields.',
              },
            },
            required: [],
          },
        },
        {
          name: "create_comment",
          description: "Create a new comment or reply",
          inputSchema: {
            type: "object",
            properties: {
              submissionId: {
                type: "string",
                description: "Post ID or slug (required if no changelogId)",
              },
              changelogId: {
                type: "string",
                description:
                  "Changelog ID or slug (required if no submissionId)",
              },
              content: { type: "string", description: "Comment content" },
              parentCommentId: {
                type: "string",
                description: "Parent comment ID for replies",
              },
              isPrivate: {
                type: "boolean",
                description: "Make comment private (admins only)",
              },
              sendNotification: {
                type: "boolean",
                description: "Notify voters (default: true)",
              },
              createdAt: { type: "string", description: "Set creation date" },
              author: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  profilePicture: { type: "string" },
                },
                description: "Post as specific user",
              },
            },
            required: ["content"],
          },
        },
        {
          name: "update_comment",
          description: "Update an existing comment",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Comment ID" },
              content: { type: "string", description: "New content" },
              isPrivate: {
                type: "boolean",
                description: "Make private (admins only)",
              },
              pinned: { type: "boolean", description: "Pin comment to top" },
              inReview: {
                type: "boolean",
                description: "Put comment in review",
              },
              createdAt: {
                type: "string",
                description: "Update creation date",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "delete_comment",
          description: "Delete a comment (soft delete if has replies)",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Comment ID to delete" },
            },
            required: ["id"],
          },
        },
        {
          name: "resolve_post_slug",
          description: "Convert a post slug to post ID and get post details",
          inputSchema: {
            type: "object",
            properties: {
              slug: { 
                type: "string", 
                description: "Post slug from URL (e.g., 'spacectl-stack-local-preview-target')" 
              },
            },
            required: ["slug"],
          },
        },
        {
          name: "get_similar_submissions",
          description: "Find posts similar to the given query text",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query text to find similar submissions"
              },
              locale: {
                type: "string",
                description: "Locale for search (default: 'en')"
              },
            },
            required: ["query"],
          },
        },
        // Changelog tools
        {
          name: "list_changelogs",
          description: "List changelogs with optional filtering",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Find changelog by its ID" },
              q: {
                type: "string",
                description: "Search for changelogs by title or content",
              },
              category: {
                type: "array",
                items: { type: "string" },
                description: "Filter changelogs by category names",
              },
              state: {
                type: "string",
                enum: ["draft", "live"],
                description: "Filter by state (draft or live)",
              },
              limit: {
                type: "number",
                description: "Number of results per page (max: 100)",
              },
              page: { type: "number", description: "Page number" },
              select: {
                type: "string",
                description:
                  'Fields to return. Examples: "id,title" | "title,state,categories". Leave empty for all fields.',
              },
            },
            required: [],
          },
        },
        {
          name: "create_changelog",
          description: "Create a new changelog entry",
          inputSchema: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Changelog title",
              },
              htmlContent: {
                type: "string",
                description: "HTML content of the changelog (use this OR markdownContent)",
              },
              markdownContent: {
                type: "string",
                description: "Markdown content of the changelog (use this OR htmlContent)",
              },
              categories: {
                type: "array",
                items: { type: "string" },
                description: "Array of category identifiers",
              },
            },
            required: ["title"],
          },
        },
        {
          name: "update_changelog",
          description: "Update an existing changelog",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Changelog ID to update" },
              title: { type: "string", description: "New title" },
              htmlContent: {
                type: "string",
                description: "New HTML content",
              },
              markdownContent: {
                type: "string",
                description: "New markdown content",
              },
              categories: {
                type: "array",
                items: { type: "string" },
                description: "New categories",
              },
              state: {
                type: "string",
                enum: ["draft", "live"],
                description: "Change state to draft or live",
              },
            },
            required: ["id"],
          },
        },
        {
          name: "delete_changelog",
          description: "Delete a changelog permanently",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Changelog ID to delete" },
            },
            required: ["id"],
          },
        },
        {
          name: "get_changelog_subscribers",
          description: "Get list of changelog subscribers",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Results per page (default: 10, max: 100)",
              },
              page: { type: "number", description: "Page number (default: 1)" },
            },
            required: [],
          },
        },
        {
          name: "add_changelog_subscriber",
          description: "Add a subscriber to changelog updates",
          inputSchema: {
            type: "object",
            properties: {
              email: { type: "string", description: "Subscriber email" },
              name: { type: "string", description: "Subscriber name" },
            },
            required: ["email", "name"],
          },
        },
        {
          name: "remove_changelog_subscriber",
          description: "Remove a subscriber from changelog updates",
          inputSchema: {
            type: "object",
            properties: {
              email: { type: "string", description: "Subscriber email to remove" },
            },
            required: ["email"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Posts handlers
          case "list_posts": {
            const { select, ...apiArgs } = args as any;
            const result = await this.api.listPosts(apiArgs);

            const filtered = select
              ? {
                  ...result,
                  results:
                    result.results?.map((post: any) => mask(post, select)) ||
                    [],
                }
              : result;
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(filtered),
                },
              ],
            };
          }

          case "create_post": {
            const result = await this.api.createPost(args as any);
            const filtered = {
              success: result.success,
              submission: {
                id: result.submission?.id,
              },
            };
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(filtered),
                },
              ],
            };
          }

          case "update_post": {
            const result = await this.api.updatePost(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "delete_post": {
            const { id } = args as any;
            const result = await this.api.deletePost(id);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "get_post_upvoters": {
            const { submissionId, page = 1, limit = 10 } = args as any;
            const result = await this.api.getPostUpvoters(
              submissionId,
              page,
              limit
            );
            const filtered = {
              results:
                result.results?.map((upvoter: any) => ({
                  userId: upvoter.userId,
                  organizationId: upvoter.organizationId,
                  companies: upvoter.companies?.map((company: any) => ({
                    id: company.id,
                    name: company.name,
                  })),
                  email: upvoter.email,
                  name: upvoter.name,
                })) || [],
              page: result.page,
              limit: result.limit,
              totalPages: result.totalPages,
              totalResults: result.totalResults,
            };
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(filtered),
                },
              ],
            };
          }

          case "add_upvoter": {
            const { id, email, name } = args as any;
            const result = await this.api.addUpvoter(id, email, name);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          // Comments handlers
          case "get_comments": {
            const { select, ...apiArgs } = args as any;
            const result = await this.api.getComments(apiArgs);

            const filtered = select
              ? {
                  ...result,
                  results:
                    result.results?.map((comment: any) =>
                      mask(comment, select)
                    ) || [],
                }
              : result;
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(filtered),
                },
              ],
            };
          }

          case "create_comment": {
            const result = await this.api.createComment(args as any);
            const filtered = {
              success: result.success,
              comment: {
                id: result.comment?.id,
              },
            };
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(filtered),
                },
              ],
            };
          }

          case "update_comment": {
            const result = await this.api.updateComment(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "delete_comment": {
            const { id } = args as any;
            const result = await this.api.deleteComment(id);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "resolve_post_slug": {
            const { slug } = args as any;
            const result = await this.api.resolvePostSlug(slug);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "get_similar_submissions": {
            const { query, locale = "en" } = args as any;
            const result = await this.api.getSimilarSubmissions(query, locale);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          // Changelog handlers
          case "list_changelogs": {
            const { select, ...apiArgs } = args as any;
            const result = await this.api.listChangelogs(apiArgs);

            const filtered = select
              ? {
                  ...result,
                  results:
                    result.results?.map((changelog: any) => mask(changelog, select)) ||
                    [],
                }
              : result;
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(filtered),
                },
              ],
            };
          }

          case "create_changelog": {
            const result = await this.api.createChangelog(args as any);
            const filtered = {
              success: result.success,
              changelog: {
                id: result.changelog?.id,
              },
            };
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(filtered),
                },
              ],
            };
          }

          case "update_changelog": {
            const result = await this.api.updateChangelog(args as any);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "delete_changelog": {
            const { id } = args as any;
            const result = await this.api.deleteChangelog(id);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "get_changelog_subscribers": {
            const { limit = 10, page = 1 } = args as any;
            const result = await this.api.getChangelogSubscribers({ limit, page });
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "add_changelog_subscriber": {
            const { email, name } = args as any;
            const result = await this.api.addChangelogSubscriber({ email, name });
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          case "remove_changelog_subscriber": {
            const { email } = args as any;
            const result = await this.api.removeChangelogSubscriber(email);
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result),
                },
              ],
            };
          }

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error: any) {
        throw new McpError(
          ErrorCode.InternalError,
          `Featurebase API error: ${error.message}`
        );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Featurebase MCP server running on stdio");
  }
}

const server = new FeaturebaseMCPServer();
server.run().catch(console.error);
