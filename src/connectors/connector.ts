

export interface Connector<T> {
  conn: T;
  getConnection(): T;
}

