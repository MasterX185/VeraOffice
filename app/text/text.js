document.addEventListener('DOMContentLoaded', () => {
//general
  const homeBtn = document.getElementById('home-btn-text');
  const startBtn = document.getElementById('start-btn-text');
  const editor = document.querySelector('.editor-container');
  const fileBtn = document.getElementById('file-btn-text');
//toolbar-start
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  const toolbarStart = document.getElementById('start-text-toolbar');
  const boldBtn = document.getElementById('bold-btn');
  const italicBtn = document.getElementById('italic-btn');
  const fontSizeInput = document.getElementById('font-size-input');
  const insertBtn = document.getElementById('insert-btn-start');
  const copyBtn = document.getElementById('copy-btn-start');
  const clipboardStatus = document.getElementById('clipboard-status');
//toolbar-file
  const toolbarFile = document.getElementById('file-text-toolbar');
  const saveBtn = document. getElementById('save-btn-file');
//general
  function keepFocus() {
      editor.focus();
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
//toolbar-start
  function showClipboardStatus(message) {
    if (clipboardStatus) {
      clipboardStatus.textContent = message;
    }
  }

  function copyTextFallback(text) {
    const textArea = document.createElement('textarea');
    const selection = window.getSelection();
    const savedRange =
      selection && selection.rangeCount > 0
        ? selection.getRangeAt(0).cloneRange()
        : null;
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);

    try {
      textArea.select();
      return document.execCommand('copy');
    } finally {
      textArea.remove();
      if (savedRange && editor) {
        editor.focus();
        selection.removeAllRanges();
        selection.addRange(savedRange);
      }
    }
  }

  if (homeBtn) {
    homeBtn.addEventListener('click', () =>
      console.log('home-button pressed')
    );
  }

  if (startBtn && toolbarStart) {
    startBtn.addEventListener('click', () => {
      toolbarStart.classList.toggle('hidden');

      if (toolbarFile) {
        toolbarFile.classList.add('hidden');
      }
    });
  }


  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      document.execCommand('undo', false, null);
      keepFocus();
      updateButtonStates();
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      document.execCommand('redo', false, null);
      keepFocus();
      updateButtonStates();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const selectedText = selection.toString();
          if (!selectedText) {
            return;
          }

          if (navigator.clipboard?.writeText) {
            try {
              await navigator.clipboard.writeText(selectedText);
            } catch (err) {
              if (!copyTextFallback(selectedText)) {
                throw err;
              }
            }
          } else if (!copyTextFallback(selectedText)) {
            throw new Error('The browser could not copy the selected text.');
          }

          showClipboardStatus('Text copied.');
        }
      } catch (err) {
        showClipboardStatus('Could not copy text. Check browser clipboard permissions.');
        console.error(
          'Your clipboard has a bad day. It said something like this: ',
          err
        );
      }
    });
  }

  if (insertBtn) {
    insertBtn.addEventListener('click', async () => {
      if (!navigator.clipboard?.readText) {
        showClipboardStatus(
          'Clipboard access requires HTTPS or localhost. Use Ctrl+V to paste.'
        );
        return;
      }

      try {
        const clipboardText = await navigator.clipboard.readText();
        keepFocus();

        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          range.deleteContents();
          const textNode = document.createTextNode(clipboardText);
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.setEndAfter(textNode);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        showClipboardStatus('Text pasted.');
      } catch (err) {
        showClipboardStatus('Could not read clipboard. Use Ctrl+V to paste.');
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
//toolbar-file
  if (fileBtn && toolbarFile) {
    fileBtn.addEventListener('click', () => {
      toolbarFile.classList.toggle('hidden');

      if (toolbarStart) {
        toolbarStart.classList.add('hidden');
      }
    });
  }

  if (saveBtn && editor) {
  saveBtn.addEventListener('click', () => {
    const documentHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  ${editor.innerHTML}
</body>
</html>`;

    const file = new Blob([documentHtml], { type: 'text/html' });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = 'document.html';
    link.click();

    URL.revokeObjectURL(downloadUrl);
  });
}

  
});
