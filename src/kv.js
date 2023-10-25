/**
 * Key-value storage.
 *
 * Durable key-value storage with TTL support, either in Redis (e.g. in
 * production) or SQLite (e.g. in development).
 *
 * @module kv
 */

import Keyv from "keyv";
import KeyvRedis from "@keyv/redis";
import KeyvSQLite from "@keyv/sqlite";
import path from "path";
import { fileURLToPath } from "url";

import { REDIS } from './redis.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __basedir = path.join(__dirname, "..");


/**
 * Path to a SQLite3 database file for use when Redis is not configured.
 *
 * Defaults to "data/kv.db" in the repository root.
 *
 * @type string
 */
const SQLITE_PATH = path.join(__basedir, "data", "kv.db");


/**
 * Global key-value store.
 *
 * Redis if configured (e.g. REDIS_URL is provided), otherwise SQLite.
 */
const STORE = REDIS
  ? new KeyvRedis(REDIS)
  : new KeyvSQLite(`sqlite://${SQLITE_PATH}`);


/**
 * A namespace (e.g. key prefix) within the global key-value store.
 *
 * @extends Keyv
 */
export class KvNamespace extends Keyv {
  constructor(namespace) {
    super({
      namespace,
      store: STORE,
    });
  }
}
