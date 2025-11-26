import { describe, it } from "node:test";
import assert from "node:assert";
import { parsePackagesFromArguments } from "./parsePackagesFromArguments.js";

describe("standardPnpmArgumentParser", () => {
  it("should return an empty array for no changes", () => {
    const args = [];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, []);
  });

  it("should return an array of changes for one package", () => {
    const args = ["axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });

  it("should return the package with latest tag if absent", () => {
    const args = ["axios"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "latest" }]);
  });

  it("should return the package in the format @vercel/otel", () => {
    const args = ["@vercel/otel"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "@vercel/otel", version: "latest" }]);
  });

  it("should return the package with latest tag if the version is absent and package starts with @", () => {
    const args = ["@aikidosec/package-name"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "@aikidosec/package-name", version: "latest" },
    ]);
  });

  it("should return the package with the specified tag if the package starts with @ and includes the version", () => {
    const args = ["@aikidosec/package-name@1.0.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "@aikidosec/package-name", version: "1.0.0" },
    ]);
  });

  it("should only return all packages", () => {
    const args = ["axios", "jest"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [
      { name: "axios", version: "latest" },
      { name: "jest", version: "latest" },
    ]);
  });

  it("should ignore options with parameters and return an array of changes", () => {
    const args = ["--C", "/Users/johnsmith/dev/project", "axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });

  it("should parse version even for aliased packages", () => {
    const args = ["server@npm:axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });

  it("should parse scoped packages", () => {
    const args = ["@scope/package@1.0.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "@scope/package", version: "1.0.0" }]);
  });

  it("should parse packages with version ranges", () => {
    const args = ["axios@^1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "^1.9.0" }]);
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

  it("should parse packages with --package={packageName}", () => {
    const args = ["--package=axios@1.9.0"];

    const result = parsePackagesFromArguments(args);

    assert.deepEqual(result, [{ name: "axios", version: "1.9.0" }]);
  });
});
