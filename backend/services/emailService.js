import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ═══════════════════════════════════════════════════════════════
// EMAIL KILL-SWITCH — temporarily disable all outgoing emails
// Set EMAIL_ENABLED=false in backend/.env to disable.
// Set EMAIL_ENABLED=true (or remove it) to re-enable.
// When disabled: Nodemailer + Supabase OTP sends are skipped,
// functions log to console and return early so the app keeps working.
// ═══════════════════════════════════════════════════════════════
const EMAIL_ENABLED = process.env.EMAIL_ENABLED?.toLowerCase() !== "false";
if (!EMAIL_ENABLED) {
    console.warn("[emailService] EMAIL_ENABLED=false — all outgoing emails are TEMPORARILY DISABLED.");
}

// ═══════════════════════════════════════════════════════════════
// Supabase Client — server-side only, NEVER expose to frontend
// Used for OTP forgot-password flow via Supabase Auth email templates
// ═══════════════════════════════════════════════════════════════
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ═══════════════════════════════════════════════════════════════
// Nodemailer — for appointment & booking custom HTML emails
// (Supabase Auth templates only support auth flows, not arbitrary emails)
// ═══════════════════════════════════════════════════════════════
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
    // Prevent indefinite hangs on Render where outbound SMTP may be restricted.
    // If the TCP connection is not established within 10 s, Nodemailer throws
    // immediately so the calling controller is not blocked.
    connectionTimeout: 10000,  // 10 s — time to establish the TCP connection
    greetingTimeout: 10000,    // 10 s — time to receive the SMTP greeting after connect
    socketTimeout: 15000,      // 15 s — idle socket timeout during data transfer
});

// ═══════════════════════════════════════════════════════════════
// SUPABASE AUTH OTP — Forgot Password
// ═══════════════════════════════════════════════════════════════
// SUPABASE AUTH OTP & Nodemailer Fallback — Forgot Password
// ═══════════════════════════════════════════════════════════════

// In-memory store for OTP fallback when Supabase SMTP encounters errors
const otpStore = new Map();

/**
 * Send OTP for forgot password (generates 6-digit OTP & dispatches email via SMTP)
 */
export const sendForgotPasswordOtp = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    // Generate 6-digit OTP code & set 10 min expiration
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    otpStore.set(normalizedEmail, { otp: otpCode, expiresAt });

    // ── Kill-switch: skip all email delivery, but keep OTP flow testable ──
    if (!EMAIL_ENABLED) {
        console.log(`[emailService DISABLED] Forgot-password OTP for ${normalizedEmail}: ${otpCode} (valid 10 min, check backend console)`);
        return { success: true, provider: "disabled", disabled: true, devOtp: otpCode };
    }

    // Also trigger Supabase Auth OTP session in parallel if configured
    try {
        await supabase.auth.signInWithOtp({
            email: normalizedEmail,
            options: { shouldCreateUser: false },
        });
    } catch (err) {
        console.warn("Supabase Auth OTP trigger info:", err.message);
    }

    // Dispatch official PlusCare Password Reset OTP Email
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            return {
                success: false,
                message: "EMAIL_USER or EMAIL_PASSWORD is missing in backend .env file.",
            };
        }

        const content = `
            <h2 style="color: #1e293b; margin-top: 0;">Password Reset Request</h2>
            <p>Hi,</p>
            <p>You requested to reset your password for your PlusCare Health account. Use the 6-digit OTP code below to complete your password reset:</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f766e; background: #f0fdf4; border: 2px dashed #0f766e; padding: 12px 24px; border-radius: 12px; display: inline-block;">
                    ${otpCode}
                </span>
            </div>
            <p style="font-size: 13px; color: #64748b; text-align: center;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        `;

        const html = generateEmailHTML("Password Reset OTP", content, {
            status: "OTP Generated",
            rows: [
                { label: "Account Email", value: normalizedEmail },
                { label: "Valid For", value: "10 minutes" },
            ],
        });

        await transporter.sendMail({
            from: `"PlusCare Security" <${process.env.EMAIL_USER}>`,
            to: normalizedEmail,
            subject: "Your PlusCare Password Reset OTP Code",
            html,
        });

        console.log(`Password reset OTP email sent successfully to ${normalizedEmail} with code ${otpCode}`);
        return { success: true, provider: "smtp" };
    } catch (emailError) {
        console.error("Error sending OTP email:", emailError.message);
        return { success: false, message: emailError.message };
    }
};

/**
 * Verify OTP via local store or Supabase Auth
 */
export const verifyForgotPasswordOtp = async (email, token) => {
    const normalizedEmail = email.trim().toLowerCase();
    const cleanToken = token.trim();

    // 1. Check local OTP store first
    const storedData = otpStore.get(normalizedEmail);
    if (storedData) {
        if (Date.now() > storedData.expiresAt) {
            otpStore.delete(normalizedEmail);
            return { success: false, message: "OTP code has expired. Please request a new code." };
        }
        if (storedData.otp === cleanToken) {
            otpStore.delete(normalizedEmail); // One-time use
            return { success: true, provider: "nodemailer" };
        }
    }

    // 2. Try Supabase Auth verification
    try {
        let res = await supabase.auth.verifyOtp({
            email: normalizedEmail,
            token: cleanToken,
            type: "email",
        });

        if (res.error) {
            res = await supabase.auth.verifyOtp({
                email: normalizedEmail,
                token: cleanToken,
                type: "recovery",
            });
        }

        if (!res.error) {
            return { success: true, data: res.data, provider: "supabase" };
        }
        throw res.error;
    } catch (error) {
        console.error("Supabase OTP verify error:", error.message);
        return {
            success: false,
            message: storedData ? "Invalid 6-digit OTP code." : error.message,
        };
    }
};

// ═══════════════════════════════════════════════════════════════
// PlusCare HTML Email Template (shared by bookings & appointments)
// ═══════════════════════════════════════════════════════════════

/**
 * @param {string} title - Email title shown in header
 * @param {string} content - HTML body content
 * @param {object|null} details - { rows: [{label,value,mono?}], status?, highlight?: {label,value} }
 */
const generateEmailHTML = (title, content, details) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; color: #333; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #1e3a8a, #0f766e); padding: 30px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
        .content { padding: 30px; }
        .content p { line-height: 1.6; font-size: 15px; color: #4b5563; }
        .receipt-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .label { font-weight: 600; color: #64748b; font-size: 14px; text-align: left; }
        .value { font-weight: 700; color: #0f172a; font-size: 14px; text-align: right; }
        .total-label { font-weight: 800; color: #0f172a; font-size: 16px; text-align: left; }
        .total-value { font-weight: 800; color: #10b981; font-size: 18px; text-align: right; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #fef3c7; color: #d97706; text-transform: uppercase;}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PlusCare Health</h1>
            <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px;">${title}</p>
        </div>
        <div class="content">
            ${content}
            
            ${details ? `
            <div class="receipt-box">
                ${details.status ? `
                <div style="text-align: right; margin-bottom: 10px;">
                    <span class="status-badge">${details.status}</span>
                </div>` : ""}
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    ${details.rows.map((row, i) => `
                    <tr>
                        <td class="label" style="padding: 10px 0;${i < details.rows.length - 1 || details.highlight ? " border-bottom: 1px dashed #cbd5e1;" : ""} text-align: left;">${row.label}</td>
                        <td class="value" style="padding: 10px 0;${i < details.rows.length - 1 || details.highlight ? " border-bottom: 1px dashed #cbd5e1;" : ""} text-align: right;${row.mono ? " font-family: monospace;" : ""}">${row.value}</td>
                    </tr>`).join("")}
                    ${details.highlight ? `
                    <tr>
                        <td class="total-label" style="padding: 15px 0 5px; border-top: 2px solid #cbd5e1; text-align: left;">${details.highlight.label}</td>
                        <td class="total-value" style="padding: 15px 0 5px; border-top: 2px solid #cbd5e1; text-align: right;">${details.highlight.value}</td>
                    </tr>` : ""}
                </table>
            </div>
            ` : ""}
            
            <p style="margin-top: 30px; font-size: 14px; text-align: center;">
                If you have any questions, please contact our support team.
            </p>
        </div>
        <div class="footer">
            &copy; ${new Date().getFullYear()} PlusCare Health. All rights reserved.
        </div>
    </div>
</body>
</html>
    `;
};

// ═══════════════════════════════════════════════════════════════
// Detail Builders
// ═══════════════════════════════════════════════════════════════

const buildBookingDetails = (booking) => ({
    status: booking.status,
    rows: [
        { label: "Booking ID", value: booking._id, mono: true },
        { label: "Service", value: booking.service?.name || "N/A" },
        { label: "Category", value: booking.service?.category || "N/A" },
        { label: "Provider", value: booking.provider?.fullName || "N/A" },
        { label: "Date", value: new Date(booking.bookingDate).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) },
        { label: "Time", value: booking.timeSlot },
        { label: "Address", value: booking.address },
    ],
    highlight: { label: "Total Amount", value: `₹${booking.totalPrice}` },
});

const buildAppointmentDetails = (appointment) => ({
    status: appointment.status,
    rows: [
        { label: "Appointment ID", value: appointment._id, mono: true },
        { label: "Patient", value: appointment.patient?.fullName || "N/A" },
        { label: "Doctor", value: appointment.doctor?.fullName || "N/A" },
        { label: "Department", value: appointment.department || appointment.doctor?.department || "N/A" },
        { label: "Date", value: new Date(appointment.appointmentDate).toLocaleDateString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) },
        { label: "Time Slot", value: appointment.timeSlot },
    ],
});

// ═══════════════════════════════════════════════════════════════
// Booking Emails (Nodemailer)
// ═══════════════════════════════════════════════════════════════

/**
 * Send Booking Receipt Email
 */
export const sendBookingReceipt = async (booking, userEmail, userName) => {
    if (!EMAIL_ENABLED) {
        console.log(`[emailService DISABLED] Skipped booking receipt to ${userEmail}`);
        return false;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("EMAIL_USER or EMAIL_PASSWORD not set. Skipping email send.");
        return false;
    }

    try {
        const content = `
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${userName},</h2>
            <p>Thank you for choosing PlusCare Health. Your booking has been successfully recorded. Here is your receipt:</p>
        `;
        const html = generateEmailHTML("Booking Receipt", content, buildBookingDetails(booking));

        await transporter.sendMail({
            from: `"PlusCare Health" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Receipt - ${booking.service?.name}`,
            html,
        });
        return true;
    } catch (error) {
        console.error("Error sending booking receipt:", error.message);
        return false;
    }
};

/**
 * Send Booking Cancellation Email
 */
export const sendBookingCancellation = async (booking, userEmail, userName) => {
    if (!EMAIL_ENABLED) {
        console.log(`[emailService DISABLED] Skipped booking cancellation to ${userEmail}`);
        return false;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("EMAIL_USER or EMAIL_PASSWORD not set. Skipping email send.");
        return false;
    }

    try {
        const content = `
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${userName},</h2>
            <p>Your booking for <strong>${booking.service?.name}</strong> has been cancelled. Below are the details of the cancelled booking:</p>
        `;
        const html = generateEmailHTML("Booking Cancelled", content, buildBookingDetails(booking));

        await transporter.sendMail({
            from: `"PlusCare Health" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Cancelled - ${booking.service?.name}`,
            html,
        });
        return true;
    } catch (error) {
        console.error("Error sending cancellation email:", error.message);
        return false;
    }
};

// ═══════════════════════════════════════════════════════════════
// Appointment Emails (Nodemailer)
// ═══════════════════════════════════════════════════════════════

const appointmentEmailConfig = {
    booked: {
        title: "Appointment Booked",
        body: (name, doctor) => `
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
            <p>Your appointment with <strong>Dr. ${doctor}</strong> has been successfully booked and is pending confirmation.</p>
        `,
    },
    Confirmed: {
        title: "Appointment Confirmed",
        body: (name, doctor) => `
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
            <p>Your appointment with <strong>Dr. ${doctor}</strong> has been confirmed. Please arrive 15 minutes early.</p>
        `,
    },
    Cancelled: {
        title: "Appointment Cancelled",
        body: (name, doctor) => `
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
            <p>Your appointment with <strong>Dr. ${doctor}</strong> has been cancelled.</p>
        `,
    },
    Completed: {
        title: "Appointment Completed",
        body: (name, doctor) => `
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
            <p>Your appointment with <strong>Dr. ${doctor}</strong> has been marked as completed. Thank you for visiting PlusCare Health.</p>
        `,
    },
};

/**
 * Send appointment status email
 * @param {object} appointment - Populated appointment document
 * @param {string} userEmail - Patient email
 * @param {string} userName - Patient name
 * @param {string} eventType - "booked" | "Confirmed" | "Cancelled" | "Completed"
 */
export const sendAppointmentEmail = async (appointment, userEmail, userName, eventType) => {
    if (!EMAIL_ENABLED) {
        console.log(`[emailService DISABLED] Skipped appointment (${eventType}) email to ${userEmail}`);
        return false;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("EMAIL_USER or EMAIL_PASSWORD not set. Skipping email send.");
        return false;
    }

    const config = appointmentEmailConfig[eventType];
    if (!config) return false;

    try {
        const doctorName = appointment.doctor?.fullName || "N/A";
        const content = config.body(userName, doctorName);
        const html = generateEmailHTML(config.title, content, buildAppointmentDetails(appointment));

        await transporter.sendMail({
            from: `"PlusCare Health" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `${config.title} - Dr. ${doctorName}`,
            html,
        });
        return true;
    } catch (error) {
        console.error(`Error sending ${eventType} appointment email:`, error.message);
        return false;
    }
};

// ═══════════════════════════════════════════════════════════════
// User Account & Authentication Emails
// ═══════════════════════════════════════════════════════════════

/**
 * Send Login Notification Email
 */
export const sendLoginNotificationEmail = async (userEmail, userName, details = {}) => {
    if (!EMAIL_ENABLED) {
        console.log(`[emailService DISABLED] Skipped login notification to ${userEmail}`);
        return false;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("EMAIL_USER or EMAIL_PASSWORD not set. Skipping login notification email.");
        return false;
    }

    try {
        const loginTimeStr = new Date().toLocaleString("en-IN", {
            dateStyle: "full",
            timeStyle: "medium",
        });
        const content = `
            <h2 style="color: #1e293b; margin-top: 0;">Security Alert: New Login</h2>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your PlusCare Health account was accessed recently.</p>
        `;
        const rows = [
            { label: "Account Email", value: userEmail },
            { label: "Login Time", value: loginTimeStr },
        ];
        if (details.ip) rows.push({ label: "IP Address", value: details.ip, mono: true });

        const html = generateEmailHTML("New Account Login", content, { status: "Active Session", rows });

        await transporter.sendMail({
            from: `"PlusCare Security" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Security Notification: New Login to PlusCare Health",
            html,
        });
        return true;
    } catch (error) {
        console.error("Error sending login notification email:", error.message);
        return false;
    }
};

/**
 * Send Welcome / Registration Notification Email
 */
export const sendRegisterNotificationEmail = async (userEmail, userName, role = "Patient") => {
    if (!EMAIL_ENABLED) {
        console.log(`[emailService DISABLED] Skipped register notification to ${userEmail}`);
        return false;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("EMAIL_USER or EMAIL_PASSWORD not set. Skipping register notification email.");
        return false;
    }

    try {
        const content = `
            <h2 style="color: #1e293b; margin-top: 0;">Welcome to PlusCare Health!</h2>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Thank you for creating an account with PlusCare Health System. Your registration was successful as a <strong>${role}</strong>.</p>
            <p>You can now log in to manage your appointments, service bookings, and medical records online.</p>
        `;
        const html = generateEmailHTML("Registration Successful", content, {
            status: "Account Created",
            rows: [
                { label: "Full Name", value: userName },
                { label: "Email Address", value: userEmail },
                { label: "Role", value: role },
            ],
        });

        await transporter.sendMail({
            from: `"PlusCare Health" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Welcome to PlusCare Health - Registration Confirmed",
            html,
        });
        return true;
    } catch (error) {
        console.error("Error sending register notification email:", error.message);
        return false;
    }
};

/**
 * Send Booking Status Update Email
 */
export const sendBookingStatusUpdateEmail = async (booking, userEmail, userName, newStatus) => {
    if (!EMAIL_ENABLED) {
        console.log(`[emailService DISABLED] Skipped booking status (${newStatus}) email to ${userEmail}`);
        return false;
    }
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("EMAIL_USER or EMAIL_PASSWORD not set. Skipping booking status email.");
        return false;
    }

    try {
        const content = `
            <h2 style="color: #1e293b; margin-top: 0;">Booking Status Updated</h2>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your booking for service <strong>${booking.service?.name || "Service"}</strong> status has been updated to <strong style="color: #0f766e;">${newStatus}</strong>.</p>
        `;
        const html = generateEmailHTML(`Booking Status: ${newStatus}`, content, buildBookingDetails(booking));

        await transporter.sendMail({
            from: `"PlusCare Health" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Update: ${newStatus} - ${booking.service?.name || "Service"}`,
            html,
        });
        return true;
    } catch (error) {
        console.error(`Error sending booking status ${newStatus} email:`, error.message);
        return false;
    }
};

export default {
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    sendBookingReceipt,
    sendBookingCancellation,
    sendAppointmentEmail,
    sendLoginNotificationEmail,
    sendRegisterNotificationEmail,
    sendBookingStatusUpdateEmail,
};
