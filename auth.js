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

  function redirectToLogin(issue) {
    const loginUrl = new URL("login.html", siteUrl);
    loginUrl.searchParams.set(
      "next",
      `${location.pathname}${location.search}${location.hash}`,
    );
    if (issue) loginUrl.searchParams.set("issue", issue);
    location.replace(loginUrl.href);
  }

  function addAccountControl(email) {
    const nav = document.querySelector(".nav-links");
    if (!nav || nav.querySelector("[data-account-control]")) return;

    const item = document.createElement("li");
    item.dataset.accountControl = "";
    item.className = "nav-account";

    const identity = document.createElement("span");
    identity.className = "nav-account-email";
    identity.textContent = email;
    identity.title = email;

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
        return;
      }
      location.assign(new URL("login.html", siteUrl).href);
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

  if (document.body?.hasAttribute("data-auth-required")) {
    document.documentElement.classList.add("auth-pending");
    const protectPage = async () => {
      if (!client) {
        redirectToLogin("configuration");
        return;
      }

      const { data, error } = await client.auth.getSession();
      if (error) {
        console.error("VeraOffice session check failed:", error.message);
        redirectToLogin("session");
        return;
      }

      const session = data.session;
      if (!session) {
        redirectToLogin();
        return;
      }

      if (!session.user.email_confirmed_at) {
        const { error: signOutError } = await client.auth.signOut();
        if (signOutError) {
          console.error("Could not clear an unverified session:", signOutError.message);
        }
        redirectToLogin("unverified");
        return;
      }

      addAccountControl(session.user.email || "Account");
      document.documentElement.classList.remove("auth-pending");

      client.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") redirectToLogin("signed-out");
      });
    };

    protectPage();
  }
})();
