require('dotenv').config()
export const emailsConfig = {
    domain: process.env.SMTP_EMAIL_DOMAIN,
    user: process.env.SMTP_EMAIL_USER,
    password: process.env.SMTP_EMAIL_PASSWORD,
}