const clientId = process.env.GOOGLE_CLIENT_ID!;
if (!clientId) throw new Error("Missing GOOGLE_CLIENT_ID env var");

const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
if (!clientSecret) throw new Error("Missing GOOGLE_CLIENT_SECRET env var");

export const SCOPE = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.app.created",
];

export { clientId as googleClientId, clientSecret as googleClientSecret };

