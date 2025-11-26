export function isCi() {
  const ciEnvironments = [
    "CI",
    "TF_BUILD", // Azure devops does not set CI, but TF_BUILD
  ];

  for (const env of ciEnvironments) {
    if (process.env[env]) {
      return true;
    }
  }

  return false;
}
