# API Reference

## Authentication

All API requests require a Bearer token in the Authorization header:

```
Authorization: Bearer your_api_key_here
```

Generate API keys at Settings > API Keys.

## Base URL

```
https://api.example.com/v1
```

## Rate Limits

- Free: 100 requests/minute
- Pro: 1,000 requests/minute
- Enterprise: 10,000 requests/minute

Rate limit headers are included in every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

## Endpoints

### List Projects
```
GET /projects
```
Returns all projects you have access to. Supports `?page=1&limit=20` pagination.

### Create Project
```
POST /projects
Content-Type: application/json

{ "name": "my-project", "template": "starter" }
```

### Get Project
```
GET /projects/:id
```

### Delete Project
```
DELETE /projects/:id
```
Requires project owner permissions. Deletion is permanent after the 30-day grace period.

## Webhooks

Configure webhooks at Settings > Webhooks. Events: `project.created`, `project.deleted`, `build.completed`, `build.failed`, `team.member_added`.

Webhook payloads are signed with HMAC-SHA256. Verify the `X-Webhook-Signature` header using your webhook secret.

## SDKs

Official SDKs available for:
- JavaScript/TypeScript: `npm install @example/sdk`
- Python: `pip install example-sdk`
- Go: `go get github.com/example/sdk-go`

## Errors

All errors return JSON with `error` and `message` fields:
```json
{ "error": "not_found", "message": "Project not found" }
```

HTTP status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 429 (rate limited), 500 (server error).
