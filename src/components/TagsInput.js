import React, { useState, useEffect } from "react";
import TagsModal from "./TagsModal";
import Tag from "./Tag";

// this component is dedicated to the features of the tag input in the noteModal.
function TagsInput({
  setTags,
  tagsCloud,
  noteTags,
  deleteTag,
  setShowTagsModal,
  showTagsModal,
  stopPropagation,
  getTagsCloud,
  hideTagInput,
}) {
  const tagsCloudArray = Object.keys(tagsCloud).map((key) => {
    return tagsCloud[key].tag;
  });

  const [visableTags, setVisableTags] = useState(tagsCloudArray);
  const [potentialTag, setPotentialTag] = useState("");

  const notInTagCloud = () => {
    tagsCloud.filter((object) => object.tag === visableTags[0].trim());
  };

  useEffect(() => {
    function findMatches() {
      if (potentialTag.length > 0) {
        return tagsCloudArray.filter((tag) => {
          console.log("tag in function", tag);
          const regex = new RegExp(potentialTag, "gi");
          return tag.match(regex);
        });
      }
    }
    if (potentialTag.length > 0) {
      const matches = findMatches(potentialTag);
      setVisableTags(matches);
    } else {
      setVisableTags(tagsCloudArray);
    }
  }, [potentialTag]);

  function handleChange(e) {
    console.log("---------- handleChange is running?---------------");
    stopPropagation(e);
    setPotentialTag(e.target.value);
  }

  //this adds a tag to the TagCloud in DB.  TagCloud is
  const addToTagCloud = () => {
    fetch(`http://localhost:4000/tag/add/totagcloud`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag: potentialTag,
      }),
    })
      .then(() => getTagsCloud())
      .then((response) => console.log("tag added to tag cloud?"))
      .catch((err) => console.log(err));
  };

  // this function adds a tag to a new note or extisting note form.
  const addToTags = (xpotentialTagx) => {
    if (
      //check tagsCloud to see if potential new tag is in tag cloud already
      tagsCloud.filter((object) => object.tag === xpotentialTagx.trim())
        .length > 0
    ) {
      if (
        //check noteTags to see if tag exists in note already
        noteTags.includes(xpotentialTagx)
      ) {
        // if tag exists in tagCloud, and already in note
        alert("this tag is already on this note");
        setPotentialTag("");
      } else {
        //if tag exists in tag cloud but not in that note's tags
        setTags([...noteTags, xpotentialTagx]);
        setPotentialTag("");
      }
    } else {
      // potential tag is first added to TagCloud then to tags on selected note.
      addToTagCloud(xpotentialTagx);
      setTags([...noteTags, xpotentialTagx]);
      setPotentialTag("");
    }
  };

  return (
    <div>
      <div className="tag-input-div">
        <div
          id="modalTitle"
          name="title"
          autoComplete="off"
          className="tags-div"
        >
          {!hideTagInput &&
            noteTags.map((tag) => {
              return (
                <Tag
                  addToTags={addToTags}
                  deleteTag={deleteTag}
                  key={tag}
                  tag={tag}
                />
              );
            })}
        </div>
        {!hideTagInput && (
          <input
            autoComplete="off"
            value={potentialTag}
            onChange={handleChange}
            onClick={() => setShowTagsModal(true)}
            placeholder="add tags.."
            id="tag-input"
            type="text"
            onKeyPress={(e) => {
              if (e.key === "tab" || e.key === "Enter") {
                e.preventDefault();
                if (visableTags.length !== 0 && notInTagCloud) {
                  addToTags(visableTags[0].trim());
                } else addToTags(potentialTag.trim());
              }
            }}
          />
        )}
      </div>
      {showTagsModal === true && (
        <TagsModal
          addToTags={addToTags}
          setShowTagsModal={setShowTagsModal}
          //won't need tagsCloud in here later.
          tagsCloud={tagsCloud}
          visableTags={visableTags}
        />
      )}
    </div>
  );
}

export default TagsInput;
