document.addEventListener("DOMContentLoaded", () => {

    const homeButton = document.getElementById("home-btn-text");
    const startButton = document.getElementById("start-btn-text"); 
    const toolbar = document.getElementById("start-text-toolbar");
    const editor = document.querySelector(".editor-container");
    
    const boldBtn = document.getElementById("bold-btn");
    const italicBtn = document.getElementById("italic-btn");
    const fontSizeInput = document.getElementById("font-size-input");

    if (homeButton) {
        homeButton.addEventListener("click", () => console.log("home-button pressed"));
    }

    if (startButton && toolbar) {
        startButton.addEventListener("click", () => {
            toolbar.classList.toggle("hidden");

        });
    }

    function keepFocus() {
        editor.focus();
    }

    if (boldBtn) {
        boldBtn.addEventListener("click", () => {
            document.execCommand("bold", false, null);
            boldBtn.classList.toggle("active-tool");
            keepFocus();
        });
    }

    if (italicBtn) {
        italicBtn.addEventListener("click", () => {
            document.execCommand("italic", false, null);
            italicBtn.classList.toggle("active-tool");
            keepFocus();
        });
    }
     if (fontSizeInput) {
        fontSizeInput.addEventListener("input", (e) => {
            let size = e.target.value;

            if (!isNaN(size) && size !== "") {
                size += "px";
            }

        
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("fontSize", false, "7");

            const fontSpans = editor.querySelectorAll("span[style*='font-size']");
            fontSpans.forEach(span => {
                if (span.style.fontSize === "xx-large" || span.getAttribute('size') === '7') {
                    span.style.fontSize = size;
                    span.removeAttribute('size');
                }
            });
            
            
        });
    }

  
    if (editor) {
        editor.addEventListener("keyup", updateButtonStates);
        editor.addEventListener("click", updateButtonStates);
    }

    function updateButtonStates() {
        if (!boldBtn || !italicBtn) return;

        if (document.queryCommandState("bold")) {
            boldBtn.classList.add("active-tool");
        } else {
            boldBtn.classList.remove("active-tool");
        }

        if (document.queryCommandState("italic")) {
            italicBtn.classList.add("active-tool");
        } else {
            italicBtn.classList.remove("active-tool"); 
        }
    }
});