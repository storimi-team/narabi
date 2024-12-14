import { createQueueHandler } from "narabi";

// Define your environment type
interface Env {
  ENV_TYPE: string;
  DB: D1Database;
  BUCKET: R2Bucket;
  API_KEY: string;
}

// Define your message payload types
interface UserCreatedEvent {
  userId: string;
  email: string;
  timestamp: number;
}

interface EmailNotificationEvent {
  to: string;
  subject: string;
  body: string;
}

// Create queue handler with your environment type
const queue = createQueueHandler<Env>();

// Register handler for user creation events
queue.on<UserCreatedEvent>("user-created", async (c) => {
  const { userId, email } = c.message.body;
  const { DB } = c.env;

  // Example: Store user in database
  await DB.prepare("INSERT INTO users (id, email) VALUES (?, ?)")
    .bind(userId, email)
    .run();
});

// Register handler for email notifications
queue.on<EmailNotificationEvent>("send-email", async (c) => {
  const { to, subject, body } = c.message.body;
  const { API_KEY } = c.env;

  // Example: Send email using API_KEY
  await fetch("https://api.email-service.com/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, body }),
  });
});

// Export the worker
export default {
  // Your fetch handler if you have one
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return new Response("Hello World!");
  },

  // Queue handler
  queue: queue.handle,
};

// Example of how to publish messages (in your API routes)
/*
await env.QUEUE.send({
  body: {
    userId: '123',
    email: 'user@example.com',
    timestamp: Date.now(),
  },
  queue: `user-created-${env.ENV_TYPE}`,
});
*/
