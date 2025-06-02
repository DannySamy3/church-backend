import axios from "axios";
import { Request } from "express";

// Ensure you have your Imgur Client ID in your environment variables (.env)
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;

if (!IMGUR_CLIENT_ID) {
  console.error("IMGUR_CLIENT_ID not found in environment variables.");
  // Depending on your application's needs, you might want to exit or handle this differently
}

export const uploadImageToImgur = async (
  file: Express.Multer.File
): Promise<string | undefined> => {
  if (!IMGUR_CLIENT_ID) {
    return undefined; // Cannot upload without Client ID
  }

  try {
    const formData = new FormData();
    formData.append("image", file.buffer.toString("base64"));

    const response = await axios.post(
      "https://api.imgur.com/3/image",
      formData,
      {
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data && response.data.data && response.data.data.link) {
      return response.data.data.link; // Return the Imgur image URL
    } else {
      console.error(
        "Imgur upload failed: Invalid response format",
        response.data
      );
      return undefined;
    }
  } catch (error) {
    console.error("Error uploading image to Imgur:", error);
    return undefined;
  }
};
