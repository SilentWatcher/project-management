# Cloudinary Setup (Image Upload)

This document explains how to configure Cloudinary for image uploads.

---

## Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/users/register_free)
2. Sign up for a free account
3. Verify your email

---

## Step 2: Get API Credentials

1. Log in to [Cloudinary Dashboard](https://cloudinary.com/users/sign_in)
2. Copy these values from the **Dashboard** (or **Settings → API Keys**):

| Variable | Where to Find |
|----------|---------------|
| `CLOUDINARY_CLOUD_NAME` | Top of Dashboard |
| `CLOUDINARY_API_KEY` | Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Settings → API Keys (click reveal) |

---

## Step 3: Configure Environment Variables

Edit your `backend/.env` file:

```env
# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Step 4: Configure Upload Settings (Optional)

```env
# Upload Settings
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

Default max file size: 5MB

---

## Upload API Endpoints

### Upload Single Image
```http
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "url": "https://res.cloudinary.com/.../image.jpg",
    "publicId": "folder/filename",
    "secureUrl": "https://res.cloudinary.com/.../image.jpg",
    "format": "jpg",
    "width": 800,
    "height": 600,
    "bytes": 45678
  }
}
```

### Upload Avatar
```http
POST /api/upload/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

### Upload Task Attachment
```http
POST /api/upload/task/:taskId
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

---

## Troubleshooting

### "Missing required parameter - cloud_name"
- Verify `CLOUDINARY_CLOUD_NAME` is set correctly in `.env`

### "Invalid signature"
- Verify `CLOUDINARY_API_SECRET` is correct (not the API Key)

### Upload failing with "File too large"
- Increase `MAX_FILE_SIZE` in `.env`
- Or compress the image before uploading

### CORS errors
- Add your domain to Cloudinary Settings → Security → Allowed origins

---

## Image Transformation Examples

Cloudinary provides automatic transformations:

| Transformation | URL Example |
|---------------|-------------|
| Thumbnail 150x150 | `.../c_fill,w_150,h_150/...` |
| Resize to width 300 | `.../c_scale,w_300/...` |
| Circle crop | `.../c_fill,co_white,r_max/...` |
| Format auto | `.../f_auto,q_auto/...` |

These are applied by appending transformations to the URL.
