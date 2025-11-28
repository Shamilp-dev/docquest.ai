'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const ACTIVITY_CHECK_INTERVAL = 30000; // 30 seconds - check more frequently
const ACTIVITY_UPDATE_INTERVAL = 10000; // Update activity every 10 seconds
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export function ActivityTracker() {
  const router = useRouter();

  const checkActivity = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        // Session expired - redirect to login
        router.push('/login');
      }
    } catch (error) {
      console.error('Activity check failed:', error);
    }
  }, [router]);

  const updateActivity = useCallback(async () => {
    try {
      await fetch('/api/auth/activity', {
        method: 'POST'
      });
    } catch (error) {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    // Check session on mount
    checkActivity();
    updateActivity();

    // Set interval to check session validity
    const checkInterval = setInterval(checkActivity, ACTIVITY_CHECK_INTERVAL);
    
    // Set interval to update activity regularly
    const updateInterval = setInterval(updateActivity, ACTIVITY_UPDATE_INTERVAL);

    // Track user activity on events (debounce with the regular interval)
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    let activityTimeout: NodeJS.Timeout;
    
    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(updateActivity, 1000); // Debounce to 1 second
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      clearInterval(checkInterval);
      clearInterval(updateInterval);
      clearTimeout(activityTimeout);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [checkActivity, updateActivity]);

  return null;
}