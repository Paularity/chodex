export interface FileItem {
  id: string;
  name: string;
  fullPath: string;
  fileType: string;
  stamp: string;
  creator: string;
  readOnly: boolean;
  encrypted: boolean;
  size: number;
  tags: string | null;
  hash: string;
}

