import cloudinary from "../config/cloudinaryConfig.js";

const getBase64String = (file) => {
  const bufferString = Buffer.from(file.buffer).toString("base64");
  const base64 = "data:" + file.mimetype + ";base64," + bufferString;
  return base64;
};

const uploadArrayOfImagesToCloudinary = async ({ files, folder }) => {
  const uploadPromises = files.map(async (file) => {
    return new Promise((resolve, reject) => {
      try {
        const base64 = getBase64String(file);
        // Prepare Cloudinary upload stream
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            resource_type: file.mimetype.startsWith("image") ? "image" : "auto",
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload error: ", error);
              reject(error);
            } else {
              resolve({
                file: {
                  name: file.originalname || result.display_name,
                  path: result.secure_url,
                  type: `${result.resource_type}/${result.format}`,
                  public_id: result.public_id,
                },
              }); // Successfully uploaded, return the result
            }
          }
        );

        // Convert base64 to buffer and upload it
        const buffer = Buffer.from(base64.split(",")[1], "base64");
        uploadStream.end(buffer); // Finish the stream to start uploading
      } catch (error) {
        console.error("Error processing file: ", error);
        reject(error);
      }
    });
  });

  try {
    const uploadResults = await Promise.all(uploadPromises); // Wait for all uploads to complete
    console.log(uploadResults, 42);
    return uploadResults; // Return all results from Cloudinary uploads
  } catch (error) {
    console.error("Error uploading images to Cloudinary: ", error);
    throw error;
  }
};

export { uploadArrayOfImagesToCloudinary };
