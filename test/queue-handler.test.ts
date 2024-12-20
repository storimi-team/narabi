import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createNarabiApp } from "../src";
import {
  TestEnv,
  TestMessage,
  createTestMessage,
  createTestBatch,
  createTestEnv,
} from "./helpers";

describe("Queue Handler", () => {
  it("should register and execute a handler", async () => {
    const app = createNarabiApp<TestEnv>();
    const mockHandler = vi.fn();
    const env = createTestEnv();

    app.on<TestMessage>("test-queue", mockHandler);

    const message = createTestMessage({ id: "1", data: "test" });
    const batch = createTestBatch("test-queue", [message], env);

    await app.queue(batch, env);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(mockHandler).toHaveBeenCalledWith({
      message,
      env,
    });
  });

  it("should handle different environment types", async () => {
    const app = createNarabiApp<TestEnv>();
    const mockHandler = vi.fn();
    const env = createTestEnv("dev");

    app.on<TestMessage>("test-queue", mockHandler);

    const message = createTestMessage({ id: "1", data: "test" });
    const batch = createTestBatch("test-queue", [message], env);

    await app.queue(batch, env);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    expect(batch.queue).toBe("test-queue-dev");
  });

  it("should handle multiple messages in a batch", async () => {
    const app = createNarabiApp<TestEnv>();
    const mockHandler = vi.fn();
    const env = createTestEnv();

    app.on<TestMessage>("test-queue", mockHandler);

    const messages = [
      createTestMessage({ id: "1", data: "test1" }, "msg1"),
      createTestMessage({ id: "2", data: "test2" }, "msg2"),
    ];
    const batch = createTestBatch("test-queue", messages, env);

    await app.queue(batch, env);

    expect(mockHandler).toHaveBeenCalledTimes(2);
    expect(mockHandler).toHaveBeenCalledWith({
      message: messages[0],
      env,
    });
    expect(mockHandler).toHaveBeenCalledWith({
      message: messages[1],
      env,
    });
  });

  it("should throw error for unregistered queue", async () => {
    const app = createNarabiApp<TestEnv>();
    const env = createTestEnv();

    const message = createTestMessage({ id: "1", data: "test" });
    const batch = createTestBatch("unknown-queue", [message], env);

    await expect(app.queue(batch, env)).rejects.toThrow(
      "No handler registered for queue: unknown-queue"
    );
  });

  it("should handle errors in message processing", async () => {
    const app = createNarabiApp<TestEnv>();
    const errorMessage = "Test error";
    const env = createTestEnv();

    app.on<TestMessage>("test-queue", async () => {
      throw new Error(errorMessage);
    });

    const message = createTestMessage({ id: "1", data: "test" });
    const batch = createTestBatch("test-queue", [message], env);

    await expect(app.queue(batch, env)).rejects.toThrow(
      `Failed to process messages:\nMessage 1: ${errorMessage}`
    );
  });

  it("should handle multiple queue types with different message types", async () => {
    const app = createNarabiApp<TestEnv>();
    const mockHandler1 = vi.fn();
    const mockHandler2 = vi.fn();
    const env = createTestEnv();

    interface Message1 {
      type: "one";
      data: string;
    }
    interface Message2 {
      type: "two";
      count: number;
    }

    app.on<Message1>("queue1", mockHandler1);
    app.on<Message2>("queue2", mockHandler2);

    const batch1 = createTestBatch(
      "queue1",
      [createTestMessage({ type: "one", data: "test" }, "msg1")],
      env
    );

    const batch2 = createTestBatch(
      "queue2",
      [createTestMessage({ type: "two", count: 42 }, "msg2")],
      env
    );

    await app.queue(batch1, env);
    await app.queue(batch2, env);

    expect(mockHandler1).toHaveBeenCalledTimes(1);
    expect(mockHandler2).toHaveBeenCalledTimes(1);
  });

  describe("handler registration", () => {
    let consoleSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "warn");
      consoleSpy.mockClear();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it("should warn when overwriting an existing handler", async () => {
      const app = createNarabiApp<TestEnv>();
      const consoleSpy = vi.spyOn(console, "warn");

      app.on<TestMessage>("test-queue", vi.fn());
      app.on<TestMessage>("test-queue", vi.fn());

      expect(consoleSpy).toHaveBeenCalledWith(
        'Handler for queue "test-queue" is being overwritten'
      );
    });
  });
});
