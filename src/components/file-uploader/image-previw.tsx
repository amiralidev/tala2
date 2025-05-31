import React from "react";

const ImagePreview = ({ file }) => {
  return (
    <div className="thumb">
      <div className="thumb-inner">
        <img
          src={file.preview}
          alt={file.name}
          onLoad={() => URL.revokeObjectURL(file.preview)}
        />
      </div>
    </div>
  );
};

export default ImagePreview;
