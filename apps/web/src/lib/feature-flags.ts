/**
 * Feature flags for gradual migration from mock data to real API
 *
 * These flags allow toggling between mock data and real API endpoints
 * as different features become available.
 */
export const FEATURE_FLAGS = {
  /**
   * When false: Use real deal API for fetching deals
   * When true: Use mock deals from chat-mock-data
   */
  USE_MOCK_DEALS: true,

  /**
   * When true: Use mock messages (no messages API exists yet)
   * When false: Use real messages API (not implemented)
   */
  USE_MOCK_MESSAGES: true,

  /**
   * When true: Use mock memory items (no memory API exists yet)
   * When false: Use real memory API (not implemented)
   */
  USE_MOCK_MEMORY: true,
} as const;
