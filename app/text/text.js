document.addEventListener("DOMContentLoaded", () => {

        // home-btn-text
    const homeButton = document.getElementById("home-btn-text");
    homeButton.addEventListener("click", (event) => {
        console.log("home-button-pressed")

    });

    const startButton = document.getElementById("start-btn-text")
    const toolbar = document.getElementById("start-text-toolbar")

    if (startButton && toolbar) {
        startButton.addEventListener("click", () => {
            toolbar.classList.toggle("hidden");

            console.log("start-menu got toggled")
        });
    }
});

