import React from "react";

function TagCloud({ tagsCloud, tagSelected, setTagSelected }) {
  return (
    <div className="tag-cloud-container">
      {Object.keys(tagsCloud).map((key) => {
        const tag = tagsCloud[key].tag;
        const id = tagsCloud[key].id;
        return (
          <span
            onClick={() => {
              if (tagSelected.includes(tag)) {
                const copyTagSelected = [...tagSelected];
                const index = copyTagSelected.indexOf(tag);
                copyTagSelected.splice(index, 1);
                setTagSelected(copyTagSelected);
              } else {
                const copyTagSelected = [...tagSelected];
                copyTagSelected.push(tag);
                setTagSelected(copyTagSelected);
              }
            }}
            key={id}
            tag={tag}
            style={{ background: tagSelected.includes(tag) ? "#f1da32" : "" }}
            className="cloud-tag"
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}
export default TagCloud;
