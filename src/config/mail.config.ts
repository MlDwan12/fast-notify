import { registerAs } from '@nestjs/config';

export default registerAs('mail', () => ({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT ?? '587', 10),
  user: process.env.MAIL_USER,
  pass: process.env.MAIL_PASS,
  secure: process.env.MAIL_SECURE,
  from: process.env.MAIL_FROM,
  admin: process.env.MAIL_ADMIN,
}));
