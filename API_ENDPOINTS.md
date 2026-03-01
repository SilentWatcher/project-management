# API Endpoints

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <accessToken>
```

### Auth Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/refresh` | Refresh access token | No (uses httpOnly cookie) |
| POST | `/auth/logout` | Logout user | No |
| GET | `/auth/me` | Get current user | Yes |
| PUT | `/auth/profile` | Update profile | Yes |

### Auth Request/Response Examples

**Register:**
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login:**
```json
POST /auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## Projects

| Method | Endpoint | Description | Auth Required | Permissions |
|--------|----------|-------------|---------------|-------------|
| GET | `/projects` | List user's projects | Yes | Any |
| POST | `/projects` | Create new project | Yes | Any |
| GET | `/projects/:id` | Get project details | Yes | Member |
| PUT | `/projects/:id` | Update project | Yes | Admin |
| DELETE | `/projects/:id` | Delete project | Yes | Admin |
| POST | `/projects/:id/members` | Add member | Yes | Admin |
| DELETE | `/projects/:id/members/:userId` | Remove member | Yes | Admin |
| PUT | `/projects/:id/members/:userId/role` | Update member role | Yes | Admin |

### Project Request Examples

**Create Project:**
```json
POST /projects
{
  "name": "Website Redesign",
  "description": "Complete redesign of company website"
}
```

**Add Member:**
```json
POST /projects/:id/members
{
  "email": "jane@example.com",
  "role": "member"
}
```

---

## Boards

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/boards/project/:projectId` | List project boards | Yes |
| POST | `/boards/project/:projectId` | Create board | Yes |
| GET | `/boards/:boardId` | Get board with columns & tasks | Yes |
| PUT | `/boards/:boardId` | Update board | Yes |
| DELETE | `/boards/:boardId` | Delete board | Yes |

---

## Columns

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/columns/board/:boardId` | List board columns | Yes |
| POST | `/columns/board/:boardId` | Create column | Yes |
| PUT | `/columns/:columnId` | Update column | Yes |
| DELETE | `/columns/:columnId` | Delete column | Yes |
| PUT | `/columns/board/:boardId/reorder` | Reorder columns | Yes |
| POST | `/columns/move-task` | Move task (drag-drop) | Yes |

### Move Task Request
```json
POST /columns/move-task
{
  "sourceColumnId": "...",
  "destinationColumnId": "...",
  "sourceIndex": 0,
  "destinationIndex": 1,
  "taskId": "..."
}
```

---

## Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks/dashboard/stats` | Get dashboard stats | Yes |
| GET | `/tasks/my-tasks` | Get current user's tasks | Yes |
| GET | `/tasks/board/:boardId` | List board tasks | Yes |
| POST | `/tasks/board/:boardId` | Create task | Yes |
| GET | `/tasks/:taskId` | Get task details | Yes |
| PUT | `/tasks/:taskId` | Update task | Yes |
| DELETE | `/tasks/:taskId` | Delete task | Yes |
| POST | `/tasks/:taskId/comments` | Add comment | Yes |
| DELETE | `/tasks/:taskId/comments/:commentId` | Delete comment | Yes |

### Task Request Examples

**Create Task:**
```json
POST /tasks/board/:boardId
{
  "title": "Design homepage",
  "description": "Create mockups for homepage",
  "priority": "high",
  "dueDate": "2024-01-15",
  "assignee": "userId",
  "columnId": "columnId"
}
```

**Update Task:**
```json
PUT /tasks/:taskId
{
  "title": "Updated title",
  "status": "in-progress",
  "priority": "medium"
}
```

**Add Comment:**
```json
POST /tasks/:taskId/comments
{
  "text": "This looks great!"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "status": "fail",
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Email is required" }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Server Error |
