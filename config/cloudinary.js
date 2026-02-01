import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload file buffer to Cloudinary
export async function uploadToCloudinary(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            folder: 'madame-modas/produtos',
            resource_type: 'auto', // auto-detect image or video
            ...options
        };

        const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
}

// Delete file from Cloudinary
export async function deleteFromCloudinary(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId);
        return true;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
}

export default cloudinary;
