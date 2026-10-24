document.addEventListener('DOMContentLoaded', () => {
  const supabaseUrl = 'https://mmtlwtyyggwrqkylpqxv.supabase.co';
  const supabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tdGx3dHl5Z2d3cnFreWxwcXh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4MjYxNjAsImV4cCI6MjEwODQwMjE2MH0.HZKSAimGH8U87QW0KJmDXAaSUzf_0baYkDQ-5uUdPgM';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseAnonKey);

  const homeButton = document.getElementById('home-btn-text');
  const startButton = document.getElementById('start-btn-text');
  const toolbar = document.getElementById('start-text-toolbar');
  const editor = document.querySelector('.editor-container');

  const boldBtn = document.getElementById('bold-btn');
  const italicBtn = document.getElementById('italic-btn');
  const fontSizeInput = document.getElementById('font-size-input');
  const insertBtn = document.getElementById('insert-btn-start');
  const copyBtn = document.getElementById('copy-btn-start');

  if (homeButton) {
    homeButton.addEventListener('click', () =>
      console.log('home-button pressed')
    );
  }

  if (startButton && toolbar) {
    startButton.addEventListener('click', () => {
      toolbar.classList.toggle('hidden');
    });
  }

  function keepFocus() {
    editor.focus();
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        const selection = window.getSelection();

        if (selection.rangeCount > 0) {
          // define selectedText
          const selectedText = selection.toString();
          if (selectedText.length > 0) {
            await navigator.clipboard.writeText(selectedText);
            console.log('Your clipboard got something nice to eat!');
          }
        }
      } catch (err) {
        console.error(
          'Your clipboard has a bad day. It said something like this: ',
          err
        );
      }
    });
  }

  if (insertBtn) {
    insertBtn.addEventListener('click', async () => {
      try {
        const clipboardText = await navigator.clipboard.readText();
        keepFocus();

        const selection = window.getSelection();

        if (selection.rangeCount > 0) {
          // define range
          const range = selection.getRangeAt(0);

          range.deleteContents();
          const textNode = document.createTextNode(clipboardText);
          range.deleteContents();
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } catch (err) {
        console.error(
          'Your clipboard has a bad day. It said something like this: ',
          err
        );
      }
    });
  }

  if (boldBtn) {
    boldBtn.addEventListener('click', () => {
      document.execCommand('bold', false, null);
      boldBtn.classList.toggle('active-tool');
      keepFocus();
    });
  }

  if (italicBtn) {
    italicBtn.addEventListener('click', () => {
      document.execCommand('italic', false, null);
      italicBtn.classList.toggle('active-tool');
      keepFocus();
    });
  }
  if (fontSizeInput) {
    fontSizeInput.addEventListener('input', (e) => {
      let size = e.target.value;

      if (!isNaN(size) && size !== '') {
        size += 'px';
      }

      document.execCommand('styleWithCSS', false, true);
      document.execCommand('fontSize', false, '7');

      const fontSpans = editor.querySelectorAll("span[style*='font-size']");
      fontSpans.forEach((span) => {
        if (
          span.style.fontSize === 'xx-large' ||
          span.getAttribute('size') === '7'
        ) {
          span.style.fontSize = size;
          span.removeAttribute('size');
        }
      });
    });
  }

  if (editor) {
    editor.addEventListener('keyup', updateButtonStates);
    editor.addEventListener('click', updateButtonStates);
  }

  function updateButtonStates() {
    if (!boldBtn || !italicBtn) return;

    if (document.queryCommandState('bold')) {
      boldBtn.classList.add('active-tool');
    } else {
      boldBtn.classList.remove('active-tool');
    }

    if (document.queryCommandState('italic')) {
      italicBtn.classList.add('active-tool');
    } else {
      italicBtn.classList.remove('active-tool');
    }
  }
});
