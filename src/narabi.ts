import type {
  BaseEnv,
  QueueHandler,
  QueueHandlerInstance,
  MessageBatch,
} from "./types";

/**
 * Creates a new narabi app
 */
export function createNarabiApp<E extends BaseEnv>(): QueueHandlerInstance<E> {
  type HandlerMap = {
    [K: string]: QueueHandler<unknown, E>;
  };
  const handlers: HandlerMap = {};

  return {
    on<T>(queueName: string, handler: QueueHandler<T, E>) {
      if (handlers[queueName]) {
        console.warn(`Handler for queue "${queueName}" is being overwritten`);
      }
      handlers[queueName] = handler as QueueHandler<unknown, E>;
    },

    /**
     * Handle incoming message batch
     */
    async queue(batch: MessageBatch, env: E) {
      const queueBase = batch.queue.replace(`-${env.ENV_TYPE}`, "");
      const handler = handlers[queueBase];

      if (!handler) {
        throw new Error(`No handler registered for queue: ${queueBase}`);
      }

      const errors: Error[] = [];

      // Process messages sequentially
      for (const message of batch.messages) {
        try {
          await handler({
            message,
            env,
          });
        } catch (error) {
          // Collect errors but continue processing other messages
          errors.push(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }

      // If any messages failed, throw with all errors
      if (errors.length > 0) {
        const errorMessage = errors
          .map((error, index) => `Message ${index + 1}: ${error.message}`)
          .join("\n");
        throw new Error(`Failed to process messages:\n${errorMessage}`);
      }
    },
  };
}
