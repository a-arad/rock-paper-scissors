const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class GameApiError extends Error {
  constructor(message, status = null, data = null) {
    super(message);
    this.name = 'GameApiError';
    this.status = status;
    this.data = data;
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    
    const errorMessage = errorData?.error || `HTTP ${response.status}: ${response.statusText}`;
    throw new GameApiError(errorMessage, response.status, errorData);
  }
  
  return response.json();
};

const makeApiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return handleApiResponse(response);
  } catch (error) {
    if (error instanceof GameApiError) {
      throw error;
    }
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new GameApiError('Unable to connect to the game server. Please check your connection and try again.');
    }
    
    throw new GameApiError('An unexpected error occurred while communicating with the server.');
  }
};

export const gameApi = {
  async playGame(playerChoice) {
    if (!playerChoice || typeof playerChoice !== 'string') {
      throw new GameApiError('Player choice is required and must be a string.');
    }

    return makeApiRequest('/game/play', {
      method: 'POST',
      body: JSON.stringify({ choice: playerChoice.toLowerCase() }),
    });
  },

  async getValidChoices() {
    return makeApiRequest('/game/choices');
  },

  async checkHealth() {
    return makeApiRequest('/health');
  },
};

export { GameApiError };
export default gameApi;