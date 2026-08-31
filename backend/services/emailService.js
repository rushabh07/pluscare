import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail", // Using Gmail as default, can be configured via env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

/**
 * Helper to generate professional HTML email template
 */
const generateEmailHTML = (title, content, booking) => {
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
            
            ${booking ? `
            <div class="receipt-box">
                <div style="text-align: right; margin-bottom: 10px;">
                    <span class="status-badge">${booking.status}</span>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                        <td class="label" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: left;">Booking ID</td>
                        <td class="value" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: right; font-family: monospace;">${booking._id}</td>
                    </tr>
                    <tr>
                        <td class="label" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: left;">Service</td>
                        <td class="value" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: right;">${booking.service?.name || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td class="label" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: left;">Category</td>
                        <td class="value" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: right;">${booking.service?.category || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td class="label" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: left;">Provider</td>
                        <td class="value" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: right;">${booking.provider?.fullName || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td class="label" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: left;">Date</td>
                        <td class="value" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: right;">${new Date(booking.bookingDate).toLocaleDateString("en-IN", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    </tr>
                    <tr>
                        <td class="label" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: left;">Time</td>
                        <td class="value" style="padding: 10px 0; border-bottom: 1px dashed #cbd5e1; text-align: right;">${booking.timeSlot}</td>
                    </tr>
                    <tr>
                        <td class="label" style="padding: 10px 0; text-align: left;">Address</td>
                        <td class="value" style="padding: 10px 0; text-align: right;">${booking.address}</td>
                    </tr>
                    <tr>
                        <td class="total-label" style="padding: 15px 0 5px; border-top: 2px solid #cbd5e1; text-align: left;">Total Amount</td>
                        <td class="total-value" style="padding: 15px 0 5px; border-top: 2px solid #cbd5e1; text-align: right;">₹${booking.totalPrice}</td>
                    </tr>
                </table>
            </div>
            ` : ''}
            
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

/**
 * Send Booking Receipt Email
 */
export const sendBookingReceipt = async (booking, userEmail, userName) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("EMAIL_USER or EMAIL_PASSWORD not set. Skipping email send.");
        return false;
    }

    try {
        const title = "Booking Receipt";
        const content = `
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${userName},</h2>
            <p>Thank you for choosing PlusCare Health. Your booking has been successfully recorded. Here is your receipt:</p>
        `;

        const html = generateEmailHTML(title, content, booking);

        const mailOptions = {
            from: `"PlusCare Health" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Receipt - ${booking.service?.name}`,
            html: html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

/**
 * Send Booking Cancellation Email
 */
export const sendBookingCancellation = async (booking, userEmail, userName) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.warn("EMAIL_USER or EMAIL_PASSWORD not set. Skipping email send.");
        return false;
    }

    try {
        const title = "Booking Cancelled";
        const content = `
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${userName},</h2>
            <p>Your booking for <strong>${booking.service?.name}</strong> has been cancelled. Below are the details of the cancelled booking:</p>
        `;

        const html = generateEmailHTML(title, content, booking);

        const mailOptions = {
            from: `"PlusCare Health" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `Booking Cancelled - ${booking.service?.name}`,
            html: html,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export default {
    sendBookingReceipt,
    sendBookingCancellation,
};
