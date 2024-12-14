# Narabi (並び)

Elegant queue handling for Cloudflare Workers.

## Installation

```bash
npm install narabi
```

## Usage

```typescript
import { createNarabiApp } from "narabi";

interface MyEnv {
  ENV_TYPE: string;
  MY_SECRET: string;
}

// Create a queue handler with your environment type
const app = createNarabiApp<MyEnv>();

// Register handlers for different queues
queue.on<{ userId: string }>("process-user", async (c) => {
  const { body } = c.message;
  const { MY_SECRET } = c.env;
  // Handle message
});

// Export your worker
export default {
  queue: app.queue,
};
```

## Features

- 🎯 Type-safe queue handling
- 🌊 Simple, elegant API inspired by Hono
- 🔒 Environment and binding management
- 📦 Zero dependencies

## Documentation

[Full documentation](https://github.com/storimi-team/narabi#documentation)

## License

MIT License - see LICENSE file
