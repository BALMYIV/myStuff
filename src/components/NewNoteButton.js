import React from "react";

function NewNoteButton({ setShowModal, setShowTagOrganizer }) {
  // new note and tag organizer buttons
  return (
    <div className="create-note">
      <div className="new-note-button" onClick={() => setShowModal("new")}>
        New Note
      </div>
      <div
        onClick={() => setShowTagOrganizer(true)}
        className="tag-organizer-button"
      >
        Tag Organizer
      </div>
    </div>
  );
}

export default NewNoteButton;
