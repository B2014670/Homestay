const cloud_name = "doqqlyjb2";
const upload_preset = "btj12veg";

const uploadImageToCloudinary = async (file) => {
   const uploadData = new FormData();

   uploadData.append("file", file);
   uploadData.append("cloud_name", cloud_name);
   uploadData.append("upload_preset", upload_preset);

   const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/upload`,
      {
         method: "post",
         body: uploadData,
      }
   );

   const data = await res.json();

   return data;
};

export default uploadImageToCloudinary;