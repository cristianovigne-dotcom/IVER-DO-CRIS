export const API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
export const ROOT_FOLDER_ID = import.meta.env.VITE_GOOGLE_DRIVE_ROOT_FOLDER_ID;

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
}

export interface TabData {
  id: string;
  label: string;
  photos: DriveFile[];
}

async function fetchAllFromFolder(folderId: string): Promise<DriveFile[]> {
  let allFiles: DriveFile[] = [];
  let nextPageToken: string | undefined = undefined;

  do {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=nextPageToken,files(id,name,mimeType,thumbnailLink)&pageSize=1000${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.files) {
      allFiles = [...allFiles, ...data.files];
    }
    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return allFiles;
}

export async function fetchDriveContents(): Promise<TabData[]> {
  try {
    const rootFiles = await fetchAllFromFolder(ROOT_FOLDER_ID);
    
    const folders = rootFiles.filter((f: DriveFile) => f.mimeType === 'application/vnd.google-apps.folder');
    const standalonePhotos = rootFiles.filter((f: DriveFile) => f.mimeType.startsWith('image/'));

    let tabs: TabData[] = [];

    // If there are subfolders, treat them as tabs
    for (const folder of folders) {
      const photos = await fetchAllFromFolder(folder.id);
      const imageFiles = photos.filter((f: DriveFile) => f.mimeType.startsWith('image/'));
      
      tabs.push({
        id: folder.id,
        label: folder.name,
        photos: imageFiles
      });
    }

    // If there are standalone photos in the root, put them in a "Geral" tab
    if (standalonePhotos.length > 0) {
      tabs.push({
        id: 'geral',
        label: folders.length > 0 ? 'Outros' : 'Fotos',
        photos: standalonePhotos
      });
    }

    if (tabs.length === 0) {
        tabs = [{
            id: 'empty',
            label: 'Sem Fotos',
            photos: []
        }];
    }

    tabs.sort((a, b) => a.label.localeCompare(b.label));
    return tabs;
  } catch (error) {
    console.error('Error fetching from Google Drive', error);
    return [];
  }
}

export type ImageSize = 'thumbnail' | 'medium' | 'large' | 'original';

export function getImageUrl(file: DriveFile, size: ImageSize = 'large') {
  const sizeMap: Record<ImageSize, string> = {
    thumbnail: 's400',
    medium: 's800',
    large: 's1600',
    original: 's0' // s0 returns the original resolution
  };

  const sz = sizeMap[size];

  if (file.thumbnailLink) {
    // googleusercontent.com links use =sXXX suffix
    return file.thumbnailLink.replace(/=s\d+/, `=${sz}`);
  }
  
  // fallback for drive.google.com/thumbnail links
  const width = sz === 's0' ? 0 : parseInt(sz.substring(1));
  return `https://drive.google.com/thumbnail?id=${file.id}${width ? `&sz=w${width}` : ''}`;
}
