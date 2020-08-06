import React from "react";
import EditIcon from "../assets/icons/EditIcon";
import DeleteIcon from "../assets/icons/DeleteIcon";
import { sortableElement } from "react-sortable-hoc";

function Note({
  note,
  index,
  noteSelected,
  notesOrder,
  setNotesOrder,
  showTagOrganizer,
  notesToOrganize,
  setNotesToOrganize,
}) {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    //deleting note also requires you delete that note's index from position_indices table in state and DB
    const index = notesOrder.indexOf(note.note_id);
    const copyNotesOrder = [...notesOrder];
    copyNotesOrder.splice(index, 1);

    if (window.confirm(`Do you really want to delete this note?`)) {
      setNotesOrder(copyNotesOrder);
      fetch(`http://localhost:4000/note/delete`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          indices: copyNotesOrder,
          id: note.note_id,
        }),
      }).catch((err) => console.log(err));
    }
  };

  const changeNoteToOrganize = () => {
    const note_id = note.note_id;
    const copyNotesToOrganize = [...notesToOrganize];
    if (notesToOrganize.includes(note_id)) {
      const index = notesToOrganize.indexOf(note.note_id);
      copyNotesToOrganize.splice(index, 1);
    } else copyNotesToOrganize.push(note_id);
    setNotesToOrganize(copyNotesToOrganize);
  };

  const prettyTags =
    note && Array.isArray(note.tags) ? note.tags.join(" ") : "";

  // react-sortable-hoc (NPM package) magic.
  const SortableItem = sortableElement(({ note }) => (
    <div
      style={{
        background:
          note && notesToOrganize.includes(note.note_id) ? "#edc4d4" : "",
      }}
      className="note"
      onClick={() =>
        !showTagOrganizer ? noteSelected(note) : changeNoteToOrganize()
      }
    >
      <div
        onClick={() => (showTagOrganizer ? noteSelected(note) : "")}
        className="edit-note"
      >
        <EditIcon />
      </div>

      <div>
        {note && <div className="pretty-tags">{prettyTags}</div>}
        {note && <div>{note.content}</div>}
      </div>
      <button onClick={handleDelete} type="button" className="delete-button">
        <DeleteIcon id="delete-note" />
      </button>
    </div>
  ));

  return <SortableItem index={index} note={note} />;
}

export default Note;
