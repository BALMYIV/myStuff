import React from "react";
import Note from "./Note";
import { sortableContainer } from "react-sortable-hoc";
import arrayMove from "array-move";

//most of this component is related to drag and drop functionality from "react-sortable-hoc"

function AllNotes({
  noteSelected,
  notes,
  tagsCloud,
  getNotes,
  notesOrder,
  setNotesOrder,
  closeModal,
  showTagOrganizer,
  notesToOrganize,
  setNotesToOrganize,
}) {
  const SortableList = sortableContainer(({ children }) => (
    <div className="notes">{children}</div>
  ));

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setNotesOrder(arrayMove(notesOrder, oldIndex, newIndex));
  };

  return (
    <SortableList
      lockToContainerEdges={true}
      axis="xy"
      distance={10}
      onSortEnd={onSortEnd}
    >
      {notesOrder.map((note_id, index) => {
        const note = notes.find((o) => o.note_id === note_id);

        return (
          <Note
            noteSelected={noteSelected}
            key={note_id}
            tagsCloud={tagsCloud}
            index={index}
            note={note}
            notesOrder={notesOrder}
            getNotes={getNotes}
            setNotesOrder={setNotesOrder}
            closeModal={closeModal}
            showTagOrganizer={showTagOrganizer}
            notesToOrganize={notesToOrganize}
            setNotesToOrganize={setNotesToOrganize}
          />
        );
      })}
    </SortableList>
  );
}

export default AllNotes;
