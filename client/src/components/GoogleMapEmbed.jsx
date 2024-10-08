const GoogleMapEmbed = () => {
  return (
    <div className="w-full h-[400px] p-0 m-0">
      {/* <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000;">
        <iframe
          src="https://www.youtube.com/embed/ZdM2zp7ZcnI"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
        </iframe>
      </div> */}

      <iframe
        src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d31430.108934217147!2d105.789643!3d10.036355!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTDCsDAyJzEwLjkiTiAxMDXCsDQ3JzIyLjciRQ!5e0!3m2!1sen!2sus!4v1726562632204!5m2!1sen!2sus"
        width="100%"
        height="100%"
        allowFullScreen
        loading="lazy"
        className="rounded-md shadow-lg"
      ></iframe>
    </div>
  );
};

export default GoogleMapEmbed;
