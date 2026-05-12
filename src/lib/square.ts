import "server-only";
import { SquareClient, SquareEnvironment } from "square";

const accessToken = process.env.SQUARE_ACCESS_TOKEN;
const environment =
  process.env.SQUARE_ENVIRONMENT === "production"
    ? SquareEnvironment.Production
    : SquareEnvironment.Sandbox;

let _client: SquareClient | null = null;

export function getSquareClient(): SquareClient {
  if (!accessToken) {
    throw new Error(
      "SQUARE_ACCESS_TOKEN is not set. Configure it in .env.local before using checkout.",
    );
  }
  if (!_client) {
    _client = new SquareClient({ token: accessToken, environment });
  }
  return _client;
}

export const squareLocationId = process.env.SQUARE_LOCATION_ID ?? "";
