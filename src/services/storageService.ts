import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

/**
 * Uploads a file (e.g. PDF) to Firebase Storage and returns its download URL.
 * @param file The file to upload
 * @param userId The ID of the user uploading the file (used for path organization)
 * @param folder The folder name (e.g. 'cv', 'portfolio')
 * @returns The public download URL of the uploaded file
 */
export async function uploadFileToStorage(file: File, userId: string, folder: string): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  try {
    // Create a unique file name to prevent overwriting
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `users/${userId}/${folder}/${timestamp}_${safeFileName}`;
    
    const storageRef = ref(storage, path);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    
    return downloadUrl;
  } catch (error) {
    console.error(`Error uploading file to ${folder}:`, error);
    throw new Error(`Failed to upload ${folder}. Please try again.`);
  }
}
