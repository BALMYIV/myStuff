import React, { useState } from "react";
import TagsInput from "./TagsInput";
import DeleteIcon from "../assets/icons/DeleteIcon";

// this modal/form is used for making new and updating existing notes.

function NoteModal({
  note,
  closeModal,
  getNotes,
  tagsCloud,
  getPositionIndexes,
  modalType,
  tagSelected,
  getTagsCloud,
}) {
  const [Note] = useState(note ? note : "");
  const [note_id] = useState(Note ? Note.note_id : "");
  const [tags, setTags] = useState(Note.tags ? Note.tags : []);
  const [content, setContent] = useState(Note ? Note.content : "");
  const [showTagsModal, setShowTagsModal] = useState(false);

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const deleteTag = (t) => {
    const tagsCopy = [...tags];
    const updatedTags = tagsCopy.filter((tag) => tag !== t);
    setTags(updatedTags);
  };

  const handleSubmit = (e) => {
    const tagsString = [...tags].join(",");

    if (modalType === "update") {
      e.preventDefault();

      fetch(`http://localhost:4000/note/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id, tags: tagsString, content }),
      })
        .then((response) => response.json())
        .then(() => getNotes())
        .then(closeModal)
        .catch((err) => console.log(err));
    } else if (modalType === "new" && (content !== "" || tags.length > 0)) {
      fetch("http://localhost:4000/note/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: tagsString, content }),
      })
        .then((response) => response.json())
        .then(() => (tagSelected.length === 0 ? getNotes() : null))
        .then(() => (tagSelected.length === 0 ? getPositionIndexes() : null))
        .then(closeModal)
        .catch((err) => console.log(err));
    } else
      console.log(
        "error-------------modal type wasn't new or update OR new note form was empty "
      );
    closeModal();
  };

  const handleDelete = (e) => {
    e.preventDefault();

    if (window.confirm("Do you really want to delete this note?")) {
      fetch(`http://localhost:4000/note/delete?id=${note.note_id}`)
        .then(closeModal)
        .catch((err) => console.log(err));
    }
  };

  return (
    <div>
      <div
        className="modal-backdrop"
        onClick={(e) => {
          handleSubmit(e);
        }}
        id="modalBox"
      >
        <div className="modal-container">
          <div className="modal" onClick={stopPropagation}>
            <form
              onSubmit={handleSubmit}
              onClick={stopPropagation}
              className="edit-form"
            >
              <TagsInput
                setTags={setTags}
                noteTags={tags}
                tagsCloud={tagsCloud}
                deleteTag={deleteTag}
                setShowTagsModal={setShowTagsModal}
                showTagsModal={showTagsModal}
                stopPropagation={stopPropagation}
                getTagsCloud={getTagsCloud}
              />

              <textarea
                id="modalContent"
                onChange={(e) => setContent(e.target.value)}
                onClick={() => setShowTagsModal(false)}
                value={content}
                name="content"
                placeholder="title/note..."
                rows="8"
              />

              <footer className="modal-footer">
                <button
                  onClick={handleDelete}
                  type="button"
                  className="delete-button"
                >
                  <DeleteIcon />
                </button>
              </footer>
            </form>
          </div>
          <div className="modal-hover">
            to save note click off the safe zone
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteModal;
