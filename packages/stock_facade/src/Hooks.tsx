import React, { useState, useEffect, useCallback } from "react";

export const useForceUpdate = () => {
  const [, updateState] = useState<any>();
  const update = useCallback(() => updateState({}), []);
  return update;
};

export const useStickyState = (defaultValue: any, key: string) => {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(key);

    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
