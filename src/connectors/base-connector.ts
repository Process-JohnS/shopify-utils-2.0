

export interface BaseConnector<T> {
  conn: T;
  getConnection(): T;
}

