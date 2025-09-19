// MySQL API Client
const API_BASE_URL = 'http://localhost:3001/api';

class MySQLApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic method to make HTTP requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
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
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET all records from a table
  async get(table, filters = {}) {
    try {
      const data = await this.request(`/${table}`);
      
      // Apply filters if provided
      if (Object.keys(filters).length > 0) {
        return data.filter(item => {
          return Object.entries(filters).every(([key, value]) => {
            if (typeof value === 'string') {
              return item[key]?.toLowerCase().includes(value.toLowerCase());
            }
            return item[key] === value;
          });
        });
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }
  }

  // GET single record by ID
  async getById(table, id) {
    try {
      return await this.request(`/${table}/${id}`);
    } catch (error) {
      console.error(`Error fetching ${table} with id ${id}:`, error);
      return null;
    }
  }

  // POST - Create new record
  async create(table, data) {
    try {
      const result = await this.request(`/${table}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return result;
    } catch (error) {
      console.error(`Error creating ${table}:`, error);
      throw error;
    }
  }

  // PUT - Update record
  async update(table, id, data) {
    try {
      const result = await this.request(`/${table}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return result;
    } catch (error) {
      console.error(`Error updating ${table} with id ${id}:`, error);
      throw error;
    }
  }

  // DELETE - Delete record
  async delete(table, id) {
    try {
      const result = await this.request(`/${table}/${id}`, {
        method: 'DELETE',
      });
      return result;
    } catch (error) {
      console.error(`Error deleting ${table} with id ${id}:`, error);
      throw error;
    }
  }

  // Upload file
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // Test database connection
  async testConnection() {
    try {
      const result = await this.request('/test-connection');
      return result;
    } catch (error) {
      console.error('Error testing connection:', error);
      return { status: 'error', message: 'Connection failed' };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.request('/health');
      return result;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', message: 'Health check failed' };
    }
  }
}

// Create and export a singleton instance
const mysqlApiClient = new MySQLApiClient();
export default mysqlApiClient;

// Export the class for testing
export { MySQLApiClient };
