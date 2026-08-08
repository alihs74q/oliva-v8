import session from "express-session";
import { pool } from "@workspace/db";

type Callback<T = void> = (error?: Error | null, result?: T) => void;

/**
 * A small PostgreSQL-backed express-session store.
 *
 * Keeping sessions in the same database as the CMS makes admin sessions
 * survive API restarts and work across autoscaled API instances.
 */
export class PostgresSessionStore extends session.Store {
  private readonly defaultTtlMs = 7 * 24 * 60 * 60 * 1000;

  get(sid: string, callback: Callback<session.SessionData | null>): void {
    void pool.query<{ sess: session.SessionData; expires_at: Date }>(
      `SELECT sess, expires_at FROM user_sessions WHERE sid = $1`,
      [sid],
    ).then(async ({ rows }) => {
      const row = rows[0];
      if (!row) {
        callback(null, null);
        return;
      }
      if (row.expires_at.getTime() <= Date.now()) {
        await pool.query(`DELETE FROM user_sessions WHERE sid = $1`, [sid]);
        callback(null, null);
        return;
      }
      callback(null, row.sess);
    }).catch((error: unknown) => callback(error instanceof Error ? error : new Error(String(error))));
  }

  set(sid: string, sess: session.SessionData, callback: Callback): void {
    const expiresAt = this.expiresAt(sess);
    void pool.query(
      `INSERT INTO user_sessions (sid, sess, expires_at)
       VALUES ($1, $2::jsonb, $3)
       ON CONFLICT (sid) DO UPDATE
       SET sess = EXCLUDED.sess, expires_at = EXCLUDED.expires_at`,
      [sid, JSON.stringify(sess), expiresAt],
    ).then(() => callback(null)).catch((error: unknown) => callback(error instanceof Error ? error : new Error(String(error))));
  }

  destroy(sid: string, callback: Callback): void {
    void pool.query(`DELETE FROM user_sessions WHERE sid = $1`, [sid])
      .then(() => callback(null))
      .catch((error: unknown) => callback(error instanceof Error ? error : new Error(String(error))));
  }

  touch(sid: string, sess: session.SessionData, callback: Callback): void {
    void pool.query(
      `UPDATE user_sessions SET sess = $2::jsonb, expires_at = $3 WHERE sid = $1`,
      [sid, JSON.stringify(sess), this.expiresAt(sess)],
    ).then(() => callback(null)).catch((error: unknown) => callback(error instanceof Error ? error : new Error(String(error))));
  }

  clear(callback: Callback): void {
    void pool.query(`DELETE FROM user_sessions`)
      .then(() => callback(null))
      .catch((error: unknown) => callback(error instanceof Error ? error : new Error(String(error))));
  }

  length(callback: Callback<number>): void {
    void pool.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM user_sessions`)
      .then(({ rows }) => callback(null, Number(rows[0]?.count ?? 0)))
      .catch((error: unknown) => callback(error instanceof Error ? error : new Error(String(error))));
  }

  private expiresAt(sess: session.SessionData): Date {
    const cookie = sess.cookie as session.Cookie & { expires?: string | Date; maxAge?: number };
    if (cookie.expires) {
      const date = new Date(cookie.expires);
      if (!Number.isNaN(date.getTime())) return date;
    }
    if (typeof cookie.maxAge === "number") return new Date(Date.now() + cookie.maxAge);
    return new Date(Date.now() + this.defaultTtlMs);
  }
}