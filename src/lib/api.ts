// API Client for MySQL Database Operations
// This will make HTTP requests to your backend API

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async get<T>(table: string, filters?: Record<string, any>): Promise<T[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        params.append(key, value);
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/${table}?${queryString}` : `/${table}`;
    
    return this.request<T[]>(endpoint);
  }

  async getById<T>(table: string, id: string): Promise<T> {
    return this.request<T>(`/${table}/${id}`);
  }

  async create<T>(table: string, data: any): Promise<T> {
    return this.request<T>(`/${table}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update<T>(table: string, id: string, data: any): Promise<T> {
    return this.request<T>(`/${table}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(table: string, id: string): Promise<void> {
    return this.request<void>(`/${table}/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload
  async uploadFile(file: File, bucket: string, path?: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    if (path) {
      formData.append('path', path);
    }
    formData.append('bucket', bucket);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.url;
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Check if API is available
export async function checkApiConnection(): Promise<boolean> {
  try {
    await apiClient.get('health');
    return true;
  } catch (error) {
    console.warn('API connection failed:', error);
    return false;
  }
}
