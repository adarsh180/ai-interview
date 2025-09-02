// Production error handling utilities

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleApiError(error: unknown): {
  message: string;
  statusCode: number;
  details?: string;
} {
  // Handle known AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }

  // Handle database errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as any;
    
    switch (dbError.code) {
      case 'ER_DUP_ENTRY':
        return {
          message: 'Duplicate entry found',
          statusCode: 409
        };
      case 'ER_NO_SUCH_TABLE':
        return {
          message: 'Database table not found',
          statusCode: 500
        };
      case 'ER_ACCESS_DENIED_ERROR':
        return {
          message: 'Database access denied',
          statusCode: 500
        };
      case 'ECONNREFUSED':
        return {
          message: 'Database connection refused',
          statusCode: 500
        };
      default:
        return {
          message: 'Database error occurred',
          statusCode: 500,
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        };
    }
  }

  // Handle JWT errors
  if (error && typeof error === 'object' && 'name' in error) {
    const jwtError = error as any;
    
    if (jwtError.name === 'JsonWebTokenError') {
      return {
        message: 'Invalid token',
        statusCode: 401
      };
    }
    
    if (jwtError.name === 'TokenExpiredError') {
      return {
        message: 'Token expired',
        statusCode: 401
      };
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      statusCode: 500,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }

  // Handle unknown errors
  return {
    message: 'An unexpected error occurred',
    statusCode: 500,
    details: process.env.NODE_ENV === 'development' ? String(error) : undefined
  };
}

export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString();
  const contextStr = context ? `[${context}] ` : '';
  
  if (error instanceof Error) {
    console.error(`${timestamp} ${contextStr}Error: ${error.message}`);
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
  } else {
    console.error(`${timestamp} ${contextStr}Unknown error:`, error);
  }
}

// Validation helpers
export function validateRequired(fields: Record<string, any>, requiredFields: string[]) {
  const missing = requiredFields.filter(field => !fields[field] || fields[field].toString().trim() === '');
  
  if (missing.length > 0) {
    throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
  }
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError('Invalid email format', 400);
  }
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    throw new AppError('Password must be at least 8 characters long', 400);
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new AppError('Password must contain at least one uppercase letter, one lowercase letter, and one number', 400);
  }
}