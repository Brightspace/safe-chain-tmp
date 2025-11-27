import { skipMinimumPackageAge } from "../../../config/settings.js";
import { isMalwarePackage } from "../../../scanning/audit/index.js";
import { interceptRequests } from "../interceptorBuilder.js";
import {
  isPackageInfoUrl,
  modifyNpmInfoRequestHeaders,
  modifyNpmInfoResponse,
} from "./modifyNpmInfo.js";
import { parseNpmPackageUrl } from "./parseNpmPackageUrl.js";

const knownJsRegistries = ["registry.npmjs.org", "registry.yarnpkg.com"];

/**
 * @param {string} url
 * @returns {import("../interceptorBuilder.js").Interceptor | undefined}
 */
export function npmInterceptorForUrl(url) {
  const registry = knownJsRegistries.find((reg) => url.includes(reg));

  if (registry) {
    return buildNpmInterceptor(registry);
  }

  return undefined;
}

const allowedBasePackages = new Set([
  '@brightspace-hmc',
  '@brightspace-ui',
  '@brightspace-ui-labs',
  'd2l-license-checker',
  'd2l-npm-login',
  'd2l-test-reporting',
  'eslint-config-brightspace'
])

/**
 * @param {string | undefined} packageName
 * @returns {boolean}
 */
function isAllowedPackage(packageName) {
  if (packageName === undefined) return false;
  const basePackageName = packageName.startsWith("@")
    ? packageName.split("/")[0] : packageName;
  if (allowedBasePackages.has(basePackageName)) {
    return true;
  }
  return false;
}

/**
 * @param {string} registry
 * @returns {import("../interceptorBuilder.js").Interceptor}
 */
function buildNpmInterceptor(registry) {
  return interceptRequests(async (reqContext) => {
    const { packageName, version } = parseNpmPackageUrl(
      reqContext.targetUrl,
      registry
    );

    if (await isMalwarePackage(packageName, version)) {
      reqContext.blockMalware(packageName, version);
    }

    if (!isAllowedPackage(packageName)) {
      if (!skipMinimumPackageAge() && isPackageInfoUrl(reqContext.targetUrl)) {
        reqContext.modifyRequestHeaders(modifyNpmInfoRequestHeaders);
        reqContext.modifyBody(modifyNpmInfoResponse);
      }
    }
  });
}
