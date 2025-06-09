// utils/sendEmail.ts
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: EmailOptions): Promise<void> => {
    console.log('Sending email to:', to, 'with subject:', subject, 'and HTML content:', html, 'using SMTP host:', process.env.SMTP_HOST, 'and port:', process.env.SMTP_PORT, 'and user:', process.env.SMTP_USER, 'and pass:', process.env.SMTP_PASS);   
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true if using port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Image Processor" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
