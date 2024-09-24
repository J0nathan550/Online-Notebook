document.addEventListener("DOMContentLoaded", function() {
    const addNoteBtn = document.getElementById("add-note-btn");
    const noteEditor = document.getElementById("note-editor");
    const mainContent = document.getElementById("main-content");
    const backBtn = document.getElementById("back-btn");
    const saveNoteBtn = document.getElementById("save-note-btn");
    const notesSection = document.getElementById("notes-section");
    const noteTitleInput = document.getElementById("note-title");
    const noteDescriptionInput = document.getElementById("note-description");
    const editorTitle = document.getElementById("editor-title");

    const boldBtn = document.getElementById("bold-btn");
    const italicBtn = document.getElementById("italic-btn");
    const underlineBtn = document.getElementById("underline-btn");

    let currentEditNote = null;

    function applyRichText(command) {
        document.execCommand(command, false, null);
        checkActiveButtons();
    }

    function toggleActive(button, command) {
        if (document.queryCommandState(command)) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    }

    function checkActiveButtons() {
        toggleActive(boldBtn, "bold");
        toggleActive(italicBtn, "italic");
        toggleActive(underlineBtn, "underline");
    }

    function focusDescriptionInput() {
        noteDescriptionInput.focus();
    }

    boldBtn.addEventListener("click", function() {
        focusDescriptionInput();
        applyRichText("bold");
    });

    italicBtn.addEventListener("click", function() {
        focusDescriptionInput();
        applyRichText("italic");
    });

    underlineBtn.addEventListener("click", function() {
        focusDescriptionInput();
        applyRichText("underline");
    });

    addNoteBtn.addEventListener("click", function() {
        mainContent.classList.add("hidden");
        noteEditor.classList.remove("hidden");
        setTimeout(() => noteEditor.classList.add("show"), 10);
        clearEditor();
        currentEditNote = null;
        editorTitle.innerText = "Створити нотатку";
    });

    backBtn.addEventListener("click", function() {
        noteEditor.classList.remove("show");
        setTimeout(() => {
            noteEditor.classList.add("hidden");
            mainContent.classList.remove("hidden");
        }, 300);
        clearEditor();
    });

    noteTitleInput.addEventListener("input", checkInput);
    noteDescriptionInput.addEventListener("input", checkInput);

    function checkInput() {
        if (noteTitleInput.value.trim() && noteDescriptionInput.innerHTML.trim() !== "<br>" && noteDescriptionInput.innerHTML.trim() !== "") {
            saveNoteBtn.disabled = false;
            saveNoteBtn.classList.remove("disabled");
        } else {
            saveNoteBtn.disabled = true;
            saveNoteBtn.classList.add("disabled");
        }
    }

    function updateNoNotesMessage() {
        const noNotesMessage = document.querySelector(".no-notes");
        if (notesSection.childNodes.length === 3) {
            noNotesMessage.style.display = "block";
        } else {
            noNotesMessage.style.display = "none";
        }
    }

    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        notes.forEach(note => {
            createNoteElement(note.title, note.description);
        });
		updateNoNotesMessage();
    }

    function createNoteElement(title, description) {
        const newNote = document.createElement("div");
        newNote.classList.add("note");
        newNote.setAttribute("draggable", "true");
        newNote.innerHTML = `
            <h3>${title}</h3>
            <div class="inOneLine">${description}</div>
            <div class="note-buttons">
                <button class="edit-btn">Редагувати</button>
                <button class="delete-btn">Видалити</button>
                <button class="up-btn">↑</button>
                <button class="down-btn">↓</button>
            </div>`;

        notesSection.appendChild(newNote);
        addNoteEventListeners(newNote);
		updateNoNotesMessage();
    }

    saveNoteBtn.addEventListener("click", function() {
        const noteTitle = noteTitleInput.value;
        const noteDescription = noteDescriptionInput.innerHTML;

        if (noteTitle && noteDescription) {
            if (currentEditNote) {
                currentEditNote.querySelector("h3").innerText = noteTitle;
                currentEditNote.querySelector("div").innerHTML = noteDescription;
            } else {
                createNoteElement(noteTitle, noteDescription);
            }

            updateLocalStorage();
            updateNoNotesMessage();

            noteEditor.classList.remove("show");
            setTimeout(() => {
                noteEditor.classList.add("hidden");
                mainContent.classList.remove("hidden");
            }, 300);
            clearEditor();
        }
    });

    function addNoteEventListeners(note) {
        note.querySelector(".edit-btn").addEventListener("click", function() {
            const title = note.querySelector("h3").innerText;
            const description = note.querySelector("div").innerHTML;

            noteTitleInput.value = title;
            noteDescriptionInput.innerHTML = description;
            currentEditNote = note;

            mainContent.classList.add("hidden");
            noteEditor.classList.remove("hidden");
            setTimeout(() => noteEditor.classList.add("show"), 10);
            editorTitle.innerText = "Редагувати нотатку";
            checkInput();
        });

        note.querySelector(".delete-btn").addEventListener("click", function() {
            if (confirm("Ви впевнені, що хочете видалити цю нотатку?")) {
                note.remove();
                updateLocalStorage();
                updateNoNotesMessage();
            }
        });

        note.querySelector(".up-btn").addEventListener("click", function() {
            const previousNote = note.previousElementSibling;
            if (previousNote) {
                notesSection.insertBefore(note, previousNote);
                updateLocalStorage();
            }
        });

        note.querySelector(".down-btn").addEventListener("click", function() {
            const nextNote = note.nextElementSibling;
            if (nextNote) {
                notesSection.insertBefore(nextNote, note);
                updateLocalStorage();
            }
        });

        note.addEventListener("dragstart", function() {
            note.classList.add("dragging");
        });

        note.addEventListener("dragend", function() {
            note.classList.remove("dragging");
        });
    }

    notesSection.addEventListener("dragover", function(e) {
        e.preventDefault();
        const draggingNote = document.querySelector(".dragging");
        const afterElement = getDragAfterElement(notesSection, e.clientY);
        if (afterElement == null) {
            notesSection.appendChild(draggingNote);
        } else {
            notesSection.insertBefore(draggingNote, afterElement);
        }
        updateLocalStorage();
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(".note:not(.dragging)")];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return {
                    offset: offset,
                    element: child
                };
            } else {
                return closest;
            }
        }, {
            offset: Number.NEGATIVE_INFINITY
        }).element;
    }

    function clearEditor() {
        noteTitleInput.value = "";
        noteDescriptionInput.innerHTML = "";
        saveNoteBtn.disabled = true;
        saveNoteBtn.classList.add("disabled");
        checkInput();
    }

    function updateLocalStorage() {
        const notes = [];
        notesSection.querySelectorAll('.note').forEach(note => {
            const title = note.querySelector("h3").innerText;
            const description = note.querySelector("div").innerHTML;
            notes.push({
                title,
                description
            });
        });
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    loadNotes();
});