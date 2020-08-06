import React, { useState, useEffect } from "react";

//tag component used in multiple components

function Tag({ tag, deleteTag }) {
  const [buttonClicks, setButtonClicks] = useState(0);
  const [tagColor, setTagColor] = useState("light green");

  useEffect(() => {
    if (buttonClicks === 1) {
      setTagColor("#ce2d32");
    } else if (buttonClicks === 2) {
      deleteTag(tag);
    }
  }, [buttonClicks]);

  return (
    <span
      style={{ background: tagColor }}
      className="cloud-tag"
      onClick={() => {
        setButtonClicks(buttonClicks + 1);
      }}
    >
      {tag}
    </span>
  );
}

export default Tag;
