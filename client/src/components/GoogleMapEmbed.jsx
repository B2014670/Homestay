const GoogleMapEmbed = () => {
  return (
    <div className="w-full h-[400px] p-0 m-0">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3931.4875908148124!2d104.65430075917791!3d9.809351790245977!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a717e6f30ed999%3A0xd9718060d1c17752!2zS2h1IGR1IGzhu4tjaCBCw6NpIELDoG5n!5e0!3m2!1svi!2s!4v1728556841344!5m2!1svi!2s"
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
