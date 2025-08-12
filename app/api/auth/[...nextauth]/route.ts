import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Force Node.js runtime for auth routes to support Mongoose
export const runtime = 'nodejs';
