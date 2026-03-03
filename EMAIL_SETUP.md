# Email Setup (Gmail SMTP)

This document explains how to configure Gmail SMTP for sending emails.

## Prerequisites

- A Gmail account
- Google Account with 2-Step Verification enabled

---

## Step 1: Enable 2-Step Verification

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click on **2-Step Verification** → Get Started
3. Follow the steps to enable it

---

## Step 2: Generate App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Under "How you sign in to Google", select **App passwords**
3. You may need to sign in again
4. In "Select app", choose **Mail**
5. In "Select device", choose **Other (Custom name)** → enter "Project Management"
6. Click **Generate**
7. Copy the 16-character password shown

---

## Step 3: Configure Environment Variables

Edit your `backend/.env` file:

```env
# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_generated_app_password
EMAIL_FROM=Project Management <your_email@gmail.com>
```

> **Important**: Use the **App Password** (16 characters), NOT your Gmail login password.

---

## Email Features

### Welcome Email
Sent when a new user registers.

### Password Reset Email
Sent when user requests password reset.

### Project Invitation Email
Sent when a user is added to a project.

---

## Troubleshooting

### "Username and Password not accepted"
- Make sure you generated an **App Password**, not your regular password
- Verify 2-Step Verification is enabled

### "Connection refused"
- Check that EMAIL_PORT is set to `587` (TLS) or `465` (SSL)
- Make sure your firewall allows outbound SMTP

### Emails not arriving
- Check spam/junk folder
- Verify the sender email matches `EMAIL_USER`

---

## Testing Email

You can test email configuration in Postman:

```http
POST /api/auth/test-email
Content-Type: application/json

{
  "to": "test@example.com",
  "subject": "Test Email",
  "text": "This is a test email"
}
```
