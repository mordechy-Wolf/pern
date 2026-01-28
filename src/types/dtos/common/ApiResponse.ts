/**
 * Success API response
 */
export interface ApiResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

/**
 * Error API response
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    stack?: string;
  };
}

/**
 * Generic API response (success or error)
 */
export type GenericApiResponse<T = any> = ApiResponse<T> | ApiErrorResponse;