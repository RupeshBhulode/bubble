# Gemini API Gateway

A small one-file Node.js API that forwards a caller-provided instruction and request to Gemini.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY`.

3. Start the API:

   ```bash
   npm start -- --server
   ```

   Or run without `--server` to use the interactive CLI:

   ```bash
   npm start
   ```

The API key and model are read from the server's environment. The instruction is supplied by each caller.

## API Usage

Start the HTTP endpoint:

```bash
npm start -- --server
```

Send a `POST` request to `/generate` with JSON:

```json
{
   "instruction": "Return only valid JSON with Visa and Mastercard counts.",
   "request": "Create 2 Visa and 3 Mastercard cases."
}
```

Include the access key in the request header:

```http
x-access-key: 12345
```

If Gemini returns JSON, the API returns that JSON directly:

```json
{
   "Visa": 2,
   "Mastercard": 3
}
```

The default address is `http://localhost:3000/generate`. Set `PORT` in `.env` to use another port. The default access key is `12345`; set `ACCESS_KEY` in `.env` to change it. Requests without the correct `x-access-key` header receive `401 Unauthorized`.
