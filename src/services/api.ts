import axios from 'axios';

const API_BASE_URL = 'https://api.booksmartai.app/api';

export interface Document {
  id: number;
  filename: string;
  storedFilename?: string;
  date: string;
  status: 'processing' | 'completed';
  bookmarks: Bookmark[];
}

export interface Bookmark {
  page: number;
  label: string;
  category: 'medical_radiology' | 'photos' | 'estimate' | 'other';
}

export const api = {
  // Upload a file to the backend
  uploadFile: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.document;
  },

  // Process a document and get bookmarks
  processDocument: async (documentId: number): Promise<{ bookmarks: Bookmark[] }> => {
    const response = await axios.post(`${API_BASE_URL}/process/${documentId}`);
    return response.data;
  },

    getAllDocuments: async (): Promise<Document[]> => {
    const response = await axios.get(`${API_BASE_URL}/documents`);
    return response.data;
  },

    getDownloadUrl: async (documentId: number): Promise<string> => {
    const response = await axios.get(`${API_BASE_URL}/download/${documentId}`);
    return response.data.downloadUrl;
  },

};