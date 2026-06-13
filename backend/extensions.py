"""Shared application extensions.

The workspace does not have Flask-SQLAlchemy or SQLAlchemy installed, so this
module provides a tiny psycopg2-based wrapper with the small surface area that
the priority routes need: `engine.connect()` and `engine.begin()`.
"""

from __future__ import annotations

import psycopg2
import psycopg2.extras


class QueryResult:
    def __init__(self, rows=None) -> None:
        self._rows = rows or []

    def mappings(self):
        return self

    def all(self):
        return self._rows

    def first(self):
        return self._rows[0] if self._rows else None


class ConnectionContext:
    def __init__(self, connection, pool=None, commit_on_exit: bool = False) -> None:
        self._connection = connection
        self._pool = pool
        self._commit_on_exit = commit_on_exit

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        try:
            if exc_type is None and self._commit_on_exit:
                self._connection.commit()
            elif exc_type is not None:
                self._connection.rollback()
        finally:
            if self._pool is not None:
                self._pool.putconn(self._connection)
            else:
                self._connection.close()

    def execute(self, query, params=None):
        import re
        sql = str(query)
        # Convert SQLAlchemy-style named parameters (:param) to psycopg2-style (%(param)s)
        sql = re.sub(r':([a-zA-Z_][a-zA-Z0-9_]*)', r'%(\1)s', sql)
        with self._connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cursor:
            cursor.execute(sql, params or {})
            if cursor.description is None:
                return QueryResult([])
            rows = cursor.fetchall()
        return QueryResult([dict(row) for row in rows])


class DatabaseEngine:
    def __init__(self, database_uri: str) -> None:
        self.database_uri = database_uri
        import psycopg2.pool
        # Initialize thread-safe connection pool
        self.pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=20,
            dsn=database_uri,
            sslmode="require"
        )

    def connect(self):
        connection = self.pool.getconn()
        return ConnectionContext(connection, pool=self.pool, commit_on_exit=False)

    def begin(self):
        connection = self.pool.getconn()
        return ConnectionContext(connection, pool=self.pool, commit_on_exit=True)

    def close(self):
        self.pool.closeall()


class Database:
    def __init__(self) -> None:
        self.engine = None
        self.database_uri = None

    def init_app(self, app) -> None:
        database_uri = app.config.get("SQLALCHEMY_DATABASE_URI")
        if not database_uri:
            raise RuntimeError("SQLALCHEMY_DATABASE_URI is not configured")

        self.database_uri = database_uri
        self.engine = DatabaseEngine(database_uri)


db = Database()