# Database Schema Design

## Overview

This application uses MongoDB with Mongoose ODM. The schema follows a **hybrid approach** combining embedded and referenced documents for optimal performance and scalability.

## Design Decisions

### Why Hybrid Approach?

1. **Tasks are standalone** - Most frequently accessed/mutated entity
2. **Columns store taskIds array** - Enables efficient drag-drop reordering without rewriting large documents
3. **References for relationships** - Allows independent querying and updates
4. **Comments embedded in tasks** - Reduces query complexity for common use case

## Collections

### 1. Users
```javascript
{
  _id: ObjectId,
  name: String,           // User's full name
  email: String,          // Unique email address
  password: String,       // Bcrypt hashed (excluded from queries by default)
  avatar: String,         // Optional avatar URL
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)

---

### 2. Projects
```javascript
{
  _id: ObjectId,
  name: String,           // Project name (max 100 chars)
  description: String,    // Optional description (max 500 chars)
  owner: ObjectId,        // Reference to User (project creator)
  members: [{             // Array of embedded member objects
    user: ObjectId,       // Reference to User
    role: String,         // 'admin' | 'member' | 'viewer'
    joinedAt: Date
  }],
  isActive: Boolean,      // Soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `owner` - For finding projects by owner
- `members.user` - For finding projects where user is a member

**Methods:**
- `isMember(userId)` - Check if user is a project member
- `getUserRole(userId)` - Get user's role in project

---

### 3. Boards
```javascript
{
  _id: ObjectId,
  name: String,           // Board name (max 100 chars)
  description: String,    // Optional description
  project: ObjectId,      // Reference to Project
  isDefault: Boolean,     // Is this the default board for the project
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `project` - For finding boards by project

---

### 4. Columns
```javascript
{
  _id: ObjectId,
  name: String,           // Column name (max 50 chars)
  board: ObjectId,        // Reference to Board
  project: ObjectId,      // Reference to Project (denormalized for queries)
  taskIds: [ObjectId],    // Ordered array of task references
  order: Number,          // Column position (for reordering)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `board` - For finding columns by board
- `project` - For finding columns by project

**Key Design Decision:**
- `taskIds` array maintains task order for drag-drop
- Updating this single array is more efficient than rewriting embedded task documents

---

### 5. Tasks
```javascript
{
  _id: ObjectId,
  title: String,          // Task title (max 200 chars)
  description: String,    // Optional detailed description
  priority: String,       // 'low' | 'medium' | 'high'
  status: String,         // 'todo' | 'in-progress' | 'done'
  dueDate: Date,          // Optional deadline
  assignee: ObjectId,     // Reference to User (optional)
  column: ObjectId,       // Reference to Column
  board: ObjectId,        // Reference to Board (denormalized)
  project: ObjectId,      // Reference to Project (denormalized)
  createdBy: ObjectId,    // Reference to User (creator)
  comments: [{            // Embedded comments (recent 50)
    user: ObjectId,       // Reference to User
    text: String,         // Comment text (max 1000 chars)
    createdAt: Date
  }],
  position: Number,       // Position within column (legacy, use column.taskIds)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `project` - For finding tasks by project
- `board` - For finding tasks by board
- `column` - For finding tasks by column
- `assignee` - For finding tasks assigned to user
- `priority` - For filtering by priority
- `dueDate` - For sorting/filtering by deadline

**Key Design Decision:**
- Comments are embedded (limited to recent 50 per task)
- Denormalized `board` and `project` references enable efficient queries without joins

---

## Relationships Diagram

```
User (1) ----<owns>----> (*) Project
User (1) ----<memberOf>----> (*) Project

Project (1) ----<has>----> (*) Board
Project (1) ----<has>----> (*) Column (denormalized)
Project (1) ----<has>----> (*) Task (denormalized)

Board (1) ----<has>----> (*) Column
Board (1) ----<has>----> (*) Task (denormalized)

Column (1) ----<contains>----> (*) Task (via taskIds array)

Task (1) ----<assignedTo>----> (0..1) User
Task (1) ----<createdBy>----> (1) User
Task (1) ----<has>----> (*) Comment (embedded)
```

## Authorization Model

### Role Hierarchy
1. **Admin** - Full control over project
2. **Member** - Can create/edit tasks, view everything
3. **Viewer** - Read-only access, can only edit own tasks

### Permission Matrix

| Action | Admin | Member | Viewer |
|--------|-------|--------|--------|
| View project | ✓ | ✓ | ✓ |
| Create task | ✓ | ✓ | ✗ |
| Edit any task | ✓ | ✓ | ✗ |
| Edit own task | ✓ | ✓ | ✓ |
| Delete task | ✓ | ✓ | ✗ |
| Manage members | ✓ | ✗ | ✗ |
| Delete project | ✓ | ✗ | ✗ |

## Scaling Considerations

### Current Design (Good for ~10k tasks per project)
- Column `taskIds` array size is the main limitation
- MongoDB document size limit: 16MB
- At ~50 bytes per ObjectId, max ~300k tasks per column

### Future Scaling Options
1. **Pagination** - Load tasks in batches
2. **Archiving** - Move completed tasks to archive collection
3. **Sharding** - Shard by projectId for horizontal scaling
4. **Redis Cache** - Cache user roles and frequently accessed data
