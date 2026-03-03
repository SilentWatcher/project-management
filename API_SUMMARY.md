# API Endpoints Summary

## Base URL
`http://localhost:5000/api`

---

## 1. Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Login and get tokens |
| POST | `/auth/refresh` | Get new access token (uses cookie) |
| POST | `/auth/logout` | Clear refresh token cookie |
| GET | `/auth/me` | Get current logged-in user |
| PUT | `/auth/profile` | Update user name/avatar |

---

## 2. Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects` | List all projects you belong to |
| POST | `/projects` | Create a new project |
| GET | `/projects/:id` | Get project details + members |
| PUT | `/projects/:id` | Update project (admin only) |
| DELETE | `/projects/:id` | Delete project (admin only) |
| POST | `/projects/:id/members` | Add member by email |
| DELETE | `/projects/:id/members/:userId` | Remove member |
| PUT | `/projects/:id/members/:userId/role` | Change member role |

---

## 3. Boards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/boards/project/:projectId` | List all boards in a project |
| POST | `/boards/project/:projectId` | Create a new board |
| GET | `/boards/:boardId` | Get board with columns & tasks |
| PUT | `/boards/:boardId` | Update board name/description |
| DELETE | `/boards/:boardId` | Delete a board |

---

## 4. Columns
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/columns/board/:boardId` | List columns in a board |
| POST | `/columns/board/:boardId` | Create a new column |
| PUT | `/columns/:columnId` | Update column name |
| DELETE | `/columns/:columnId` | Delete a column |
| PUT | `/columns/board/:boardId/reorder` | Reorder columns |
| POST | `/columns/move-task` | Move task between columns (drag-drop) |

---

## 5. Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks/dashboard/stats` | Get task counts by status/priority |
| GET | `/tasks/my-tasks` | Get tasks assigned to current user |
| GET | `/tasks/board/:boardId` | List all tasks in a board |
| POST | `/tasks/board/:boardId` | Create a new task |
| GET | `/tasks/:taskId` | Get task details + comments |
| PUT | `/tasks/:taskId` | Update task (title, status, priority, etc.) |
| DELETE | `/tasks/:taskId` | Delete a task |
| POST | `/tasks/:taskId/comments` | Add comment to task |
| DELETE | `/tasks/:taskId/comments/:commentId` | Delete comment |

## 6. Upload (Cloudinary)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/image` | Upload general image |
| POST | `/upload/avatar` | Upload avatar (auto-resized to 200x200) |
| POST | `/upload/task/:taskId` | Upload task attachment |
| DELETE | `/upload/:publicId` | Delete uploaded image |

---

## Headers Required
| Header | Value |
|--------|-------|
| Content-Type | `application/json` |
| Authorization | `Bearer <accessToken>` (protected routes) |

## Error Response Format
```json
{
  "status": "fail",
  "message": "Error description",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

## Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |
