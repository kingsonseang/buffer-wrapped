import { BufferAuthClient } from "./auth";

export const bufferAuthClient = new BufferAuthClient({
  client_id: process.env.BUFFER_CLIENT_ID!,
  client_secret: process.env.BUFFER_CLIENT_SECRET,
  redirect_uri: process.env.BUFFER_REDIRECT_URI!,
});
