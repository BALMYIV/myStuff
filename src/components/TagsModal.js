import React from "react";

function TagsModal({ addToTags, visableTags }) {
  return (
    <div>
      <div id="TagsModalBox">
        <div id="TagsModal">
          {visableTags.map((tag) => {
            return (
              <div
                className="tags-modal-tag"
                onClick={() => addToTags(tag)}
                key={tag}
              >
                {tag}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TagsModal;
