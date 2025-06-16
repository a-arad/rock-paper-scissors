import { useState, useCallback, useRef, useEffect } from 'react';
import { gameApi, GameApiError } from '../api';

const useGameApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(null);
  const abortControllerRef = useRef(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      await gameApi.checkHealth();
      setIsConnected(true);
      return true;
    } catch (err) {
      setIsConnected(false);
      return false;
    }
  }, []);

  const playGame = useCallback(async (playerChoice) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const result = await gameApi.playGame(playerChoice);
      
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      setIsConnected(true);
      return result;
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      const errorMessage = err instanceof GameApiError 
        ? err.message 
        : 'Failed to play game. Please try again.';
      
      setError(errorMessage);
      setIsConnected(false);
      throw err;
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
      abortControllerRef.current = null;
    }
  }, []);

  const getValidChoices = useCallback(async () => {
    setError(null);
    
    try {
      const result = await gameApi.getValidChoices();
      setIsConnected(true);
      return result;
    } catch (err) {
      const errorMessage = err instanceof GameApiError 
        ? err.message 
        : 'Failed to fetch valid choices.';
      
      setError(errorMessage);
      setIsConnected(false);
      throw err;
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkConnection]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    playGame,
    getValidChoices,
    checkConnection,
    cancelRequest,
    clearError,
    isLoading,
    error,
    isConnected,
  };
};

export default useGameApi;