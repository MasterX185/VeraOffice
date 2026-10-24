(() => {
  const config = window.VeraOfficeAuthConfig;
  const scriptUrl = document.currentScript?.src;
  const siteUrl = scriptUrl ? new URL("./", scriptUrl) : new URL("./", location.href);
  const supabaseKey = config?.supabasePublishableKey || config?.supabaseAnonKey;
  const isConfigured =
    Boolean(config?.supabaseUrl) &&
    Boolean(supabaseKey) &&
    !supabaseKey.includes("PASTE_YOUR_") &&
    Boolean(window.supabase);
  const client = isConfigured
    ? window.supabase.createClient(config.supabaseUrl, supabaseKey)
    : null;

  function getRedirectTarget() {
    const requested = new URLSearchParams(location.search).get("next");
    if (requested) {
      const target = new URL(requested, location.href);
      if (
        target.origin === location.origin &&
        target.href !== location.href &&
        !target.pathname.endsWith("/login.html")
      ) {
        return target.href;
      }
    }
    return new URL("app/app.html", siteUrl).href;
  }

  function updateAccountControl(user) {
    const signInLink = document.querySelector("[data-auth-link]");
    const nav = signInLink?.closest(".nav-links");
    if (!signInLink || !nav) return;

    const existingControl = nav.querySelector("[data-account-control]");
    if (!user?.email_confirmed_at) {
      existingControl?.remove();
      const signInItem = signInLink.closest("li");
      if (signInItem) signInItem.hidden = false;
      return;
    }

    const signInItem = signInLink.closest("li");
    if (signInItem) signInItem.hidden = true;
    if (existingControl) {
      const identity = existingControl.querySelector(".nav-account-email");
      if (identity) {
        identity.textContent = user.email || "Account";
        identity.title = user.email || "Account";
      }
      return;
    }

    const item = document.createElement("li");
    item.dataset.accountControl = "";
    item.className = "nav-account";

    const identity = document.createElement("span");
    identity.className = "nav-account-email";
    identity.textContent = user.email || "Account";
    identity.title = user.email || "Account";

    const signOut = document.createElement("button");
    signOut.className = "nav-account-signout";
    signOut.type = "button";
    signOut.textContent = "Sign out";
    signOut.addEventListener("click", async () => {
      signOut.disabled = true;
      const { error } = await client.auth.signOut();
      if (error) {
        signOut.disabled = false;
        signOut.textContent = "Could not sign out";
        console.error("VeraOffice sign-out failed:", error.message);
      }
    });

    item.append(identity, signOut);
    nav.append(item);
  }

  window.VeraOfficeAuth = Object.freeze({
    client,
    isConfigured,
    siteUrl,
    getRedirectTarget,
  });

  if (client && document.querySelector("[data-auth-link]")) {
    client.auth.onAuthStateChange((_event, session) => {
      updateAccountControl(session?.user || null);
    });

    client.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Could not read VeraOffice account session:", error.message);
        return;
      }
      updateAccountControl(data.session?.user || null);
    });
  }
})();
