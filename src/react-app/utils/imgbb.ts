// imgBB API utility for uploading images
const IMGBB_API_KEY = '0d73bc519daf917d8ff4475634d6be04';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBUploadResponse {
    data: {
        id: string;
        title: string;
        url_viewer: string;
        url: string;
        display_url: string;
        width: string;
        height: string;
        size: string;
        time: string;
        expiration: string;
        image: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        thumb: {
            filename: string;
            name: string;
            mime: string;
            extension: string;
            url: string;
        };
        delete_url: string;
    };
    success: boolean;
    status: number;
}

/**
 * Upload an image to imgBB
 * @param file - The image file to upload
 * @param name - Optional name for the image
 * @returns Promise with the upload response containing image URLs
 */
export async function uploadImageToImgBB(
    file: File,
    name?: string
): Promise<ImgBBUploadResponse> {
    try {
        // Convert file to base64
        const base64 = await fileToBase64(file);

        // Create form data
        const formData = new FormData();
        formData.append('image', base64.split(',')[1]); // Remove data:image/...;base64, prefix
        if (name) {
            formData.append('name', name);
        }

        // Upload to imgBB
        const response = await fetch(`${IMGBB_API_URL}?key=${IMGBB_API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data: ImgBBUploadResponse = await response.json();

        if (!data.success) {
            throw new Error('Upload failed: API returned unsuccessful response');
        }

        return data;
    } catch (error) {
        console.error('Error uploading image to imgBB:', error);
        throw error;
    }
}

/**
 * Convert a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 32MB as per imgBB limit)
 * @returns true if valid, throws error otherwise
 */
export function validateImageFile(file: File, maxSizeMB: number = 32): boolean {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WEBP');
    }

    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert to bytes
    if (file.size > maxSize) {
        throw new Error(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`);
    }

    return true;
}
