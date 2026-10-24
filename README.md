# VeraOffice

VeraOffice is a static office-suite website. Its login and account registration
use Supabase Auth; no service-role key or custom server is included in this
repository.

## Configure authentication

1. Create or open the Supabase project used by the site.
2. In **Project Settings → API**, copy the project URL and its **anon** or
   **publishable** key. Set them in [auth-config.js](./auth-config.js). These
   client-side values are public; never put a service-role/secret key in the
   website.
3. In **Authentication → URL Configuration**, add the deployed site URL as a
   Site URL and add the full deployed `login.html` URL to the Redirect URLs
   allow list. For local testing, use a local web server and allow its
   `login.html` URL too; opening the pages with `file://` is not supported.
4. In **Authentication → Providers → Email**, enable email signups and turn on
   **Confirm email**. Set up SMTP for production delivery and check the
   confirmation email template. Confirmation links return to `login.html`.
5. Serve the site over HTTPS in production. Add an account and verify its
   email before signing in.

The signup form sends a confirmation email and offers a resend action.
Unverified sessions are signed out and cannot open the app. The login page
accepts Supabase's email-confirmation callback and provides a link to the
requested page, or to `app/app.html` when there is no requested destination.

## Apply authentication across the site

The shared client and session guard live in [auth.js](./auth.js), with project
settings in [auth-config.js](./auth-config.js). The app dashboard and text
editor already load these files and use `data-auth-required`. To protect a
new page, load the Supabase CDN, `auth-config.js`, and `auth.js` in that order
and add `data-auth-required` to its `<body>`. The shared script redirects
visitors to `login.html`, preserves their destination, and adds a sign-out
control after verifying the session.

This page guard is a navigation/UX check, not an authorization boundary.
Static HTML and JavaScript cannot protect data or prevent direct API calls.
For any private data, enforce access with Supabase Row Level Security policies
and verify authorization in trusted server-side code or database policies.