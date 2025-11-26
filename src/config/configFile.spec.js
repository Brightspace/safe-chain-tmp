import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";

describe("getScanTimeout", () => {
  let originalEnv;
  let fsMock;
  let getScanTimeout;

  beforeEach(async () => {
    // Save original environment
    originalEnv = process.env.AIKIDO_SCAN_TIMEOUT_MS;

    // Mock fs module
    fsMock = {
      existsSync: mock.fn(() => false),
      readFileSync: mock.fn(() => "{}"),
      writeFileSync: mock.fn(),
      mkdirSync: mock.fn(),
    };

    mock.module("fs", {
      namedExports: fsMock,
    });

    // Re-import the module to get the mocked version
    const configFileModule = await import(
      `./configFile.js?update=${Date.now()}`
    );
    getScanTimeout = configFileModule.getScanTimeout;
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.AIKIDO_SCAN_TIMEOUT_MS = originalEnv;
    } else {
      delete process.env.AIKIDO_SCAN_TIMEOUT_MS;
    }

    // Reset all mocks
    mock.restoreAll();
  });

  it("should return default timeout of 10000ms when no config or env var is set", () => {
    delete process.env.AIKIDO_SCAN_TIMEOUT_MS;
    // Mock: config file doesn't exist
    fsMock.existsSync.mock.mockImplementation(() => false);

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 10000);
  });

  it("should return timeout from config file when set", () => {
    delete process.env.AIKIDO_SCAN_TIMEOUT_MS;
    // Mock: config file exists with scanTimeout: 5000
    fsMock.existsSync.mock.mockImplementation(() => true);
    fsMock.readFileSync.mock.mockImplementation(() =>
      JSON.stringify({ scanTimeout: 5000 })
    );

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 5000);
  });

  it("should prioritize environment variable over config file", () => {
    process.env.AIKIDO_SCAN_TIMEOUT_MS = "20000";
    // Mock: config file exists with scanTimeout: 5000
    fsMock.existsSync.mock.mockImplementation(() => true);
    fsMock.readFileSync.mock.mockImplementation(() =>
      JSON.stringify({ scanTimeout: 5000 })
    );

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 20000);
  });

  it("should handle invalid environment variable and fall back to config", () => {
    process.env.AIKIDO_SCAN_TIMEOUT_MS = "invalid";
    // Mock: config file exists with scanTimeout: 7000
    fsMock.existsSync.mock.mockImplementation(() => true);
    fsMock.readFileSync.mock.mockImplementation(() =>
      JSON.stringify({ scanTimeout: 7000 })
    );

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 7000);
  });

  it("should ignore zero and negative values and fall back to default", () => {
    // Mock: config file doesn't exist
    fsMock.existsSync.mock.mockImplementation(() => false);

    process.env.AIKIDO_SCAN_TIMEOUT_MS = "0";

    let timeout = getScanTimeout();
    assert.strictEqual(timeout, 10000);

    process.env.AIKIDO_SCAN_TIMEOUT_MS = "-5000";

    timeout = getScanTimeout();
    assert.strictEqual(timeout, 10000);
  });

  it("should ignore textual non-numeric values in environment variable and fall back to config", () => {
    process.env.AIKIDO_SCAN_TIMEOUT_MS = "fast";
    // Mock: config file exists with scanTimeout: 8000
    fsMock.existsSync.mock.mockImplementation(() => true);
    fsMock.readFileSync.mock.mockImplementation(() =>
      JSON.stringify({ scanTimeout: 8000 })
    );

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 8000);
  });

  it("should ignore textual non-numeric values in config file and fall back to default", () => {
    delete process.env.AIKIDO_SCAN_TIMEOUT_MS;
    // Mock: config file exists with scanTimeout: "slow"
    fsMock.existsSync.mock.mockImplementation(() => true);
    fsMock.readFileSync.mock.mockImplementation(() =>
      JSON.stringify({ scanTimeout: "slow" })
    );

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 10000);
  });

  it("should ignore textual non-numeric values in both env and config, fall back to default", () => {
    process.env.AIKIDO_SCAN_TIMEOUT_MS = "quick";
    // Mock: config file exists with scanTimeout: "medium"
    fsMock.existsSync.mock.mockImplementation(() => true);
    fsMock.readFileSync.mock.mockImplementation(() =>
      JSON.stringify({ scanTimeout: "medium" })
    );

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 10000);
  });

  it("should ignore mixed alphanumeric strings in environment variable", () => {
    process.env.AIKIDO_SCAN_TIMEOUT_MS = "5000ms";
    // Mock: config file exists with scanTimeout: 6000
    fsMock.existsSync.mock.mockImplementation(() => true);
    fsMock.readFileSync.mock.mockImplementation(() =>
      JSON.stringify({ scanTimeout: 6000 })
    );

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 6000);
  });

  it("should ignore mixed alphanumeric strings in config file", () => {
    delete process.env.AIKIDO_SCAN_TIMEOUT_MS;
    // Mock: config file exists with scanTimeout: "3000ms"
    fsMock.existsSync.mock.mockImplementation(() => true);
    fsMock.readFileSync.mock.mockImplementation(() =>
      JSON.stringify({ scanTimeout: "3000ms" })
    );

    const timeout = getScanTimeout();

    assert.strictEqual(timeout, 10000);
  });
});
