import { describe, it } from "node:test";
import assert from "node:assert";
import { parsePackagesFromArguments } from "./parsePackagesFromArguments.js";

describe("parsePackagesFromArguments", () => {
  it("should return an empty array for no changes", () => {
    const args = [];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, []);
  });

  it("should return an array of changes for one package", () => {
    const args = ["http-server@14.1.1"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "14.1.1" }]);
  });

  it("should return the package in the format @vercel/otel", () => {
    const args = ["@vercel/otel"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "@vercel/otel", version: "latest" }]);
  });

  it("should return the package with latest tag if absent", () => {
    const args = ["http-server"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "latest" }]);
  });

  it("should ignore double --", () => {
    const args = ["--", "http-server"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "latest" }]);
  });

  it("should only return the first package", () => {
    const args = ["http-server", "jest"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "latest" }]);
  });

  it("should return package with -p option", () => {
    const args = ["-p", "http-server"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "latest" }]);
  });

  it("should return package with --package option", () => {
    const args = ["--package", "http-server"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "latest" }]);
  });

  it("should return package with --package=x option", () => {
    const args = ["--package=http-server"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "latest" }]);
  });

  it("should return package with --package=x@version option", () => {
    const args = ["--package=http-server@1.0.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "1.0.0" }]);
  });

  it("should ignore options with parameters and return an array of changes", () => {
    const args = ["--loglevel", "error", "http-server@14.1.1"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "14.1.1" }]);
  });

  it("should parse version even for aliased packages", () => {
    const args = ["server@npm:http-server@14.1.1"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "14.1.1" }]);
  });

  it("should parse scoped packages", () => {
    const args = ["@scope/package@1.0.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "@scope/package", version: "1.0.0" }]);
  });

  it("should parse packages with version ranges", () => {
    const args = ["http-server@^14.1.1"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "http-server", version: "^14.1.1" }]);
  });

  it("should parse package folders", () => {
    const args = ["./local-package"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "./local-package", version: "latest" }]);
  });

  it("should parse tarballs", () => {
    const args = ["file:./local-package.tgz"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "file:./local-package.tgz", version: "latest" },
    ]);
  });

  it("should parse tarball URLs", () => {
    const args = ["https://example.com/local-package.tgz"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "https://example.com/local-package.tgz", version: "latest" },
    ]);
  });

  it("should parse git URLs", () => {
    const args = ["git://github.com/http-party/http-server"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "git://github.com/http-party/http-server", version: "latest" },
    ]);
  });
});
