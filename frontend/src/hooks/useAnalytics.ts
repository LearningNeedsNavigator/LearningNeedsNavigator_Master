
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/services/analytics';

export const useAnalytics = () => {
  const location = useLocation();
  const startTimeRef = useRef<Date>(new Date());

  // Track page views
  useEffect(() => {
    analytics.trackPageView(location.pathname);
    startTimeRef.current = new Date();
  }, [location.pathname]);

  const trackEvent = (eventType: string, eventData?: Record<string, any>) => {
    analytics.trackEvent({
      event_type: eventType,
      event_data: eventData
    });
  };

  const trackButtonClick = (buttonName: string, context?: string) => {
    analytics.trackButtonClick(buttonName, context);
  };

  const getTimeSpent = (): number => {
    return Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
  };

  return {
    trackEvent,
    trackButtonClick,
    trackPageView: analytics.trackPageView,
    trackSegmentStart: analytics.trackSegmentStart,
    trackSegmentComplete: analytics.trackSegmentComplete,
    trackAssessmentStart: analytics.trackAssessmentStart,
    updateAssessmentProgress: analytics.updateAssessmentProgress,
    completeAssessment: analytics.completeAssessment,
    getTimeSpent
  };
};
