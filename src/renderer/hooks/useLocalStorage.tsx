import React from 'react';

export function useLocalStorage<Type extends any>(
  keyName: string,
  defaultValue: Type
) {
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      const value = window.localStorage.getItem(keyName);

      if (value) {
        // DAS machen wir nicht so aber es klappt
        return JSON.parse(value);
      }
      window.localStorage.setItem(keyName, JSON.stringify(defaultValue));
      return defaultValue;
    } catch (err) {
      return defaultValue;
    }
  });

  const setValue = (newValue: Type) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    setStoredValue(newValue);
  };

  return [storedValue, setValue];
}
