import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useStudentCounts = () => {
  const [counts, setCounts] = useState({
    basic: 0,
    premium: 0,
    plus: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the Supabase function to get student counts
      const { data, error: fetchError } = await supabase
        .rpc('get_student_counts_by_tier');

      if (fetchError) {
        console.error('Error fetching student counts:', fetchError);
        setError(fetchError);
        return;
      }

      // Transform the data into an object
      const countsObj = {
        basic: 0,
        premium: 0,
        plus: 0,
      };

      if (data && Array.isArray(data)) {
        data.forEach(item => {
          if (item.pricing_tier && countsObj.hasOwnProperty(item.pricing_tier)) {
            countsObj[item.pricing_tier] = parseInt(item.student_count) || 0;
          }
        });
      }

      setCounts(countsObj);
    } catch (err) {
      console.error('Error in useStudentCounts:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();

    // Set up real-time subscription to cohort_registrations table
    const subscription = supabase
      .channel('student-counts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cohort_registrations',
          filter: 'payment_status=eq.completed'
        },
        () => {
          // Refetch counts when a new registration is completed
          fetchCounts();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { counts, isLoading, error, refetch: fetchCounts };
};
