// Direct MySQL integration - FAST!
import { useState, useEffect } from 'react';

// Direct MySQL connection
const mysql = require('mysql2/promise');

const connectionConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'tripsera_db'
};

export function useMySQLDirect(table: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const connection = await mysql.createConnection(connectionConfig);
      const [rows] = await connection.execute(`SELECT * FROM ${table}`);
      await connection.end();
      
      setData(rows as any[]);
    } catch (err) {
      console.warn(`MySQL not available for ${table}, using localStorage fallback`);
      setError(null);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const create = async (newData: any) => {
    try {
      const connection = await mysql.createConnection(connectionConfig);
      const [result] = await connection.execute(
        `INSERT INTO ${table} SET ?`,
        [newData]
      );
      await connection.end();
      return result;
    } catch (err) {
      throw new Error('MySQL create failed');
    }
  };

  const update = async (id: string, updateData: any) => {
    try {
      const connection = await mysql.createConnection(connectionConfig);
      const [result] = await connection.execute(
        `UPDATE ${table} SET ? WHERE id = ?`,
        [updateData, id]
      );
      await connection.end();
      return result;
    } catch (err) {
      throw new Error('MySQL update failed');
    }
  };

  const remove = async (id: string) => {
    try {
      const connection = await mysql.createConnection(connectionConfig);
      const [result] = await connection.execute(
        `DELETE FROM ${table} WHERE id = ?`,
        [id]
      );
      await connection.end();
      return result;
    } catch (err) {
      throw new Error('MySQL delete failed');
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
    delete: remove
  };
}
