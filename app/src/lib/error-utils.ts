/**
 * Error Serialization Utilities
 *
 * Provides safe error serialization and standardized error responses.
 * Handles the fact that Error objects don't serialize to JSON properly.
 */

export interface SerializedError {
  message: string;
  name?: string;
  stack?: string;
  cause?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    layer?: 'api' | 'besu-server' | 'docker' | 'validation';
    details?: string;
    context?: Record<string, any>;
    timestamp: string;
  };
}

/**
 * Safely serialize an error object to JSON
 */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      cause: error.cause
    };
  }

  return {
    message: typeof error === 'string' ? error : String(error)
  };
}

/**
 * Detect error code/type from error message or name
 */
export function detectErrorCode(error: unknown): string {
  if (!(error instanceof Error)) return 'UNKNOWN_ERROR';

  const message = error.message.toLowerCase();

  if (message.includes('validation')) return 'VALIDATION_ERROR';
  if (message.includes('docker')) return 'DOCKER_ERROR';
  if (message.includes('port') && message.includes('already')) return 'PORT_CONFLICT';
  if (message.includes('subnet') && message.includes('conflict')) return 'SUBNET_CONFLICT';
  if (message.includes('network') && message.includes('not found')) return 'NETWORK_NOT_FOUND';
  if (message.includes('connection') || message.includes('econnrefused')) return 'CONNECTION_ERROR';
  if (message.includes('timeout')) return 'TIMEOUT_ERROR';

  return 'RUNTIME_ERROR';
}

/**
 * Create a standardized API error response
 */
export function createErrorResponse(
  error: unknown,
  layer: ApiErrorResponse['error']['layer'] = 'api',
  context?: Record<string, any>
): ApiErrorResponse {
  const serialized = serializeError(error);

  return {
    success: false,
    error: {
      message: serialized.message,
      code: detectErrorCode(error),
      layer,
      details: serialized.stack,
      context,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Safely parse JSON response with fallback to text
 */
export async function safeJsonParse(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch (parseError) {
      console.warn('JSON parse failed, falling back to text', parseError);
      const text = await response.text();
      return { error: text || `HTTP ${response.status}: ${response.statusText}` };
    }
  } else {
    // Not JSON - return as error message
    const text = await response.text();
    return { error: text || `HTTP ${response.status}: ${response.statusText}` };
  }
}
