document.addEventListener('DOMContentLoaded', () => {
  const client = window.VeraOfficeAuth?.client;

  //general
  const logoutButton = document.getElementById('logout-btn');
  const documentsList = document.getElementById('documents-list');

  if (!logoutButton || !documentsList) return;
  if (!client) {
    logoutButton.disabled = true;
    console.error('Could not log out: Supabase authentication is unavailable.');
    return;
  }
// Logout button click event
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

  //load user details
  async function loadUserDetails() {
    if (!client) {
      console.error('Supabase client is not available.');
      return;
    }

    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (error) {
      console.error('Could not read the current user:', error.message);
      return;
    }

    if (!user) {
      console.error('No user is currently logged in.');
      return;
    }

    document.getElementById('user-email').textContent = user.email || 'N/A';
  }

  loadUserDetails();

  
  // Load user's documents
  async function loadDocuments() {
    if (!client) {
      console.error('Supabase client is not available.');
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError) {
      console.error('Could not read the current user:', userError.message);
      documentsList.innerHTML = '<p>Error loading documents.</p>';
      return;
    }

    if (!user) {
      console.error('No user is currently logged in.');
      documentsList.innerHTML = '<p>Please sign in to view your documents.</p>';
      return;
    }

    try {
      const { data: documents, error } = await client
        .from('documents')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching documents:', error.message);
        documentsList.innerHTML = '<p>Error loading documents.</p>';
        return;
      }

      if (!documents?.length) {
        documentsList.innerHTML = '<p>No documents found.</p>';
        return;
      }

  // Render documents
  documentsList.innerHTML = '';
  documents.forEach(doc => {
    const docElement = document.createElement('div');
    docElement.className = 'document-item';
    docElement.textContent = doc.title;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.textContent = "delete";

    deleteButton.addEventListener("click", () => {
      if (window.confirm("Do you really want to delete this document?")) {
        client.from("documents").delete().eq("id", doc.id).then(({ error }) => {
          if (error) {
            console.error("Error deleting document:", error.message);
          } else {
            docElement.remove();
          }
        });
      }
    });

    docElement.appendChild(deleteButton);
    documentsList.appendChild(docElement);
  });

  } catch (error) {
    console.error('Error loading documents:', error);
    documentsList.innerHTML = '<p>Error loading documents.</p>';
  }
  }

  loadDocuments();
});
