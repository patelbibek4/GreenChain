import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({
    message: "",
    type: "success",
  });

  const showNotification = useCallback(
    (message, type = "success") => {
      setNotification({
        message,
        type,
      });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification({
      message: "",
      type: "success",
    });
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notification,
        showNotification,
        hideNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider"
    );
  }

  return context;
}