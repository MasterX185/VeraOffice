# VeraOffice

VeraOffice is a static office-suite website. Its editors can be opened without
an account. Optional login and registration use Supabase Auth; no service-role
key or custom server is included in this repository.

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
5. Serve the site over HTTPS in production.

Email verification applies only when someone chooses to create an account; it
is not required to use the editors. The signup form offers a resend action.
The login page accepts Supabase's email-confirmation callback and provides a
link to the requested page, or to `app/app.html` when there is no requested
destination.

### Verification email troubleshooting

Supabase's built-in SMTP service is for testing and restricts delivery to
addresses belonging to project organization members. For normal users, set up
a custom SMTP provider under **Authentication → Emails → SMTP Settings**,
verify its sender domain, and check the project's Auth logs and email rate
limits if delivery still fails. See Supabase's
[SMTP setup guide](https://supabase.com/docs/guides/auth/auth-smtp).

## Optional authentication

The shared login client lives in [auth.js](./auth.js), with project settings
in [auth-config.js](./auth-config.js). The dashboard and text editor do not
load the auth client and remain accessible as a guest. Accounts currently do
not enable document sync or storage.

Static HTML and JavaScript cannot protect private data. If account-based
document sync or other private features are added, enforce access with
Supabase Row Level Security policies and trusted server-side authorization.