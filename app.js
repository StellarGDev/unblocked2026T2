
"use strict";

/* =====================================
   ELEMENTS
===================================== */

const gamesGrid = document.getElementById("gamesGrid");
const searchInput = document.getElementById("searchInput");
const gameCount = document.getElementById("gameCount");
const noResults = document.getElementById("noResults");

const gameModal = document.getElementById("gameModal");
const gameFrame = document.getElementById("gameFrame");
const modalTitle = document.getElementById("modalTitle");

const closeButton = document.getElementById("closeButton");
const fullscreenButton = document.getElementById("fullscreenButton");
const modalBackdrop = document.getElementById("modalBackdrop");
const iframeContainer = document.getElementById("iframeContainer");

let games = [];


/* =====================================
   LOAD GAMES.JSON
===================================== */

async function loadGames() {
    try {
        const response = await fetch("./games.json", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `games.json returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("games.json must contain an array.");
        }

        games = data.filter(game =>
            game &&
            typeof game.title === "string" &&
            typeof game.iframe === "string"
        );

        renderGames(games);

    } catch (error) {
        console.error("Unable to load games:", error);

        gamesGrid.innerHTML = "";

        const message = document.createElement("p");
        message.className = "loading";
        message.textContent =
            "Unable to load games. Check your games.json file.";

        gamesGrid.appendChild(message);
        gameCount.textContent = "Loading error";
    }
}


/* =====================================
   CREATE GAME CARD
===================================== */

function createGameCard(game) {
    const card = document.createElement("article");
    card.className = "game-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Play ${game.title}`);

    const thumbnail = document.createElement("div");
    thumbnail.className = "game-thumbnail";

    if (game.image) {
        const image = document.createElement("img");

        image.src = game.image;
        image.alt = `${game.title} thumbnail`;
        image.loading = "lazy";

        image.onerror = function () {
            this.onerror = null;
            this.remove();

            const placeholder = document.createElement("div");
            placeholder.className = "image-placeholder";
            placeholder.textContent = game.title;

            thumbnail.appendChild(placeholder);
        };

        thumbnail.appendChild(image);
    } else {
        const placeholder = document.createElement("div");
        placeholder.className = "image-placeholder";
        placeholder.textContent = game.title;

        thumbnail.appendChild(placeholder);
    }

    const info = document.createElement("div");
    info.className = "game-info";

    const title = document.createElement("h3");
    title.textContent = game.title;

    const description = document.createElement("p");
    description.textContent = game.description || "";

    info.appendChild(title);
    info.appendChild(description);

    if (game.category) {
        const category = document.createElement("span");
        category.className = "tag";
        category.textContent = game.category;

        info.appendChild(category);
    }

    card.appendChild(thumbnail);
    card.appendChild(info);

    card.addEventListener("click", () => openGame(game));

    card.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openGame(game);
        }
    });

    return card;
}


/* =====================================
   DISPLAY GAMES
===================================== */

function renderGames(gameList) {
    gamesGrid.innerHTML = "";

    gameCount.textContent =
        `${gameList.length} ${gameList.length === 1 ? "game" : "games"}`;

    if (gameList.length === 0) {
        noResults.classList.remove("hidden");
        return;
    }

    noResults.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    gameList.forEach(game => {
        fragment.appendChild(createGameCard(game));
    });

    gamesGrid.appendChild(fragment);
}


/* =====================================
   SEARCH
===================================== */

searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    const results = games.filter(game => {
        const searchable = [
            game.title,
            game.description,
            game.category,
            ...(Array.isArray(game.tags) ? game.tags : [])
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchable.includes(query);
    });

    renderGames(results);
});


/* =====================================
   OPEN GAME
===================================== */

function openGame(game) {
    if (!game.iframe) {
        alert("This game does not have a game URL.");
        return;
    }

    modalTitle.textContent = game.title;

    gameFrame.src = game.iframe;

    gameModal.classList.remove("hidden");

    document.body.style.overflow = "hidden";
}


/* =====================================
   CLOSE GAME
===================================== */

function closeGame() {
    gameModal.classList.add("hidden");

    gameFrame.src = "about:blank";

    document.body.style.overflow = "";
}

closeButton.addEventListener("click", closeGame);
modalBackdrop.addEventListener("click", closeGame);


/* =====================================
   FULLSCREEN
===================================== */

fullscreenButton.addEventListener("click", async () => {
    try {
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        } else {
            await iframeContainer.requestFullscreen();
        }
    } catch (error) {
        console.error("Fullscreen error:", error);
    }
});


/* =====================================
   ESCAPE KEY
===================================== */

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        !gameModal.classList.contains("hidden")
    ) {
        closeGame();
    }
});


/* =====================================
   START
===================================== */

loadGames();
