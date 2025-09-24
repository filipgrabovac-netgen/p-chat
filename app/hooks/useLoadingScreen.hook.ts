import { useState, useEffect } from "react";

export const useLoadingScreen = (initialDelay: number = 2000) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    // Minimum loading time to show the animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, initialDelay);

    return () => clearTimeout(timer);
  }, [initialDelay]);

  const handleLoadingComplete = () => {
    setShowLoading(false);
  };

  return {
    isLoading,
    showLoading,
    handleLoadingComplete,
  };
};
