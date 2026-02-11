import { useState, useEffect } from 'react';
import { requestNotificationPermission, onMessageListener } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/lib/apiUrl';

const API_URL = API_BASE_URL;

export const useNotifications = () => {
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const { user } = useAuth();

  // Register FCM token with backend
  const registerFcmToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/users/fcm-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('farmlyf_token')}`
        },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        console.log('FCM token registered successfully');
      } else {
        console.error('Failed to register FCM token');
      }
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  };

  // Request permission and register token
  const initNotifications = async () => {
    try {
      if (notificationPermission === 'denied') {
        console.log('Notification permission already denied');
        return;
      }
      const token = await requestNotificationPermission();
      if (token && user) {
        await registerFcmToken(token);
        setNotificationPermission('granted');
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  // Auto-init for logged in users who haven't granted permission yet
  useEffect(() => {
    if (user && notificationPermission === 'default') {
      // Don't auto-prompt immediately on every page load unless specific action?
      // For now, let's keep it manual or call it on login.
    }
    
    // If permission is already granted, refresh the token
    if (user && notificationPermission === 'granted') {
        initNotifications();
    }
  }, [user, notificationPermission]);

  // Listen for foreground messages (continuous)
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const unsubscribe = onMessageListener((payload) => {
      console.log('Foreground notification received:', payload);
      
      // Show native browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'New Notification', {
          body: payload.notification?.body,
          icon: '/logo.png' // Adjust icon path if needed
        });
      }

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {payload.notification?.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {payload.notification?.body}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });

    // Cleanup on unmount
    return () => unsubscribe && unsubscribe();
  }, [notificationPermission]);

  return {
    notificationPermission,
    initNotifications
  };
};
