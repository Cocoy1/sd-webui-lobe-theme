let timeout;

function updateTimer(el, endTime) {
    const formatTime = (i) => (i < 10 ? "0" + i : i);
    const now = Math.floor(Date.now() / 1000);
    let remaining = endTime - now;

    if (remaining <= 0) {
        el.innerText = "00:00";
        return;
    }

    const minutes = formatTime(Math.floor(remaining / 60));
    const seconds = formatTime(remaining % 60);

    el.innerText = `${minutes}:${seconds}`;
    timeout = setTimeout(() => updateTimer(el, endTime), 1000);
}

function checkAllowedUrl() {
    const allowedHREF = ".a.free.pinggy.link";
    return window.location.href.includes(allowedHREF);
}

async function refreshTimer(timerEL, notext = false) {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }
    if (!notext) timerEL.innerText = "Connecting...";

    try {
        const response = await fetch("file=asd/pinggytimer.txt", { cache: "no-store" });
        if (!response.ok) {
            timerEL.innerText = "Disconnected";
            return;
        }

        const text = await response.text();
        const endTime = parseInt(text, 10);
        if (isNaN(endTime)) {
            timerEL.innerText = "Network Error";
        } else {
            updateTimer(timerEL, endTime);
        }
    } catch (err) {
        console.error("Error fetching timer data:", err);
        timerEL.innerText = "Connection Error";
    }
}

function initializeTimer() {
    const quickSettings = gradioApp().querySelector("#quicksettings");

    if (!quickSettings || gradioApp().querySelector("#nocrypt-timer") !== null) return;

    // Crear contenedor principal
    const mainEL = document.createElement("div");
    mainEL.id = "nocrypt-timer";
    mainEL.style = `
        position: absolute;
        top: -32px;
        right: -60px;
        gap: 5px;
        user-select: none;
        transform-origin: left center;
        scale: 0.8;
        display: flex;
        z-index: 999;
    `;

    // Crear botón contenedor
    const buttonEL = document.createElement("div");
    buttonEL.className = "gr-box";
    buttonEL.style = `
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 5px;
        background-color: transparent;
        gap: 5px;
    `;
    buttonEL.title = "Refresh Timer";

    // Elemento del temporizador
    const timerEL = document.createElement("div");
    timerEL.style = `
        font-family: 'Roboto Mono', monospace;
        font-size: 18px;
        color: grey;
    `;
    timerEL.innerText = "Connecting...";

    // Texto del túnel
    const tunnelEL = document.createElement("div");
    tunnelEL.innerText = "pinggy";
    tunnelEL.style = `
        font-family: 'Roboto Mono', monospace;
        font-size: 18px;
        font-weight: bold;
    `;

    buttonEL.appendChild(tunnelEL);
    if (checkAllowedUrl()) {
        buttonEL.appendChild(timerEL);
        mainEL.appendChild(buttonEL);
    }

    buttonEL.onclick = () => refreshTimer(timerEL);
    quickSettings.parentNode.insertBefore(mainEL, quickSettings.nextSibling);

    if (checkAllowedUrl()) refreshTimer(timerEL);
}

onUiLoaded(initializeTimer);
