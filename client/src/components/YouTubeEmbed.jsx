import React from 'react';

const YouTubeEmbed = ({ videoId }) => {
  return (
    <div className="relative pb-[400px] h-0 overflow-hidden">
      <iframe
        className="absolute top-0 left-0 w-full h-[450px]"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YouTubeEmbed;
