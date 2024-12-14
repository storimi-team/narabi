import { Message, MessageBatch } from "../src";
import { QueueRetryOptions } from "@cloudflare/workers-types";

export interface TestEnv {
  ENV_TYPE: string;
  TEST_KEY: string;
  [key: string]: string;
}

export interface TestMessage {
  id: string;
  data: string;
}

export function createTestMessage<T = TestMessage>(
  body: T,
  id: string = "msg1"
): Message<T> {
  return {
    body,
    id,
    timestamp: new Date(),
    attempts: 0,
    retry: function (options?: QueueRetryOptions): void {
      throw new Error("Function not implemented.");
    },
    ack: function (): void {
      throw new Error("Function not implemented.");
    },
  };
}

export function createTestBatch<T = TestMessage>(
  queueName: string,
  messages: Message<T>[],
  env: TestEnv
): MessageBatch {
  return {
    queue: `${queueName}-${env.ENV_TYPE}`,
    messages,
    retryAll: function (options?: QueueRetryOptions): void {
      throw new Error("Function not implemented.");
    },
    ackAll: function (): void {
      throw new Error("Function not implemented.");
    },
  };
}

export function createTestEnv(envType: string = "prod"): TestEnv {
  return {
    ENV_TYPE: envType,
    TEST_KEY: "test-key",
  };
}
