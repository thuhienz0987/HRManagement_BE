import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_USER_NAME || "dano2vyry",
  api_key: process.env.CLOUDINARY_API_KEY || "152882116935543",
  api_secret:
    process.env.CLOUDINARY_API_SECRET || "M8Bsl2PXcG4umT-zKOTO718RXuI",
});

export default cloudinary;
