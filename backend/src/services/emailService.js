import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const templates = {
  welcome: (user) => ({
    subject: 'Welcome to Zenkai! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Zenkai</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 16px;">Project Management Made Simple</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Welcome aboard, ${user.name}! 🚀</h2>
              
              <p style="color: #64748b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                We're thrilled to have you join <strong>Zenkai</strong>. You've taken the first step towards streamlined project management and seamless team collaboration.
              </p>
              
              <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #1e293b; margin: 0 0 16px; font-size: 18px; font-weight: 600;">Here's what you can do:</h3>
                <ul style="color: #64748b; margin: 0; padding: 0 0 0 20px; line-height: 2;">
                  <li>Create and manage projects</li>
                  <li>Build Kanban boards with drag & drop</li>
                  <li>Invite team members</li>
                  <li>Track tasks and deadlines</li>
                </ul>
              </div>
              
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                Get Started
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 24px 32px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 14px;">
                © ${new Date().getFullYear()} Zenkai. All rights reserved.
              </p>
              <p style="color: #94a3b8; margin: 8px 0 0; font-size: 12px;">
                The modern way to manage projects
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Welcome to Zenkai, ${user.name}! We're thrilled to have you join us. Get started by visiting ${process.env.FRONTEND_URL || 'http://localhost:5173'}`,
  }),

  passwordReset: (user, resetToken) => ({
    subject: 'Reset your Zenkai password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Zenkai</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px; font-weight: 600;">Reset your password</h2>
              <p style="color: #64748b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Hi ${user.name}, we received a request to reset your password. Click the button below to create a new password:
              </p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
              <p style="color: #94a3b8; margin: 24px 0 0; font-size: 14px;">
                This link will expire in 1 hour. If you didn't request this, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Reset your password by visiting: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`,
  }),

  projectInvitation: (user, projectName, inviterName) => ({
    subject: `You've been invited to join "${projectName}" on Zenkai`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 32px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700;">Zenkai</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 32px;">
              <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 24px; font-weight: 600;">You're invited! 🎉</h2>
              <p style="color: #64748b; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join the project <strong>"${projectName}"</strong> on Zenkai.
              </p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                View Project
              </a>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `You've been invited to join "${projectName}" on Zenkai by ${inviterName}. View it at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/projects`,
  }),
};

// Send email function
export const sendEmail = async (to, subject, html, text) => {
  try {
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
    });
    
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('📧 Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Convenience functions
export const sendWelcomeEmail = async (user) => {
  const template = templates.welcome(user);
  return sendEmail(user.email, template.subject, template.html, template.text);
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const template = templates.passwordReset(user, resetToken);
  return sendEmail(user.email, template.subject, template.html, template.text);
};

export const sendProjectInvitationEmail = async (user, projectName, inviterName) => {
  const template = templates.projectInvitation(user, projectName, inviterName);
  return sendEmail(user.email, template.subject, template.html, template.text);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendProjectInvitationEmail,
};
