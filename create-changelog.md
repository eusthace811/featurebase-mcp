Generate a version number, summary, and changelog draft using the Featurebase MCP server.

Steps:
1. Review the latest commit messages.
2. Read the major version from `package.json` and compute the version as `{MAJOR}.{MINOR}`, where MINOR is the total commit count (e.g. `0.1.1234`).
3. Summarize commits into:
   - **Title:** concise human summary (e.g. “Improved scheduling and fixed UI bugs”)
   - **Description:** markdown bullet list of changes.
4. Call the `FeaturebaseMCP` server to create and publish the changelog draft.
5. Print the generated version.

