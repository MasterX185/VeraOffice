# VeraOffice

> A lightweight, browser-based office suite providing simple productivity tools directly in your browser.

**VeraOffice** is built with plain HTML, CSS, and vanilla JavaScript. It requires no build system, package manager, or complex setup.

---

## 📌 Project Status

VeraOffice is currently **under active development**. Some features are fully functional, while others are experimental or placeholders for future releases.

---

## ✨ Features

### 📝 Text Editor
- Write and edit text directly in your browser.
- Basic formatting (Bold, Italic, Font size adjustments).
- Undo and redo history.
- Full clipboard support.
- Export documents as `.html` files.
- Optional cloud saving via [Supabase](https://supabase.com/).

### 📊 Spreadsheet
- Interactive grid with 10 columns and 15 rows.
- Basic cell editing and formatting.
- Copy and paste capabilities.
- Export spreadsheet data as standard JSON.

### 📽️ Presentations
- *Experimental section.*
- Currently serves as a placeholder for upcoming slide creation tools.

### 👤 User Accounts
- Optional user authentication powered by Supabase.
- Email & password registration.
- Login, logout, and email verification workflows.
- Account management page.
- **Note:** All editors can be used locally without creating an account.

---

## ⚠️ Current Limitations

VeraOffice is an evolving project. Please note the following current limitations:

- ❌ No centralized document management system.
- ❌ No cross-device document synchronization.
- ❌ No real-time multi-user collaboration.
- ❌ No formula parsing or data charts in spreadsheets.
- ❌ No Excel (`.xlsx`) import/export options.
- ❌ Presentation editor is not yet functional.

---

## 🛠️ Technologies & Services

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend & Auth:** [Supabase](https://supabase.com/)
- **Icons:** [Lucide Icons](https://lucide.dev/)
- **Typography:** [Google Fonts](https://fonts.google.com/)
- **Analytics:** [Vercel Web Analytics](https://vercel.com/analytics)

---

## 🚀 Getting Started

### Run Locally

Because VeraOffice is a static project, no build process is needed. 

Note: for all features to work, you need a safe HTTPS connection

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MasterX185/VeraOffice.git
   ```

2. **Navigate into the project directory:**
   ```bash
   cd VeraOffice
   ```

3. **Start a local HTTP server:**
   ```bash
   python -m http.server 8000
   ```

4. **Open in your browser:**
   Go to `http://localhost:8000` (or use any static web server of your choice).

---

## 🗄️ Supabase Configuration

VeraOffice comes preconfigured with a default Supabase project setup, allowing you to test authentication out-of-the-box.

### Option A: Use Preconfigured Database
- Ready to go—no extra setup required.
- Availability depends on the default project status.

### Option B: Use Your Own Database

1. Create a project on [Supabase](https://supabase.com/).
2. Open `auth-config.js`.
3. Replace the placeholder values with your project credentials:
   ```javascript
   const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
   const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY";
   ```
4. Set up authentication redirect URLs in your Supabase dashboard settings.

### 🔒 Security Notes
- **Never** expose your Supabase `service-role` key in frontend scripts.
- Use only the **publishable key** or legacy **anon key** in `auth-config.js`.
- Ensure appropriate Row Level Security (RLS) policies are active on your database.

---

## HOPEFULLY coming soon...
- saving into the cloud with more editors (e.g. sheets)
- deleting account
- loading files
- --saving files in cache (so you don't loose anything when the page reloads)
- better design for sheets
- better design for account page
- new favicon

---

## 📁 Project Structure

```text
VeraOffice/
├── index.html
├── about.html
├── services.html
├── contact.html
├── credits.html
├── login.html
├── account.html
├── auth-config.js
├── auth.js
├── style.css
├── style-editor.css
├── favicon.svg
├── app/
│   ├── app.html
│   ├── text/
│   │   ├── text.html
│   │   └── text.js
│   ├── sheets/
│   │   ├── sheets.html
│   │   └── sheets.js
│   └── presentations/
│       ├── presentations.html
│       └── presentations.js
└── LICENSE
```

---

## 🌐 Deployment

As a static frontend application, VeraOffice can easily be hosted on:

- [GitHub Pages](https://pages.github.com/)
- [Vercel](https://vercel.com/)
- [Netlify](https://www.netlify.com/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- and more

> **Note:** Remember to update the *Site URL* and *Redirect URLs* in your Supabase authentication settings to match your production domain.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

1. **Fork** the repository.
2. Create a feature **branch** (`git checkout -b feature/NewFeature`).
3. **Commit** your changes (`git commit -m 'Add NewFeature'`).
4. **Push** to the branch (`git push origin feature/NewFeature`).
5. Open a **Pull Request**.

You can also create a fork in this repo from the *develop* branch and name it like this: *develop-GitHubUsername-YourFeature*

Then, create a PR
---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.