
import { createClient } from '@supabase/supabase-js';

// Use an untyped client for analytics tables that may not exist in the typed schema yet
const SUPABASE_URL = "https://pfzakqsbnbyrecvbflaj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmemFrcXNibmJ5cmVjdmJmbGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNTc0NjMsImV4cCI6MjA1OTczMzQ2M30.tLyEZXiKrHm1ST6byANlzBpMSbwDf_FtloT8ZeLVcT8";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  page_url?: string;
}

export interface AssessmentAnalytics {
  segment_id: string;
  questions_answered?: number;
  total_questions?: number;
  completion_percentage?: number;
  time_spent_seconds?: number;
  completed_at?: string;
  results_data?: Record<string, any>;
}

class AnalyticsService {
  private getUserAgent = (): string => {
    return navigator.userAgent;
  }

  private getCurrentUrl = (): string => {
    return window.location.href;
  }

  trackEvent = async (event: AnalyticsEvent): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id || null,
          event_type: event.event_type,
          event_data: event.event_data || null,
          page_url: event.page_url || this.getCurrentUrl(),
          user_agent: this.getUserAgent()
        });

      if (error) {
        if (import.meta.env.DEV) console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Analytics service error:', error);
    }
  }

  trackAssessmentStart = async (segmentId: string, totalQuestions: number): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('assessment_analytics')
        .insert({
          user_id: user?.id || null,
          segment_id: segmentId,
          total_questions: totalQuestions,
          questions_answered: 0,
          completion_percentage: 0,
          time_spent_seconds: 0
        })
        .select('id')
        .single();

      if (error) {
        if (import.meta.env.DEV) console.error('Assessment analytics tracking error:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Assessment analytics service error:', error);
      return null;
    }
  }

  updateAssessmentProgress = async (
    assessmentId: string, 
    questionsAnswered: number,
    timeSpentSeconds: number
  ): Promise<void> => {
    try {
      const completionPercentage = questionsAnswered > 0 ? 
        Math.round((questionsAnswered / (await this.getTotalQuestions(assessmentId))) * 100) : 0;

      const { error } = await supabase
        .from('assessment_analytics')
        .update({
          questions_answered: questionsAnswered,
          completion_percentage: completionPercentage,
          time_spent_seconds: timeSpentSeconds
        })
        .eq('id', assessmentId);

      if (error) {
        if (import.meta.env.DEV) console.error('Assessment progress update error:', error);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Assessment progress service error:', error);
    }
  }

  completeAssessment = async (assessmentId: string, resultsData?: Record<string, any>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('assessment_analytics')
        .update({
          completed_at: new Date().toISOString(),
          results_data: resultsData || null,
          completion_percentage: 100
        })
        .eq('id', assessmentId);

      if (error) {
        if (import.meta.env.DEV) console.error('Assessment completion error:', error);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Assessment completion service error:', error);
    }
  }

  private getTotalQuestions = async (assessmentId: string): Promise<number> => {
    const { data } = await supabase
      .from('assessment_analytics')
      .select('total_questions')
      .eq('id', assessmentId)
      .single();
    
    return data?.total_questions || 0;
  }

  // Page tracking methods
  trackPageView = async (page: string): Promise<void> => {
    await this.trackEvent({
      event_type: 'page_view',
      event_data: { page }
    });
  }

  trackButtonClick = async (buttonName: string, context?: string): Promise<void> => {
    await this.trackEvent({
      event_type: 'button_click',
      event_data: { button_name: buttonName, context }
    });
  }

  trackSegmentStart = async (segmentId: string): Promise<void> => {
    await this.trackEvent({
      event_type: 'segment_start',
      event_data: { segment_id: segmentId }
    });
  }

  trackSegmentComplete = async (segmentId: string): Promise<void> => {
    await this.trackEvent({
      event_type: 'segment_complete',
      event_data: { segment_id: segmentId }
    });
  }
}

export const analytics = new AnalyticsService();
