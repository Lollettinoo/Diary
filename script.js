document.addEventListener('DOMContentLoaded', () => {
    const noteList = document.getElementById('note-list');
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const newNoteBtn = document.getElementById('new-note-btn');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const deleteNoteBtn = document.getElementById('delete-note-btn');

    let notes = [];
    let currentNoteId = null; // Tiene traccia della nota attualmente aperta

    // --- Funzioni ---

    // Carica le note dal Local Storage
    function loadNotes() {
        const storedNotes = localStorage.getItem('diaryNotes');
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
        } else {
            notes = []; // Inizializza se non ci sono note salvate
        }
        renderNoteList();
        // Se ci sono note, carica la prima all'avvio (o l'ultima?)
        // if (notes.length > 0) {
        //     openNote(notes[0].id);
        // } else {
        //     clearEditor(); // Pulisci se non ci sono note
        // }
        clearEditor(); // Pulisce sempre all'inizio
    }

    // Mostra l'elenco delle note nella sidebar
    function renderNoteList() {
        noteList.innerHTML = ''; // Pulisce la lista esistente
        notes.sort((a, b) => b.timestamp - a.timestamp); // Ordina per data (più recente prima)

        notes.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note.title || 'Nota senza titolo'; // Mostra titolo o default
            li.dataset.id = note.id; // Salva l'ID nell'attributo data-id

            // Aggiungi classe 'active' se è la nota corrente
            if (note.id === currentNoteId) {
                li.classList.add('active');
            }

            li.addEventListener('click', () => openNote(note.id));
            noteList.appendChild(li);
        });
    }

    // Salva le note nel Local Storage
    function saveNotesToStorage() {
        localStorage.setItem('diaryNotes', JSON.stringify(notes));
    }

    // Pulisce l'editor per una nuova nota
    function clearEditor() {
        noteTitleInput.value = '';
        noteContentInput.value = '';
        currentNoteId = null;
        deleteNoteBtn.style.display = 'none'; // Nasconde il bottone elimina
        // Rimuovi classe 'active' da tutti gli elementi della lista
        document.querySelectorAll('#note-list li').forEach(li => li.classList.remove('active'));
    }

    // Apre una nota esistente nell'editor
    function openNote(id) {
        const noteToOpen = notes.find(note => note.id === id);
        if (noteToOpen) {
            noteTitleInput.value = noteToOpen.title;
            noteContentInput.value = noteToOpen.content;
            currentNoteId = id;
            deleteNoteBtn.style.display = 'inline-block'; // Mostra il bottone elimina
            renderNoteList(); // Aggiorna la lista per mostrare l'elemento attivo
        }
    }

    // Salva la nota corrente (nuova o modificata)
    function saveNote() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value;

        if (!title && !content) {
            alert("La nota è vuota, non verrà salvata.");
            return; // Non salvare note completamente vuote
        }

        const now = Date.now();

        if (currentNoteId) {
            // Modifica una nota esistente
            const noteIndex = notes.findIndex(note => note.id === currentNoteId);
            if (noteIndex > -1) {
                notes[noteIndex].title = title || 'Nota senza titolo'; // Usa un titolo di default se vuoto
                notes[noteIndex].content = content;
                notes[noteIndex].timestamp = now; // Aggiorna timestamp
            }
        } else {
            // Crea una nuova nota
            const newNote = {
                id: `note-${now}`, // ID univoco basato sul timestamp
                title: title || 'Nota senza titolo',
                content: content,
                timestamp: now
            };
            notes.push(newNote);
            currentNoteId = newNote.id; // Imposta la nuova nota come corrente
        }

        saveNotesToStorage();
        renderNoteList();
        // alert('Nota salvata!'); // Feedback opzionale
    }

    // Elimina la nota corrente
    function deleteNote() {
        if (!currentNoteId) return; // Nessuna nota selezionata

        if (confirm(`Sei sicuro di voler eliminare la nota "${noteTitleInput.value || 'questa nota'}"?`)) {
            notes = notes.filter(note => note.id !== currentNoteId);
            saveNotesToStorage();
            clearEditor();
            renderNoteList();
        }
    }

    // --- Event Listeners ---
    newNoteBtn.addEventListener('click', clearEditor);
    saveNoteBtn.addEventListener('click', saveNote);
    deleteNoteBtn.addEventListener('click', deleteNote);

    // Salva automaticamente quando si cambia nota o si lascia la pagina (opzionale ma utile)
    // window.addEventListener('beforeunload', saveNote); // Potrebbe essere fastidioso se non voluto
    // Considera un salvataggio più intelligente (es. dopo un tot di inattività)

    // --- Inizializzazione ---
    loadNotes();
});
