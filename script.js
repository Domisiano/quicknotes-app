const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#note-title");
const textInput = document.querySelector("#note-text");
const categoryInput = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const emptyMessage = document.querySelector("#empty-message");
const formMessage = document.querySelector("#form-message");

const STORAGE_KEY = "quicknotes-notes";

let notes = loadNotes();

function loadNotes() {
    try {
        const savedNotes = localStorage.getItem(STORAGE_KEY);

        if (savedNotes === null) {
            return [];
        }

        const parsedNotes = JSON.parse(savedNotes);

        return Array.isArray(parsedNotes) ? parsedNotes : [];
    } catch (error) {
        console.error("Could not load saved notes:", error);
        return [];
    }
}

function saveNotes() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return true;
    } catch (error) {
        console.error("Could not save notes:", error);
        formMessage.textContent =
            "Could not save your notes. Check your browser storage.";
        return false;
    }
}

function renderNotes() {
    const query = searchInput.value.trim().toLowerCase();

    const filteredNotes = notes.filter((note) => {
        return (
            note.title.toLowerCase().includes(query) ||
            note.text.toLowerCase().includes(query) ||
            note.category.toLowerCase().includes(query)
        );
    });

    notesList.replaceChildren();
    noteCount.textContent = `(${notes.length})`;

    emptyMessage.hidden = filteredNotes.length > 0;

    if (notes.length === 0) {
        emptyMessage.textContent =
            "No notes yet. Create your first note above.";
    } else if (filteredNotes.length === 0) {
        emptyMessage.textContent = "No matching notes found.";
    }

    filteredNotes.forEach((note) => {
        const card = document.createElement("article");
        card.className = "note-card";

        const title = document.createElement("h3");
        title.textContent = note.title;

        const category = document.createElement("span");
        category.className = "note-category";
        category.textContent = note.category;

        const content = document.createElement("p");
        content.textContent = note.text;

        const date = document.createElement("p");
        date.className = "note-date";
        date.textContent = `Created: ${note.createdAt}`;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            `Delete note: ${note.title}`
        );

        deleteButton.addEventListener("click", () => {
            deleteNote(note.id);
        });

        card.append(title, category, content, date, deleteButton);
        notesList.append(card);
    });
}

function addNote(event) {
    event.preventDefault();
    formMessage.textContent = "";

    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    const category = categoryInput.value;

    if (!title || !text) {
        formMessage.textContent =
            "Please enter both a title and note content.";
        return;
    }

    if (title.length > 80 || text.length > 1000) {
        formMessage.textContent =
            "The title or note is longer than the allowed limit.";
        return;
    }

    const newNote = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        text,
        category,
        createdAt: new Date().toLocaleString()
    };

    notes.unshift(newNote);

    if (!saveNotes()) {
        notes.shift();
        return;
    }

    noteForm.reset();
    formMessage.textContent = "Note added successfully.";
    renderNotes();
}

function deleteNote(id) {
    const previousNotes = notes;
    notes = notes.filter((note) => note.id !== id);

    if (!saveNotes()) {
        notes = previousNotes;
        return;
    }

    formMessage.textContent = "Note deleted.";
    renderNotes();
}

noteForm.addEventListener("submit", addNote);
searchInput.addEventListener("input", renderNotes);

renderNotes();