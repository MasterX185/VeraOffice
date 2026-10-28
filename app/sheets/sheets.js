document.addEventListener('DOMContentLoaded', () => {
  const spreadsheet = document.getElementById('spreadsheet');
  if (!spreadsheet) return;

  const homeButton = document.getElementById('home-btn-text');
  const startButton = document.getElementById('start-btn-text');
  const fileButton = document.getElementById('file-btn-text');

  const toolbarStart = document.getElementById('start-text-toolbar');
  const toolbarFile = document.getElementById('file-text-toolbar');

  const boldBtn = document.getElementById('bold-btn');
  const italicBtn = document.getElementById('italic-btn');
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');
  const fontSizeInput = document.getElementById('font-size-input');
  const copyBtn = document.getElementById('copy-btn-sheets') || document.getElementById('copy-btn-start');
  const insertBtn = document.getElementById('insert-btn-sheets') || document.getElementById('insert-btn-start');
  const clipboardStatus = document.getElementById('clipboard-status');
  const saveLocalButton = document.getElementById('save-local-btn-file');
  const saveCloudButton = document.getElementById('save-cloud-btn-file');

  const COLS = 10;
  const ROWS = 15;
  let activeCell = null;

  function showClipboardStatus(message) {
    if (clipboardStatus) {
      clipboardStatus.textContent = message;
    }
  }

  function keepFocus() {
    if (activeCell) {
      activeCell.focus();
    }
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

  if (homeButton) {
    homeButton.addEventListener('click', () => console.log('home-button pressed'));
  }

  if (startButton && toolbarStart) {
    startButton.addEventListener('click', () => {
      toolbarStart.classList.toggle('hidden');
      if (toolbarFile) toolbarFile.classList.add('hidden');
    });
  }

  if (fileButton && toolbarFile) {
    fileButton.addEventListener('click', () => {
      toolbarFile.classList.toggle('hidden');
      if (toolbarStart) toolbarStart.classList.add('hidden');
    });
  }

  if (boldBtn) {
    boldBtn.addEventListener('click', () => {
      if (!activeCell) return;
      activeCell.focus();
      document.execCommand('bold', false, null);
      updateButtonStates();
    });
  }

  if (italicBtn) {
    italicBtn.addEventListener('click', () => {
      if (!activeCell) return;
      activeCell.focus();
      document.execCommand('italic', false, null);
      updateButtonStates();
    });
  }

  if (undoBtn) {
    undoBtn.addEventListener('click', () => {
      if (activeCell) activeCell.focus();
      document.execCommand('undo', false, null);
    });
  }

  if (redoBtn) {
    redoBtn.addEventListener('click', () => {
      if (activeCell) activeCell.focus();
      document.execCommand('redo', false, null);
    });
  }

  if (fontSizeInput) {
    fontSizeInput.addEventListener('input', (event) => {
      if (!activeCell) return;

      const value = event.target.value.trim();
      const size = value && !Number.isNaN(Number(value.replace('px', ''))) ? value : '16px';
      activeCell.style.fontSize = size;
      activeCell.focus();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        if (!activeCell) {
          showClipboardStatus('Keine Zelle ausgewählt.');
          return;
        }

        const text = activeCell.textContent.trim();
        if (!text) {
          showClipboardStatus('Zelle leer.');
          return;
        }

        await navigator.clipboard.writeText(text);
        showClipboardStatus('Zelltext kopiert.');
      } catch (error) {
        console.error('Copy error:', error);
        showClipboardStatus('Kopieren fehlgeschlagen.');
      }
    });
  }

  if (insertBtn) {
    insertBtn.addEventListener('click', async () => {
      try {
        if (!activeCell) {
          showClipboardStatus('Keine Zelle ausgewählt.');
          return;
        }

        const text = await navigator.clipboard.readText();
        activeCell.focus();
        document.execCommand('insertText', false, text);
        showClipboardStatus('Text eingefügt.');
      } catch (error) {
        console.error('Insert error:', error);
        showClipboardStatus('Einfügen fehlgeschlagen.');
      }
    });
  }

  if (saveLocalButton) {
    saveLocalButton.addEventListener('click', () => {
      const rows = [];
      spreadsheet.querySelectorAll('.cell').forEach((cell) => {
        if (cell.classList.contains('header-cell')) return;
        rows.push(cell.textContent || '');
      });

      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sheet-data.json';
      link.click();
      URL.revokeObjectURL(url);
      showClipboardStatus('Datei lokal gespeichert.');
    });
  }

  if (saveCloudButton) {
    saveCloudButton.addEventListener('click', () => {
      showClipboardStatus('Cloud-Speichern für Sheets noch nicht aktiviert.');
    });
  }

  spreadsheet.innerHTML = '';
  spreadsheet.style.gridTemplateColumns = `40px repeat(${COLS}, 120px)`;

  const cornerCell = document.createElement('div');
  cornerCell.className = 'cell header-cell corner-cell';
  spreadsheet.appendChild(cornerCell);

  for (let c = 0; c < COLS; c++) {
    const header = document.createElement('div');
    header.className = 'cell header-cell';
    header.textContent = String.fromCharCode(65 + c);
    spreadsheet.appendChild(header);
  }

  for (let r = 1; r <= ROWS; r++) {
    const rowLabel = document.createElement('div');
    rowLabel.className = 'cell header-cell row-label';
    rowLabel.textContent = String(r);
    spreadsheet.appendChild(rowLabel);

    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.contentEditable = 'true';
      cell.tabIndex = 0;

      const colLetter = String.fromCharCode(65 + c);
      cell.id = `${colLetter}${r}`;

      cell.addEventListener('focus', () => {
        activeCell = cell;
        updateButtonStates();
      });

      cell.addEventListener('blur', (event) => {
        console.log(`Zelle ${cell.id} geändert auf:`, event.target.innerText);
      });

      spreadsheet.appendChild(cell);
    }
  }
});

