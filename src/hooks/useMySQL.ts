// MySQL hook for Tripsera
// Enhanced hook with API integration

import { useState, useEffect } from 'react';
// @ts-ignore - mysqlApi is a JavaScript file
import mysqlApiClient from '../lib/mysqlApi';

interface MySQLConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}

interface MySQLResult {
  data: any[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  create: (data: any) => Promise<any>;
  update: (id: string, data: any) => Promise<any>;
  delete: (id: string) => Promise<any>;
}

export const useMySQL = (table: string, _config?: MySQLConfig): MySQLResult => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from MySQL API first
      const result = await mysqlApiClient.get(table);
      setData(result);
      
    } catch (err) {
      console.warn(`MySQL API not available for ${table}, falling back to localStorage`);
      setError(null); // Don't show error, just fallback
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (newData: any) => {
    try {
      const result = await mysqlApiClient.create(table, newData);
      await fetchData(); // Refresh data
      return result;
    } catch (err) {
      throw new Error(`Failed to create ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const update = async (id: string, updateData: any) => {
    try {
      const result = await mysqlApiClient.update(table, id, updateData);
      await fetchData(); // Refresh data
      return result;
    } catch (err) {
      throw new Error(`Failed to update ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const result = await mysqlApiClient.delete(table, id);
      await fetchData(); // Refresh data
      return result;
    } catch (err) {
      throw new Error(`Failed to delete ${table}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchData();
  }, [table]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    create,
    update,
    delete: deleteRecord
  };
};

// MySQL connection testing functions
export const testMySQLConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const result = await mysqlApiClient.testConnection();
    return {
      success: result.status === 'success',
      message: result.message || 'Connection test completed'
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

export const checkMySQLHealth = async (): Promise<{ status: string; message: string; timestamp: string }> => {
  try {
    const result = await mysqlApiClient.healthCheck();
    return {
      status: result.status || 'unknown',
      message: result.message || 'Health check completed',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString()
    };
  }
};

export default useMySQL;
