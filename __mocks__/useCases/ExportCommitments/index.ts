import { createServer } from "http";
import { commitments } from "./commitments";

function respondJSON(data, response) {
  return response.end(JSON.stringify(data));
}

async function handler(request, response) {
  const { method } = request;

  if (method === "GET") {
    return respondJSON(commitments, response);
  }
}

export default createServer(handler);
