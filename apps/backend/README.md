# `mergeable-backend`

Backend server for Mergeable.

## Configuration

The following environment variables are available.
Variables followed by a \* are required.

| Name                           | Description                                             | Default |
| ------------------------------ | ------------------------------------------------------- | ------- |
| `MERGEABLE_GITHUB_CLIENT_ID`\  | The client ID of the GitHub OAuth app.                  |         |
| `MERGEABLE_GITHUB_CLIENT_ID`\  | The client secret associated with the GitHub OAuth app. |         |
| `MERGEABLE_APP_URL`\*          | The URL of Mergeable, as accessed by the user.          |         |
| `DATABASE_URL`\*               | The URL of the PostgreSQL database that stores data.    |         |
