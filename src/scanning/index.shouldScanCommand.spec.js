import assert from "node:assert/strict";
import { describe, it, mock } from "node:test";

describe("shouldScanCommand", async () => {
  const isSupportedCommandMock = mock.fn(() => undefined);

  mock.module("../packagemanager/currentPackageManager.js", {
    namedExports: {
      getPackageManager: () => {
        return {
          isSupportedCommand: isSupportedCommandMock,
          getDependencyUpdatesForCommand: () => [],
        };
      },
    },
  });

  const { shouldScanCommand } = await import("./index.js");

  it("should return false if the argument is an empty array", () => {
    const result = shouldScanCommand([]);

    assert.strictEqual(result, false);
  });

  it("should return false if the argument is undefined", () => {
    const result = shouldScanCommand(undefined);

    assert.strictEqual(result, false);
  });

  it("should return true if the package manager supports the command", () => {
    isSupportedCommandMock.mock.mockImplementation(() => true);

    const result = shouldScanCommand(["install", "lodash"]);

    assert.strictEqual(result, true);
  });

  it("should return false if the package manager does not support the command", () => {
    isSupportedCommandMock.mock.mockImplementation(() => false);

    const result = shouldScanCommand(["unknown", "command"]);

    assert.strictEqual(result, false);
  });
});
