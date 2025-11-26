import { describe, it } from "node:test";
import assert from "node:assert";
import { parsePackagesFromArguments } from "./parsePackagesFromArguments.js";

describe("standardYarnArgumentParser", () => {
  it("should return an empty array for no changes", () => {
    const args = ["add"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, []);
  });

  it("should return an array of changes for one package", () => {
    const args = ["add", "axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });

  it("should return the package with latest tag if absent", () => {
    const args = ["add", "axios"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "latest" }]);
  });

  it("should only return all packages", () => {
    const args = ["add", "axios", "jest"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "axios", version: "latest" },
      { name: "jest", version: "latest" },
    ]);
  });

  it("should return the package in the format @vercel/otel", () => {
    const args = ["add", "@vercel/otel"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "@vercel/otel", version: "latest" }]);
  });

  it("should ignore options with parameters and return an array of changes", () => {
    const args = ["add", "--proxy", "http://localhost", "axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });

  it("should parse version even for aliased packages", () => {
    const args = ["add", "server@npm:axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });

  it("should parse scoped packages", () => {
    const args = ["add", "@scope/package@1.0.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "@scope/package", version: "1.0.0" }]);
  });

  it("should parse packages with version ranges", () => {
    const args = ["add", "axios@^1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "^1.9.0" }]);
  });

  it("should parse package folders", () => {
    const args = ["add", "./local-package"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "./local-package", version: "latest" }]);
  });

  it("should parse tarballs", () => {
    const args = ["add", "file:./local-package.tgz"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "file:./local-package.tgz", version: "latest" },
    ]);
  });

  it("should parse tarball URLs", () => {
    const args = ["add", "https://example.com/local-package.tgz"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "https://example.com/local-package.tgz", version: "latest" },
    ]);
  });

  it("should parse git URLs", () => {
    const args = ["add", "git://github.com/http-party/http-server"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "git://github.com/http-party/http-server", version: "latest" },
    ]);
  });

  it("should parse packages with -p {packageName}", () => {
    const args = ["dlx", "-p", "axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });

  it("should parse packages with --package {packageName}", () => {
    const args = ["dlx", "--package", "axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });
});
