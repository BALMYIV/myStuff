import React, { useState } from "react";
import { useEffect } from "react";
import TagsInput from "./TagsInput";
import Tag from "./Tag";

function TagOrganizer({
  setShowTagOrganizer,
  setNotesToOrganize,
  notesToOrganize,
  notesOrder,
  tagSelected,
  getTagsCloud,
  tagsCloud,
  setTagSelected,
  notes,
  reset,
  allNotes,
  getNotesByTag,
  search,
  setSearch,
}) {
  // stores
  const [buttonClicks, setButtonClicks] = useState({
    rm: {},
    del: {},
  });

  const tagColor = ["#ddb3ad", "#ce2d32", "#660000"];

  const [tags, setTags] = useState([]);
  const [showTagsModal, setShowTagsModal] = useState(false);
  const [hideTagInput, setHideTagInput] = useState(false);

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  const deleteTag = (t) => {
    const tagsCopy = [...tags];
    const updatedTags = tagsCopy.filter((tag) => tag !== t);
    setTags(updatedTags);
  };

  useEffect(() => {
    if (tags.length > 0) {
      setShowTagsModal(false);
      setHideTagInput(true);
    } else setHideTagInput(false);
  }, [tags]);

  // click handler for Remove Tag from note(s)
  const handleClickRemoveTagFromNote = (e, tag) => {
    e.stopPropagation();
    if (notesToOrganize.length > 0) {
      if (buttonClicks.del[tag] === 3) {
        runApiCallAndStateResets(
          requests(notesTagRemoved(tag, notesToOrganize))
        );
        setButtonClicks({
          ...buttonClicks,
          del: { ...buttonClicks.del, [tag]: 0 },
        });
      } else {
        setButtonClicks({
          ...buttonClicks,
          del: { ...buttonClicks.del, [tag]: buttonClicks.del[tag] + 1 || 1 },
        });
      }
    }
  };
  // click handler for Remove Tag from Tag Cloud and notes
  const handleClickRemoveTagFromTagCloud = (e, tag) => {
    e.stopPropagation();
    if (buttonClicks.rm[tag] === 3) {
      removeTagPermanently(tag);
      setButtonClicks({
        ...buttonClicks,
        rm: { ...buttonClicks.rm, [tag]: 0 },
      });
    }
    setButtonClicks({
      ...buttonClicks,
      rm: { ...buttonClicks.rm, [tag]: buttonClicks.rm[tag] + 1 || 1 },
    });
  };

  //click handler to add tag to note, prepares notes

  const removeTagPermanently = (x) => {
    console.log("remove tag perm was run-----------");
    // need tagCloud Id to delete from DB,
    const { id, tag } = tagsCloud.find((o) => o.tag === x);
    fetch(`http://localhost:4000/tag/delete/fromtagcloud?id=${id}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => setTagSelected([]))
      .then(() =>
        runApiCallAndStateResets(requests(notesTagRemoved(tag, allNotes)))
      )
      .then(() =>
        console.log(` we just removed your tag {id} from the DB and all notes`)
      )
      .catch((err) => console.log(err));
  };

  // the next functions are for features in the tag organizer that "remove or add a tag from chosen notes"
  // one feature requires the user to hand pick notes to remove/add a tag from, the other feature removes
  // tag from all notes with that tag and deletes that tag from the tagcloud.

  // adds a tag to selected note(s),
  // *** we have a confusing situation the notes with updated tags are being updated into the state without me
  //explicitly directing that. Not hurting anything, but am leaving for feedback.

  const notesTagAdded = (tag) => {
    const tagString = tag.toString();
    const allNotesCopy = [...allNotes];
    let notesArray = [];
    notesToOrganize.map((id) => {
      allNotesCopy.filter((note) => {
        if (note.note_id === id) {
          notesArray.push(note);
        }
      });
    });
    const notesToAddTag = notesArray.filter((o) => !o.tags.includes(tagString));
    const notesReady = notesToAddTag.map((o) => {
      o.tags.push(tagString);
      return o;
    });
    console.log(notesReady, "notesready");
    return notesReady;
  };

  // this function removes a specific tag from a list of notes, this function is used by two
  //features delete tag from notes, and delete tag from tagcloud.
  const notesTagRemoved = (tag, array) => {
    const tagString = tag.toString();

    let notesArray = [];
    // array variable is array of note_ids (numbers) or array of objects depending on which feature is calling this function
    // we figure out what data type our variable is and handle it accordingly
    if (typeof array[0] === "number") {
      console.log("inside number if");
      //do not add a return here!
      array.map((id) => {
        //if var array is array of note_ids, we use this array to filter an array of note objects
        allNotes.filter((note) => {
          if (note.note_id === id) {
            notesArray.push(note);
          }
        });
      });
    } else notesArray = array;
    // this is a redundancy. we know array of objects all contain tag to remove, and newly built array of objects from
    // array of numbers variable contains tag to remove. this function double checks it.
    const filteredNotesArray = notesArray.filter((o) => {
      if (o.tags.includes(tagString)) {
        return o;
      }
    });
    // removing tag from tag array in each note.
    return filteredNotesArray.map((note) => {
      const updatedTags = note.tags.filter((t) => t !== tagString);
      console.warn(updatedTags, "updatedTags");
      note.tags = updatedTags;
      return note;
    });
  };

  // this function creates an array of fetch requests to update in DB.
  const requests = (updatedNotes) =>
    updatedNotes.map((note) => {
      console.log(updatedNotes, "updatedNotes", note, "note");
      const tags = note.tags.toString();
      const { note_id, content } = note;

      return fetch(`http://localhost:4000/note/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id, tags, content }),
      });
    });
  // this is a promise all function that runs the calls in parrallel and when they've all completed
  //and we get the single response back we run our reset() function to refresh the page.
  //need to rename this function
  const runApiCallAndStateResets = (requests) => {
    //runit(requests);
    Promise.all(requests)
      .then((responses) => console.log("the responses are back"))
      .then(() =>
        tagSelected.length > 0 ? getNotesByTag(tagSelected) : reset()
      );
  };

  const closeTagOrganizerModal = () => {
    setShowTagOrganizer(false);
    setNotesToOrganize([]);
  };

  return (
    <div
      onClick={() => closeTagOrganizerModal()}
      className="tag-organizer-wrapper"
    >
      <div className="tag-organizer" onClick={(e) => e.stopPropagation()}>
        <div
          onClick={() => closeTagOrganizerModal()}
          className="tag-organizer-title"
        >
          Tag Organizer
        </div>
        <div className="tag-organizer-features">
          <div className="tag-organizer-feature remove-tag-from-notes-div">
            <span>remove tag from note(s) --> </span>
            {tagSelected.length > 0 ? (
              <span className="cloud-tag-span">
                {tagSelected.map((tag) => (
                  <span
                    style={{
                      background:
                        tagColor[buttonClicks.del[tag] - 1] || "#f1da32",
                    }}
                    onClick={(e) => handleClickRemoveTagFromNote(e, tag)}
                    className="cloud-tag"
                    key={tag}
                    tag={tag}
                  >
                    {" "}
                    {tag}{" "}
                  </span>
                ))}
              </span>
            ) : (
              <span className="directions-span">select tag(s)</span>
            )}
            {/* {!notesToOrganize.length > 0 && (
              <span className="directions-span">no notes selected</span>
            )} */}
            {tagSelected.length > 0 && (
              <span className="all-none-button-div">
                <span>
                  <span
                    className="all-none-button"
                    onClick={(e) => {
                      setNotesToOrganize([...notesOrder]);
                      e.stopPropagation();
                    }}
                  >
                    all
                  </span>

                  <span
                    className="all-none-button"
                    onClick={(e) => {
                      setNotesToOrganize([]);
                      e.stopPropagation();
                    }}
                  >
                    none
                  </span>
                </span>
              </span>
            )}
            {!notesToOrganize.length > 0 && (
              <span className="directions-span">select note(s)</span>
            )}
          </div>

          <div className="tag-organizer-feature add-tag-to-notes-div">
            <span className="spani">
              {tags.length > 0 && notesToOrganize.length > 0 ? (
                <span>
                  add tag <Tag tag={tags[0]} deleteTag={deleteTag} /> to{" "}
                  <span className="pink">pink</span> note(s) -->{" "}
                </span>
              ) : (
                ` add tag to note(s) -->`
              )}
              {tags.length > 0 && notesToOrganize.length > 0 && (
                <span
                  onClick={() =>
                    runApiCallAndStateResets(requests(notesTagAdded(tags)))
                  }
                  className="add-to-notes-button"
                >
                  Add!
                </span>
              )}
              {!showTagsModal && (
                <div className="all-none-button-div">
                  <span
                    className="all-none-button"
                    onClick={(e) => {
                      setNotesToOrganize([...notesOrder]);
                      e.stopPropagation();
                    }}
                  >
                    all
                  </span>

                  <span
                    className="all-none-button"
                    onClick={(e) => {
                      setNotesToOrganize([]);
                      e.stopPropagation();
                    }}
                  >
                    none
                  </span>
                </div>
              )}
              {!notesToOrganize.length > 0 && !showTagsModal && (
                <span className="directions-span">select note(s)</span>
              )}
            </span>
            {notesToOrganize.length > 0 && (
              <TagsInput
                setTags={setTags}
                noteTags={tags}
                tagsCloud={tagsCloud}
                deleteTag={deleteTag}
                setShowTagsModal={setShowTagsModal}
                showTagsModal={showTagsModal}
                stopPropagation={stopPropagation}
                getTagsCloud={getTagsCloud}
                hideTagInput={hideTagInput}
                className="tags-input"
              />
            )}
          </div>

          <div className="tag-organizer-feature">
            <span>search notes --></span>

            <span className="input-span">
              <input
                type="search notes"
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
            </span>
          </div>

          <div className="tag-organizer-feature delete-from-tagCloud">
            <span>delete tag from tagCloud & notes --> </span>
            <span className="cloud-tag-span">
              {tagSelected.length > 0 ? (
                tagSelected.map((tag) => (
                  <span
                    style={{
                      background:
                        tagColor[buttonClicks.rm[tag] - 1] || "#f1da32",
                    }}
                    onClick={(e) => handleClickRemoveTagFromTagCloud(e, tag)}
                    className="cloud-tag"
                    key={tag}
                    tag={tag}
                  >
                    {" "}
                    {tag}{" "}
                  </span>
                ))
              ) : (
                <span className="directions-span">select tag</span>
              )}
            </span>
          </div>
        </div>
        <div
          onClick={() => closeTagOrganizerModal()}
          className="mobile-bottom"
        ></div>
      </div>
    </div>
  );
}

export default TagOrganizer;
