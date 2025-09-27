// File: src/utils/errorHandler.js
export const handleAPIError = (error) => {
  console.error("API Error:", error);

  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return data.error || "Bad request. Please check your input.";
      case 401:
        return "Authentication failed. Please login again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return data.error || `Error: ${status}`;
    }
  } else if (error.request) {
    // Request was made but no response received
    return "Network error. Please check your connection.";
  } else {
    // Something else happened
    return error.message || "An unexpected error occurred.";
  }
};

// Utility to check if backend is running
export const checkBackendHealth = async () => {
  try {
    const response = await fetch("http://localhost:3000/health");
    return response.ok;
  } catch (error) {
    console.error("Backend is not running:", error);
    return false;
  }
};
