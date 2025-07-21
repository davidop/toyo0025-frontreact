/**
 * Helper function to get environment variables with optional default values
 */
export const getEnv = (key, defaultValue = undefined) => {
  const value = import.meta.env[`VITE_${key}`]
  return value !== undefined ? value : defaultValue
}

/**
 * Centralized environment variables
 */
export const envVariables = {
  API_APP_BASE_URL: getEnv('API_APP_BASE_URL'),
  API_TIMEOUT: getEnv('API_TIMEOUT', 10000),
}
