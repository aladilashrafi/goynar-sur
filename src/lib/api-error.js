export class StorefrontApiError extends Error {
  constructor(message, status = 500, code = "storefront_error", details = undefined) {
    super(message);
    this.name = "StorefrontApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function apiError(message, status = 500, code = "storefront_error", details = undefined) {
  return new StorefrontApiError(message, status, code, details);
}

export function safeApiError(error, fallbackMessage = "We could not complete that request right now.") {
  const status = Number(error?.status || error?.statusCode || 500);
  const safeStatus = status >= 400 && status < 600 ? status : 500;
  const code = error?.code || "storefront_error";

  if (error instanceof StorefrontApiError) {
    return {
      status: safeStatus,
      body: {
        success: false,
        message: error.message || fallbackMessage,
        code,
      },
    };
  }

  if (code === "missing_env") {
    return {
      status: 503,
      body: {
        success: false,
        message: "Store connection is not configured. Please contact support.",
        code,
      },
    };
  }

  if (safeStatus === 404) {
    return {
      status: 404,
      body: {
        success: false,
        message: fallbackMessage,
        code,
      },
    };
  }

  if (safeStatus === 429) {
    return {
      status: 429,
      body: {
        success: false,
        message: "The store is receiving too many requests right now. Please try again shortly.",
        code,
      },
    };
  }

  if (safeStatus >= 500) {
    return {
      status: safeStatus,
      body: {
        success: false,
        message: fallbackMessage,
        code,
      },
    };
  }

  return {
    status: safeStatus,
    body: {
      success: false,
      message: error?.message || fallbackMessage,
      code,
    },
  };
}

export function sendApiError(res, error, fallbackMessage) {
  const { status, body } = safeApiError(error, fallbackMessage);
  return res.status(status).json(body);
}
