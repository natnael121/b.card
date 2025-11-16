const IMGBB_API_KEY = 'f6f560dbdcf0c91aea57b3cd55097799';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

export interface ImgBBResponse {
  data: {
    id: string;
    url: string;
    display_url: string;
    thumb: {
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

export async function uploadImageToImgBB(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to ImgBB');
    }

    const result: ImgBBResponse = await response.json();

    if (!result.success) {
      throw new Error('ImgBB upload failed');
    }

    return result.data.display_url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

export async function uploadImageFromURL(imageUrl: string): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('image', imageUrl);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch(IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to ImgBB');
    }

    const result: ImgBBResponse = await response.json();

    if (!result.success) {
      throw new Error('ImgBB upload failed');
    }

    return result.data.display_url;
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}
