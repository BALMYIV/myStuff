import React, { useState, useEffect } from "react";
import Header from "./Header";
import "../assets/styles/App.css";

import AllNotes from "./AllNotes";
import NewNoteButton from "./NewNoteButton";
import NoteModal from "./NoteModal";
import TagCloud from "./TagCloud";
import TagOrganizer from "./TagOrganizer";

function App() {
  // this state holds the notes currently rendered
  const [notes, setNotes] = useState([]);
  // this state holds all the notes in the DB
  const [allNotes, setAllNotes] = useState([]);
  // this state holds tags that make up the tagscloud component
  const [tagsCloud, setTagsCloud] = useState([]);
  // holds selected note data object
  const [selectedNote, setSelectedNote] = useState(null);
  // controls opening of noteModal, is one of 3 values (false/update/new)
  const [showModal, setShowModal] = useState(false);
  // array of note_ids used to show order of notes on screen,
  const [notesOrder, setNotesOrder] = useState([]);
  // keeps track of what tags are selected in cloudTag component
  const [tagSelected, setTagSelected] = useState([]);
  // controls opening of tagOrganizer component.
  const [showTagOrganizer, setShowTagOrganizer] = useState(false);
  // some features in tagOrganizer require user to hand select notes to update, this holds that data.
  const [notesToOrganize, setNotesToOrganize] = useState([]);
  // holds search term for tag organizer search content feature
  const [search, setSearch] = useState("");

  const getTagsCloud = () => {
    fetch(`http://localhost:4000/tags/tagcloud`)
      .then((response) => response.json())
      .then((data) => setTagsCloud(data))
      .catch((err) => console.log(err));
  };

  //helper function refactors notes.tags from string to array
  const refactorNotes = (notesx) => {
    notesx.map((o) => {
      const tagsArray = o.tags.split(",");
      tagsArray[0] !== "" ? (o.tags = tagsArray) : (o.tags = []);
      return o;
    });
  };
  // gets all notes from DB then calls helper function refactorNotes then sets all notes into allNotes and Notes
  const getNotes = () => {
    fetch(`http://localhost:4000/notes`)
      .then((response) => response.json())
      .then((response) => {
        refactorNotes(response);
        setAllNotes(response);
        setNotes(response);
      })
      .catch((err) => console.log(err));
  };

  // helper function sets state that controls what notes are seen and what order.
  function updateNotesAndOrder(x) {
    setNotes(x);
    const n = x.map((note) => {
      return note.note_id;
    });
    setNotesOrder(n);
  }

  const getPositionIndexes = () => {
    fetch(`http://localhost:4000/get/position_indices`)
      .then((response) => response.json())
      .then((response) =>
        response[0].indices.split(",").map(function (item) {
          return parseInt(item, 10);
        })
      )
      .then((response) => setNotesOrder(response))
      .catch((err) => console.log(err));
  };
  // helper function to basically refresh page
  const reset = () => {
    getNotes();
    getTagsCloud();
    getPositionIndexes();
    //console.log("reset was run");
  };
  // function to filter notes by tag, uses allNotes as the source of all the notes.
  const getNotesByTag = (tag) => {
    let sortedNotes = [...allNotes];

    tag.map((t) => {
      const sorted = sortedNotes.filter((o) => o.tags.includes(t));
      // console.log(t, "t", tag, "tag");
      sortedNotes = sorted;
      return sortedNotes;
    });
    //console.log(sortedNotes, "sortedNotes");
    updateNotesAndOrder(sortedNotes);
  };

  useEffect(() => {
    if (tagSelected.length === 0) {
      reset();
    }
    getNotesByTag(tagSelected);
  }, [tagSelected]);

  // search notes content feature in tag organizer
  useEffect(() => {
    const searchNotes = (searchTerm) => {
      let x = [...allNotes];
      if (searchTerm.length > 0) {
        const searched = x.filter((o) => o.content.includes(searchTerm));
        console.log(searched, "searched");
        updateNotesAndOrder(searched);
      }
      // could do a reset here and call info back from DB or make more state to hold original copy of position_indices like we did notes;
      else {
        reset();
        console.log("reset was called");
      }
    };
    searchNotes(search);
  }, [search]);

  useEffect(() => {
    const handleOrderChange = () => {
      if (tagSelected.length === 0 && search.length === 0) {
        if (notesOrder.length > 0) {
          fetch(`http://localhost:4000/update/position_indices`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(notesOrder),
          })
            .then(() => console.log("db position_indices were updated"))
            .catch((err) => console.log(err));
        } else;
      }
    };

    handleOrderChange();
  }, [notesOrder]);

  //helper function for noteModal
  const noteSelected = (note) => {
    setShowModal("update");
    setSelectedNote(note);
  };
  //helper
  const closeModal = () => {
    setShowModal(false);
    setSelectedNote(null);
  };

  return (
    <div className="app">
      <Header pageTitle="Stuff" />

      {showModal !== false && (
        <NoteModal
          getNotes={getNotes}
          getPositionIndexes={getPositionIndexes}
          closeModal={closeModal}
          tagsCloud={tagsCloud}
          modalType={showModal}
          getTagsCloud={getTagsCloud}
          tagSelected={tagSelected}
          note={selectedNote}
        />
      )}

      <TagCloud
        tagsCloud={tagsCloud}
        getNotesByTag={getNotesByTag}
        tagSelected={tagSelected}
        setTagSelected={setTagSelected}
        reset={reset}
      />

      {showTagOrganizer === false && (
        <NewNoteButton
          setShowModal={setShowModal}
          setShowTagOrganizer={setShowTagOrganizer}
          onClick={() => setShowModal("new")}
        />
      )}

      {showTagOrganizer === true && (
        <TagOrganizer
          setShowTagOrganizer={setShowTagOrganizer}
          notesToOrganize={notesToOrganize}
          setNotesToOrganize={setNotesToOrganize}
          notesOrder={notesOrder}
          tagSelected={tagSelected}
          setTagSelected={setTagSelected}
          getTagsCloud={getTagsCloud}
          tagsCloud={tagsCloud}
          notes={notes}
          reset={reset}
          allNotes={allNotes}
          getNotesByTag={getNotesByTag}
          setSearch={setSearch}
          search={search}
        />
      )}

      <AllNotes
        className="all-notes"
        notes={notes}
        tagsCloud={tagsCloud}
        setNotes={setNotes}
        noteSelected={noteSelected}
        getNotes={getNotes}
        notesOrder={notesOrder}
        setNotesOrder={setNotesOrder}
        closeModal={closeModal}
        showTagOrganizer={showTagOrganizer}
        notesToOrganize={notesToOrganize}
        setNotesToOrganize={setNotesToOrganize}
        // temp use only, can remove after infinite scroll is done
        allNotes={allNotes}
      />
    </div>
  );
}

export default App;
