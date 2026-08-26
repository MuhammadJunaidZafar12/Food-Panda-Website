import cloudinary from "../config/cloudinary.js";

export const deleteImageFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        // Example URL: http://res.cloudinary.com/cloud_name/image/upload/v1234567/FoodPanda/filename.jpg
        // We want to extract 'FoodPanda/filename'
        const parts = imageUrl.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex !== -1 && parts.length > uploadIndex + 2) {
            const folderAndFile = parts.slice(uploadIndex + 2).join('/');
            const publicId = folderAndFile.split('.')[0];
            await cloudinary.uploader.destroy(publicId);
            console.log(`Successfully deleted image with public ID: ${publicId}`);
        }
    } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
    }
};
