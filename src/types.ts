import type {
  MessageBatch as CloudflareMessageBatch,
  Message as CloudflareMessage,
} from "@cloudflare/workers-types";

/**
 * Base environment interface that all queue environments must extend
 */
export interface BaseEnv {
  ENV_TYPE: string;
  [key: string]: unknown;
}

/**
 * Re-export Cloudflare's Message type with generic support
 */
export interface Message<T = unknown> extends Omit<CloudflareMessage, "body"> {
  body: T;
}

/**
 * Re-export Cloudflare's MessageBatch type
 */
export type MessageBatch = CloudflareMessageBatch;

/**
 * Context passed to queue handlers
 */
export interface QueueContext<T, E extends BaseEnv> {
  message: Message<T>;
  env: E;
}

/**
 * Queue handler function type
 */
export type QueueHandler<T, E extends BaseEnv> = (
  c: QueueContext<T, E>
) => Promise<void>;

/**
 * Queue handler instance type
 */
export interface QueueHandlerInstance<E extends BaseEnv> {
  on: <T>(queueName: string, handler: QueueHandler<T, E>) => void;
  queue: (batch: MessageBatch, env: E) => Promise<void>;
}
