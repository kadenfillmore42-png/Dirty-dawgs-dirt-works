const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { URL } = require("url");

const HOST = process.env.HOST || "0.0.0.0";
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const SUBMISSIONS_DIR = path.join(ROOT, "submissions");
const INDEX_FILE = path.join(SUBMISSIONS_DIR, "quotes.json");
const HOME_PAGE = "index.html";

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

async function ensureStorage() {
  await fsp.mkdir(SUBMISSIONS_DIR, { recursive: true });

  try {
    await fsp.access(INDEX_FILE);
  } catch {
    await fsp.writeFile(INDEX_FILE, "[]\n", "utf8");
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify(payload, null, 2));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  res.end(message);
}

function sanitizeFilename(filename) {
  const cleaned = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned || "upload.bin";
}

function getMultipartBoundary(contentType) {
  const match = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? (match[1] || match[2]) : null;
}

function splitBuffer(buffer, separator) {
  const chunks = [];
  let offset = 0;

  while (offset <= buffer.length) {
    const index = buffer.indexOf(separator, offset);
    if (index === -1) {
      chunks.push(buffer.slice(offset));
      break;
    }

    chunks.push(buffer.slice(offset, index));
    offset = index + separator.length;
  }

  return chunks;
}

function parseHeaders(headerText) {
  const headers = {};

  for (const line of headerText.split("\r\n")) {
    const index = line.indexOf(":");
    if (index === -1) {
      continue;
    }

    const key = line.slice(0, index).trim().toLowerCase();
    const value = line.slice(index + 1).trim();
    headers[key] = value;
  }

  return headers;
}

function parseDisposition(headerValue = "") {
  const params = {};

  for (const part of headerValue.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawValue.length) {
      continue;
    }

    params[rawKey.trim().toLowerCase()] = rawValue
      .join("=")
      .trim()
      .replace(/^"|"$/g, "");
  }

  return params;
}

function parseMultipart(bodyBuffer, boundary) {
  const marker = Buffer.from(`--${boundary}`);
  const headerMarker = Buffer.from("\r\n\r\n");
  const parts = splitBuffer(bodyBuffer, marker);
  const fields = {};
  const files = [];

  for (const rawPart of parts.slice(1)) {
    let part = rawPart;

    if (!part.length) {
      continue;
    }

    if (part.equals(Buffer.from("--\r\n")) || part.equals(Buffer.from("--"))) {
      continue;
    }

    if (part.slice(0, 2).equals(Buffer.from("\r\n"))) {
      part = part.slice(2);
    }

    if (part.slice(-2).equals(Buffer.from("\r\n"))) {
      part = part.slice(0, -2);
    }

    if (part.slice(-2).equals(Buffer.from("--"))) {
      part = part.slice(0, -2);
    }

    const headerEnd = part.indexOf(headerMarker);
    if (headerEnd === -1) {
      continue;
    }

    const headers = parseHeaders(part.slice(0, headerEnd).toString("utf8"));
    const disposition = parseDisposition(headers["content-disposition"]);
    const name = disposition.name;
    const filename = disposition.filename;
    const value = part.slice(headerEnd + headerMarker.length);

    if (!name) {
      continue;
    }

    if (filename) {
      if (value.length) {
        files.push({
          fieldName: name,
          filename,
          contentType: headers["content-type"] || "application/octet-stream",
          content: value,
        });
      }
      continue;
    }

    fields[name] = value.toString("utf8");
  }

  return { fields, files };
}

async function saveQuoteSubmission(fields, files) {
  const submissionId = new Date().toISOString().replace(/[:.]/g, "-");
  const submissionDir = path.join(SUBMISSIONS_DIR, submissionId);
  const uploadsDir = path.join(submissionDir, "photos");

  await fsp.mkdir(uploadsDir, { recursive: true });

  const savedFiles = [];

  for (const file of files) {
    const safeName = sanitizeFilename(file.filename);
    const targetPath = path.join(uploadsDir, safeName);
    await fsp.writeFile(targetPath, file.content);
    savedFiles.push({
      originalName: file.filename,
      savedAs: safeName,
      contentType: file.contentType,
      size: file.content.length,
      relativePath: path.relative(ROOT, targetPath),
    });
  }

  const record = {
    id: submissionId,
    receivedAt: new Date().toISOString(),
    fields,
    files: savedFiles,
  };

  await fsp.writeFile(
    path.join(submissionDir, "submission.json"),
    JSON.stringify(record, null, 2),
    "utf8",
  );

  const existing = JSON.parse(await fsp.readFile(INDEX_FILE, "utf8"));
  existing.push(record);
  await fsp.writeFile(INDEX_FILE, JSON.stringify(existing, null, 2), "utf8");

  return record;
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = requestUrl.pathname === "/" ? `/${HOME_PAGE}` : requestUrl.pathname;
  const normalized = path.normalize(path.join(ROOT, pathname));

  if (!normalized.startsWith(ROOT)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  try {
    const stat = await fsp.stat(normalized);
    if (stat.isDirectory()) {
      sendText(res, 403, "Forbidden");
      return;
    }

    const ext = path.extname(normalized).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(normalized).pipe(res);
  } catch {
    sendText(res, 404, "Not found");
  }
}

function collectRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    const limit = 25 * 1024 * 1024;

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > limit) {
        reject(new Error("Upload is too large. Keep requests under 25 MB."));
        req.destroy();
        return;
      }

      chunks.push(chunk);
    });

    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function handleQuoteRequest(req, res) {
  const contentType = req.headers["content-type"] || "";
  const boundary = getMultipartBoundary(contentType);

  if (!boundary) {
    sendJson(res, 400, { error: "Expected a multipart form submission." });
    return;
  }

  const bodyBuffer = await collectRequestBody(req);
  const { fields, files } = parseMultipart(bodyBuffer, boundary);

  const requiredFields = [
    "Full Name",
    "Phone Number",
    "Email Address",
    "Service Needed",
    "Project Address",
    "Project Details",
  ];

  for (const fieldName of requiredFields) {
    if (!fields[fieldName] || !fields[fieldName].trim()) {
      sendJson(res, 400, { error: `${fieldName} is required.` });
      return;
    }
  }

  if (!files.length) {
    sendJson(res, 400, { error: "At least one project photo is required." });
    return;
  }

  const record = await saveQuoteSubmission(fields, files);
  sendJson(res, 200, {
    ok: true,
    message: "Quote request saved successfully.",
    submissionId: record.id,
    photoCount: record.files.length,
  });
}

async function start() {
  await ensureStorage();

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end();
        return;
      }

      if (req.method === "POST" && req.url === "/api/quote") {
        await handleQuoteRequest(req, res);
        return;
      }

      if (req.method === "GET") {
        await serveStatic(req, res);
        return;
      }

      sendText(res, 405, "Method not allowed");
    } catch (error) {
      console.error(error);
      sendJson(res, 500, { error: error.message || "Internal server error." });
    }
  });

  server.listen(PORT, HOST, () => {
    console.log(`Dirty Dawgs site running at http://${HOST}:${PORT}`);
    console.log(`Quote submissions are saved in ${SUBMISSIONS_DIR}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
