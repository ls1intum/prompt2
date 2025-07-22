# SMTP Authentication Configuration Example

This guide shows how to configure SMTP authentication for common email providers.

## External Mail Providers

Add these variables to your `.env` file:

```bash
# Basic SMTP Configuration
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password

# Email Settings
SENDER_EMAIL=your-email@example.com
SENDER_NAME=Your Service Name
```

## No Authentication (Original Behavior with postfix)

If your SMTP server doesn't require authentication, leave the username and password empty:

```bash
SMTP_HOST=localhost
SMTP_PORT=25
SMTP_USERNAME=
SMTP_PASSWORD=
```

Originally we used postfix without authentication, so you can set the SMTP host to `localhost` and the port to `25` without providing a username or password.

## Security Notes

- Use environment variables for credentials, never hardcode them
- For Gmail, use App Passwords instead of your regular password
- Consider using SMTP over TLS (port 587) for security
- Keep your `.env` file out of version control
