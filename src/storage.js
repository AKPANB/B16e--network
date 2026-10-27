
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash } from "node:crypto";

const GENESIS_HASH = "0".repeat(64);

function hashRecord(record) {
  return createHash("sha256")
    .update(JSON.stringify(record))
    .digest("hex");
}

export function createAuditStorage(filePath) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new Error("A valid storage path is required.");
  }

  let queue = Promise.resolve();

  async function load() {
    let content;

    try {
      content = await readFile(filePath, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw error;
    }

    if (content.length === 0) return [];

    const lines = content.split("\n");

    if (lines.at(-1) === "") lines.pop();

    const records = [];
    let previousHash = GENESIS_HASH;

    for (const line of lines) {
      let stored;

      try {
        stored = JSON.parse(line);
      } catch {
        throw new Error("Audit file contains invalid JSON.");
      }

      const { entry, previousHash: prev, hash } = stored;

      if (
        !entry ||
        typeof entry !== "object" ||
        prev !== previousHash ||
        typeof hash !== "string"
      ) {
        throw new Error("Audit chain verification failed.");
      }

      const expectedHash = hashRecord({ entry, previousHash: prev });

      if (hash !== expectedHash) {
        throw new Error("Audit record has been altered.");
      }

      records.push(entry);
      previousHash = hash;
    }

    return records;
  }

  async function append(entry) {
    const operation = queue.then(async () => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error("A valid entry is required.");
      }

      const records = await load();

      if (records.some((item) => item.id === entry.id)) {
        throw new Error("Duplicate audit entry ID.");
      }

      const previousHash = records.length
        ? hashRecordFromStoredFile(records)
        : GENESIS_HASH;

      const record = { entry, previousHash };
      const hash = hashRecord(record);

      await mkdir(dirname(filePath), { recursive: true });

      await appendFile(
        filePath,
        JSON.stringify({ ...record, hash }) + "\n",
        { encoding: "utf8", flag: "a" }
      );

      return { saved: true, id: entry.id, hash };
    });

    queue = operation.catch(() => {});
    return operation;
  }

  return Object.freeze({ append, load });
}

function hashRecordFromStoredFile(records) {
  let previousHash = GENESIS_HASH;

  for (const entry of records) {
    previousHash = hashRecord({ entry, previousHash });
  }

  return previousHash;
}
