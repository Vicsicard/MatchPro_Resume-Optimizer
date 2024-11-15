import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import PremiumCheckout from '../stripe/PremiumCheckout';
import { Check } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const PricingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [hasUsedTrial, setHasUsedTrial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState(null);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Check if user has used free trial
          const { data, error } = await supabase
            .from('user_trial_table')  
            .select('used_trial')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            console.error('Error checking trial status:', error);
          }
          
          setHasUsedTrial(data?.used_trial ?? false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Initialize fingerprint detection
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceFingerprint(result.visitorId);
    };
    initFingerprint();
  }, []);

  const checkTrialEligibility = async () => {
    if (!user) return false;

    // Check IP-based trials
    const { data: ipTrials, error: ipError } = await supabase
      .from('user_trial_table')
      .select('created_at')
      .eq('ip_address', await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip))
      .order('created_at', { ascending: false })
      .limit(5);

    if (ipError) {
      console.error('Error checking IP trials:', ipError);
      return false;
    }

    // If we find multiple trials from same IP in short period, flag as potential abuse
    if (ipTrials?.length >= 3) {
      const mostRecent = new Date(ipTrials[0].created_at);
      const oldest = new Date(ipTrials[ipTrials.length - 1].created_at);
      const daysBetween = (mostRecent - oldest) / (1000 * 60 * 60 * 24);
      
      if (daysBetween < 7) {
        alert('Too many trial attempts detected. Please contact support if you believe this is an error.');
        return false;
      }
    }

    // Check device fingerprint
    const { data: deviceTrials, error: deviceError } = await supabase
      .from('user_trial_table')
      .select('created_at')
      .eq('device_fingerprint', deviceFingerprint)
      .limit(1);

    if (deviceError) {
      console.error('Error checking device trials:', deviceError);
      return false;
    }

    if (deviceTrials?.length > 0) {
      alert('A trial has already been used on this device.');
      return false;
    }

    return true;
  };

  const handleFreeTrial = async () => {
    if (!user) {
      navigate('/auth', { state: { returnTo: '/pricing' } });
      return;
    }

    if (hasUsedTrial) {
      alert('You have already used your free trial. Please choose a paid plan to continue.');
      return;
    }

    const isEligible = await checkTrialEligibility();
    if (!isEligible) return;

    try {
      const ip = await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip);
      
      const { error } = await supabase
        .from('user_trial_table')
        .upsert({ 
          user_id: user.id, 
          used_trial: true,
          trial_start_date: new Date().toISOString(),
          ip_address: ip,
          device_fingerprint: deviceFingerprint
        });

      if (error) throw error;
      navigate('/upload');
    } catch (error) {
      console.error('Error recording trial usage:', error);
      alert('There was an error starting your trial. Please try again.');
    }
  };

{{ ... }}