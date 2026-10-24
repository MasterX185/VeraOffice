document.addEventListener("DOMContentLoaded", () => {
  const auth = window.VeraOfficeAuth;
  const client = auth?.client;
  const authContainer = document.getElementById("auth-container");
  const dashboard = document.getElementById("dashboard-container");
  const form = document.getElementById("auth-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitButton = document.getElementById("submit-button");
  const signInMode = document.getElementById("signin-mode");
  const signUpMode = document.getElementById("signup-mode");
  const resendButton = document.getElementById("resend-verification");
  const signOutButton = document.getElementById("signout-button");
  const message = document.getElementById("auth-message");
  const issue = new URLSearchParams(location.search).get("issue");
  let mode = "signin";

  function setMessage(text, kind = "") {
    message.textContent = text;
    message.className = `auth-message${kind ? ` is-${kind}` : ""}`;
  }

  function setBusy(busy) {
    submitButton.disabled = busy;
    submitButton.textContent = busy
      ? "Please wait..."
      : mode === "signin"
        ? "Sign in"
        : "Create account";
  }

  function showDashboard(user) {
    authContainer.classList.add("hidden");
    dashboard.classList.remove("hidden");
    document.getElementById("user-email").textContent = user.email || "";
    document.getElementById("open-app").href = auth.getRedirectTarget();
  }

  function showForm() {
    dashboard.classList.add("hidden");
    authContainer.classList.remove("hidden");
  }

  function setMode(nextMode) {
    mode = nextMode;
    const signingIn = mode === "signin";
    signInMode.classList.toggle("is-active", signingIn);
    signUpMode.classList.toggle("is-active", !signingIn);
    signInMode.setAttribute("aria-pressed", String(signingIn));
    signUpMode.setAttribute("aria-pressed", String(!signingIn));
    document.getElementById("login-title").textContent = signingIn
      ? "Sign in to your account"
      : "Create your account";
    document.getElementById("form-description").textContent = signingIn
      ? "Enter your details below to continue."
      : "Create an account to start using VeraOffice.";
    passwordInput.autocomplete = signingIn ? "current-password" : "new-password";
    passwordInput.minLength = signingIn ? 1 : 8;
    passwordInput.placeholder = signingIn ? "Your password" : "At least 8 characters";
    document.getElementById("password-hint").classList.toggle("hidden", signingIn);
    submitButton.textContent = signingIn ? "Sign in" : "Create account";
    resendButton.classList.add("hidden");
    setMessage("");
  }

  function isVerified(user) {
    return Boolean(user?.email_confirmed_at);
  }

  async function loadSession() {
    if (!client) {
      setMessage(
        window.supabase
          ? "Authentication is not configured. Add your Supabase anon or publishable key to auth-config.js."
          : "The authentication service could not load. Check your connection and reload.",
        "error",
      );
      submitButton.disabled = true;
      return;
    }

    const { data, error } = await client.auth.getSession();
    if (error) {
      setMessage(`Could not check your sign-in status: ${error.message}`, "error");
      return;
    }

    if (data.session && isVerified(data.session.user)) {
      showDashboard(data.session.user);
      return;
    }

    if (data.session) {
      const { error: signOutError } = await client.auth.signOut();
      if (signOutError) {
        setMessage(`Could not clear the unverified session: ${signOutError.message}`, "error");
        return;
      }
      resendButton.classList.remove("hidden");
      setMessage("Verify your email before signing in. Check your inbox for the confirmation link.", "info");
    }

    if (issue === "unverified") {
      resendButton.classList.remove("hidden");
      setMessage("Please verify your email address before using VeraOffice.", "info");
    } else if (issue === "session") {
      setMessage("We could not verify your session. Please sign in again.", "error");
    } else if (issue === "configuration") {
      setMessage("Set up Supabase in auth-config.js before accessing the workspace.", "error");
    } else if (issue === "signed-out") {
      setMessage("You have been signed out.", "info");
    }
  }

  signInMode.addEventListener("click", () => setMode("signin"));
  signUpMode.addEventListener("click", () => setMode("signup"));
  setMode("signin");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!client) {
      await loadSession();
      return;
    }

    setBusy(true);
    setMessage("");
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    let error;

    if (mode === "signup") {
      const result = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: new URL("login.html", auth.siteUrl).href,
        },
      });
      error = result.error;
      if (!error) {
        if (result.data.session && isVerified(result.data.user)) {
          showDashboard(result.data.user);
        } else {
          if (result.data.session) {
            const { error: signOutError } = await client.auth.signOut();
            if (signOutError) {
              setMessage(`Could not clear an unverified session: ${signOutError.message}`, "error");
              setBusy(false);
              return;
            }
          }
          resendButton.classList.remove("hidden");
          setMessage(
            "Check your inbox and click the verification link before signing in.",
            "success",
          );
        }
      }
    } else {
      const result = await client.auth.signInWithPassword({ email, password });
      error = result.error;
      if (!error) {
        if (isVerified(result.data.user)) {
          showDashboard(result.data.user);
        } else {
          const { error: signOutError } = await client.auth.signOut();
          if (signOutError) {
            setMessage(`Could not clear an unverified session: ${signOutError.message}`, "error");
            setBusy(false);
            return;
          }
          resendButton.classList.remove("hidden");
          setMessage("Verify your email address before signing in.", "info");
        }
      }
    }

    if (error) setMessage(error.message, "error");
    setBusy(false);
  });

  resendButton.addEventListener("click", async () => {
    if (!client) return;
    const email = emailInput.value.trim();
    if (!email) {
      emailInput.focus();
      setMessage("Enter your email address first.", "error");
      return;
    }

    resendButton.disabled = true;
    const { error } = await client.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: new URL("login.html", auth.siteUrl).href,
      },
    });
    resendButton.disabled = false;
    setMessage(
      error
        ? error.message
        : "If the account can receive a verification email, a new link is on its way.",
      error ? "error" : "success",
    );
  });

  signOutButton.addEventListener("click", async () => {
    if (!client) return;
    signOutButton.disabled = true;
    const { error } = await client.auth.signOut();
    if (error) {
      signOutButton.disabled = false;
      setMessage(`Could not sign out: ${error.message}`, "error");
      return;
    }
    showForm();
    setMode("signin");
    setMessage("You have been signed out.", "info");
  });

  loadSession();
});
