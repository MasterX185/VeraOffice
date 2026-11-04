document.addEventListener('DOMContentLoaded', () => {
//supabase
  const supabase = window.supabaseClient || window.supabase;
  console.log("URL:", window.VeraOfficeAuthConfig?.supabaseUrl);
  
  console.log("Anon Key:", window.VeraOfficeAuthConfig?.supabaseAnonKey);
  const client = window.VeraOfficeAuth?.client;
  const logoutButton = document.getElementById('logout-btn');

  if (!logoutButton) return;
  if (!client) {
    logoutButton.disabled = true;
    console.error('Could not log out: Supabase authentication is unavailable.');
    return;
  }

  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try {
      const { error } = await client.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
        logoutButton.disabled = false;
        return;
      }

      window.location.href = '/login.html';
    } catch (error) {
      console.error('Error logging out:', error);
      logoutButton.disabled = false;
    }
  });
});