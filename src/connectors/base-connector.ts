

export interface BaseConnector<T> {
  _conn: T;
  getConnection(): T;
}

