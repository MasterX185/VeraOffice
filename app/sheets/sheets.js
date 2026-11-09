document.addEventListener("DOMContentLoaded", () => {
  const spreadsheet = document.getElementById("spreadsheet");
  if (!spreadsheet) return;

  const homeButton = document.getElementById("home-btn-text");
  const startButton = document.getElementById("start-btn-text");
  const fileButton = document.getElementById("file-btn-text");
  const toolbarStart = document.getElementById("start-text-toolbar");
  const toolbarFile = document.getElementById("file-text-toolbar");
  const boldBtn = document.getElementById("bold-btn");
  const italicBtn = document.getElementById("italic-btn");
  const undoBtn = document.getElementById("undo-btn");
  const redoBtn = document.getElementById("redo-btn");
  const fontSizeInput = document.getElementById("font-size-input");
  const copyBtn = document.getElementById("copy-btn-sheets");
  const insertBtn = document.getElementById("insert-btn-sheets");
  const clipboardStatus = document.getElementById("clipboard-status");
  const saveLocalButton = document.getElementById("save-local-btn-file");
  const saveCloudButton = document.getElementById("save-cloud-btn-file");
  const documentId = new URLSearchParams(window.location.search).get("docId");

  const ROW_HEIGHT = 28;
  const COLUMN_WIDTH = 120;
  const HEADER_SIZE = 40;
  const OVERSCAN = 4;
  const PAGE_SIZE = 100;
  let totalRows = 100;
  let totalColumns = 26;
  let activeCell = null;
  const values = new Map();
  const renderedCells = new Map();

  function getColumnLabel(index) {
    let label = "";
    let number = index + 1;

    while (number > 0) {
      const remainder = (number - 1) % 26;
      label = String.fromCharCode(65 + remainder) + label;
      number = Math.floor((number - 1) / 26);
    }

    return label;
  }

  function getCellId(column, row) {
    return `${getColumnLabel(column)}${row + 1}`;
  }

  function showClipboardStatus(message) {
    if (clipboardStatus) clipboardStatus.textContent = message;
  }

  async function loadDocument() {
    if (!documentId) return;

    const client = window.VeraOfficeAuth?.client;
    if (!client) {
      showClipboardStatus("Could not load document: Supabase is unavailable.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();
    if (userError || !user) {
      window.location.assign("../../login.html");
      return;
    }

    const { data: document, error } = await client
      .from("documents")
      .select("id, content, document_type")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (error) {
      showClipboardStatus("Could not load document.");
      console.error("Error loading document:", error.message);
      return;
    }

    if (document.document_type && document.document_type !== "sheet") {
      showClipboardStatus("This document belongs to another editor.");
      return;
    }

    try {
      const savedValues = JSON.parse(document.content || "{}");
      Object.entries(savedValues).forEach(([id, value]) => {
        if (typeof value === "string") values.set(id, value);
      });
      renderVisibleCells();
    } catch (error) {
      showClipboardStatus("Could not read the saved sheet data.");
      console.error("Invalid saved sheet data:", error);
    }
  }

  function updateButtonStates() {
    if (!boldBtn || !italicBtn) return;
    boldBtn.classList.toggle("active-tool", document.queryCommandState("bold"));
    italicBtn.classList.toggle(
      "active-tool",
      document.queryCommandState("italic"),
    );
  }

  function setPosition(element, left, top, width, height) {
    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
  }

  const canvas = document.createElement("div");
  canvas.className = "sheet-canvas";
  spreadsheet.replaceChildren(canvas);

  function updateCanvasSize() {
    canvas.style.width = `${HEADER_SIZE + totalColumns * COLUMN_WIDTH}px`;
    canvas.style.height = `${HEADER_SIZE + totalRows * ROW_HEIGHT}px`;
  }

  function createElement(className, key) {
    const element = document.createElement("div");
    element.className = className;
    element.dataset.key = key;
    canvas.appendChild(element);
    renderedCells.set(key, element);
    return element;
  }

  function renderVisibleCells() {
    const scrollLeft = spreadsheet.scrollLeft;
    const scrollTop = spreadsheet.scrollTop;
    const firstColumn = Math.max(
      0,
      Math.floor(scrollLeft / COLUMN_WIDTH) - OVERSCAN,
    );
    const lastColumn = Math.min(
      totalColumns - 1,
      Math.ceil((scrollLeft + spreadsheet.clientWidth) / COLUMN_WIDTH) + OVERSCAN,
    );
    const firstRow = Math.max(
      0,
      Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN,
    );
    const lastRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + spreadsheet.clientHeight) / ROW_HEIGHT) + OVERSCAN,
    );
    const visibleKeys = new Set(["corner"]);

    let corner = renderedCells.get("corner");
    if (!corner) corner = createElement("sheet-header sheet-corner", "corner");
    corner.textContent = "";
    setPosition(corner, scrollLeft, scrollTop, HEADER_SIZE, HEADER_SIZE);

    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const key = `column-${column}`;
      visibleKeys.add(key);
      const header =
        renderedCells.get(key) ||
        createElement("sheet-header sheet-column", key);
      header.textContent = getColumnLabel(column);
      setPosition(
        header,
        HEADER_SIZE + column * COLUMN_WIDTH,
        scrollTop,
        COLUMN_WIDTH,
        HEADER_SIZE,
      );
    }

    for (let row = firstRow; row <= lastRow; row += 1) {
      const rowKey = `row-${row}`;
      visibleKeys.add(rowKey);
      const rowHeader =
        renderedCells.get(rowKey) ||
        createElement("sheet-header sheet-row", rowKey);
      rowHeader.textContent = String(row + 1);
      setPosition(
        rowHeader,
        scrollLeft,
        HEADER_SIZE + row * ROW_HEIGHT,
        HEADER_SIZE,
        ROW_HEIGHT,
      );

      for (let column = firstColumn; column <= lastColumn; column += 1) {
        const id = getCellId(column, row);
        const key = `cell-${id}`;
        visibleKeys.add(key);
        let cell = renderedCells.get(key);

        if (!cell) {
          cell = createElement("sheet-cell", key);
          cell.id = id;
          cell.contentEditable = "true";
          cell.tabIndex = 0;
          cell.addEventListener("focus", () => {
            activeCell = cell;
            updateButtonStates();
          });
          cell.addEventListener("input", () => {
            const text = cell.textContent || "";
            if (text) values.set(id, text);
            else values.delete(id);
          });
          cell.addEventListener("blur", () => {
            if (cell.textContent) values.set(id, cell.textContent);
            else values.delete(id);
          });
        }

        if (document.activeElement !== cell) {
          cell.textContent = values.get(id) || "";
        }
        setPosition(
          cell,
          HEADER_SIZE + column * COLUMN_WIDTH,
          HEADER_SIZE + row * ROW_HEIGHT,
          COLUMN_WIDTH,
          ROW_HEIGHT,
        );
      }
    }

    renderedCells.forEach((element, key) => {
      if (!visibleKeys.has(key) && element !== activeCell) {
        element.remove();
        renderedCells.delete(key);
      }
    });
  }

  function expandIfNeeded() {
    const nearBottom =
      spreadsheet.scrollTop + spreadsheet.clientHeight >=
      spreadsheet.scrollHeight - ROW_HEIGHT * PAGE_SIZE;
    const nearRight =
      spreadsheet.scrollLeft + spreadsheet.clientWidth >=
      spreadsheet.scrollWidth - COLUMN_WIDTH * PAGE_SIZE;

    if (nearBottom) totalRows += PAGE_SIZE;
    if (nearRight) totalColumns += PAGE_SIZE;
    if (nearBottom || nearRight) {
      updateCanvasSize();
      renderVisibleCells();
    }
  }

  spreadsheet.addEventListener("scroll", () => {
    expandIfNeeded();
    renderVisibleCells();
  });
  window.addEventListener("resize", renderVisibleCells);

  if (homeButton) {
    homeButton.addEventListener("click", () =>
      console.log("home-button pressed"),
    );
  }
  if (startButton && toolbarStart) {
    startButton.addEventListener("click", () => {
      toolbarStart.classList.toggle("hidden");
      if (toolbarFile) toolbarFile.classList.add("hidden");
    });
  }
  if (fileButton && toolbarFile) {
    fileButton.addEventListener("click", () => {
      toolbarFile.classList.toggle("hidden");
      if (toolbarStart) toolbarStart.classList.add("hidden");
    });
  }
  if (boldBtn) {
    boldBtn.addEventListener("click", () => {
      if (!activeCell) return;
      activeCell.focus();
      document.execCommand("bold", false);
      updateButtonStates();
    });
  }
  if (italicBtn) {
    italicBtn.addEventListener("click", () => {
      if (!activeCell) return;
      activeCell.focus();
      document.execCommand("italic", false);
      updateButtonStates();
    });
  }
  if (undoBtn) {
    undoBtn.addEventListener("click", () => {
      activeCell?.focus();
      document.execCommand("undo", false);
    });
  }
  if (redoBtn) {
    redoBtn.addEventListener("click", () => {
      activeCell?.focus();
      document.execCommand("redo", false);
    });
  }
  if (fontSizeInput) {
    fontSizeInput.addEventListener("input", (event) => {
      if (!activeCell) return;
      const value = event.target.value.trim();
      const size =
        value && !Number.isNaN(Number(value.replace("px", "")))
          ? value
          : "16px";
      activeCell.style.fontSize = size;
      activeCell.focus();
    });
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        if (!activeCell) return showClipboardStatus("Keine Zelle ausgewählt.");
        const text = activeCell.textContent.trim();
        if (!text) return showClipboardStatus("Zelle leer.");
        await navigator.clipboard.writeText(text);
        showClipboardStatus("Zelltext kopiert.");
      } catch (error) {
        console.error("Copy error:", error);
        showClipboardStatus("Kopieren fehlgeschlagen.");
      }
    });
  }
  if (insertBtn) {
    insertBtn.addEventListener("click", async () => {
      try {
        if (!activeCell) return showClipboardStatus("Keine Zelle ausgewählt.");
        activeCell.focus();
        document.execCommand(
          "insertText",
          false,
          await navigator.clipboard.readText(),
        );
        showClipboardStatus("Text eingefügt.");
      } catch (error) {
        console.error("Insert error:", error);
        showClipboardStatus("Einfügen fehlgeschlagen.");
      }
    });
  }
  if (saveLocalButton) {
    saveLocalButton.addEventListener("click", () => {
      const blob = new Blob(
        [JSON.stringify(Object.fromEntries(values), null, 2)],
        {
          type: "application/json",
        },
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sheet-data.json";
      link.click();
      URL.revokeObjectURL(url);
      showClipboardStatus("Datei lokal gespeichert.");
    });
  }

  // Supabase Cloud Save
  if (saveCloudButton) {
    saveCloudButton.addEventListener("click", async () => {
      try {
        // Retrieve the client from where auth.js stored it
        const client = window.VeraOfficeAuth?.client || window.supabase;

        if (!client || typeof client.from !== "function") {
          throw new Error(
            "Supabase client is not initialized or auth.js is missing.",
          );
        }

        // 1. Check for the authenticated user
        const { data: { user }, error: userError } = await client.auth.getUser();

        if (userError || !user) {
          alert("You are not signed in. Please log in first using the sign-in button.");
          console.warn("Auth error or no user found:", userError);
          return;
        }

        const content = JSON.stringify(Object.fromEntries(values));
        const title = "Unnamed Spreadsheet";
        const documentData = {
          user_id: user.id,
          title,
          content,
          document_type: "sheet",
          updated_at: new Date().toISOString(),
        };

        let result;
        if (documentId) {
          result = await client
            .from("documents")
            .update(documentData)
            .eq("id", documentId)
            .eq("user_id", user.id);
        } else {
          result = await client
            .from("documents")
            .insert(documentData)
            .select("id")
            .single();
        }

        if (result.error) throw result.error;
        if (!documentId && result.data?.id) {
          const url = new URL(window.location.href);
          url.searchParams.set("docId", result.data.id);
          window.history.replaceState({}, "", url);
        }

        showClipboardStatus("Successfully saved in the Supabase cloud!");
        console.log("Document successfully saved in Supabase.");
      } catch (err) {
        showClipboardStatus("Cloud save failed! Check the console for details.");
        console.error("Error while saving to Supabase:", err);
      }
    });
  }

  updateCanvasSize();
  renderVisibleCells();
  loadDocument();
});
