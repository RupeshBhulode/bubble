const { GoogleGenAI } = require("@google/genai");
const http = require("node:http");

const GEMINI_API_KEY = "PASTE_YOUR_ROTATED_GEMINI_KEY_HERE";
const GEMINI_MODEL = "gemini-3.6-flash";
const ACCESS_KEY = "12345";

async function generateResponse(instruction, userRequest) {
	if (typeof instruction !== "string" || !instruction.trim()) {
		throw new Error("A non-empty instruction is required.");
	}

	if (typeof userRequest !== "string" || !userRequest.trim()) {
		throw new Error("A non-empty request is required.");
	}

	if (GEMINI_API_KEY === "PASTE_YOUR_ROTATED_GEMINI_KEY_HERE") {
		throw new Error("Paste your rotated Gemini key into index.js first.");
	}

	const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
	const response = await ai.models.generateContent({
		model: GEMINI_MODEL,
		contents: [{
			role: "user",
			parts: [{ text: `${instruction}\n\nUser request:\n${userRequest}` }]
		}]
	});

	try {
		return JSON.parse(response.text);
	} catch {
		return { response: response.text };
	}
}

function startServer() {
	const port = Number(process.env.PORT) || 3000;
	const server = http.createServer(async (request, response) => {
		response.setHeader("Access-Control-Allow-Origin", "*");
		response.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Access-Key");
		response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

		if (request.method === "OPTIONS") {
			response.writeHead(204);
			response.end();
			return;
		}

		if (request.method !== "POST" || request.url !== "/generate") {
			sendJson(response, 404, { error: "Use POST /generate." });
			return;
		}

		if (request.headers["x-access-key"] !== ACCESS_KEY) {
			sendJson(response, 401, { error: "Invalid or missing access key." });
			return;
		}

		try {
			const body = await readJsonBody(request);

			if (typeof body.instruction !== "string" || !body.instruction.trim() ||
				typeof body.request !== "string" || !body.request.trim()) {
				sendJson(response, 400, {
					error: "The request body must include non-empty 'instruction' and 'request' strings."
				});
				return;
			}

			sendJson(response, 200, await generateResponse(body.instruction, body.request));
		} catch (error) {
			sendJson(response, error.statusCode || 500, { error: error.message });
		}
	});

	server.listen(port, () => {
		console.log(`Gemini API listening on http://localhost:${port}`);
	});
}

function readJsonBody(request) {
	return new Promise((resolve, reject) => {
		let body = "";
		request.setEncoding("utf8");
		request.on("data", (chunk) => {
			body += chunk;
			if (body.length > 1_000_000) {
				const error = new Error("Request body is too large.");
				error.statusCode = 413;
				reject(error);
				request.destroy();
			}
		});
		request.on("end", () => {
			try {
				resolve(JSON.parse(body));
			} catch {
				const error = new Error("Request body must be valid JSON.");
				error.statusCode = 400;
				reject(error);
			}
		});
		request.on("error", reject);
	});
}

function sendJson(response, statusCode, data) {
	response.writeHead(statusCode, { "Content-Type": "application/json" });
	response.end(JSON.stringify(data));
}

if (require.main === module) {
	if (process.argv[2] === "--server") {
		startServer();
	} else {
		console.log("Start the API with: node index.js --server");
	}
}

module.exports = { generateResponse, startServer };
