import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderService } from '../services/orderService';
import { useAuth } from './useAuth';
import { formatCurrency } from '../utils/formatters';

const STORAGE_MUTE_KEY = 'saree_alerts_muted';

export const playNotificationSound = () => {
  try {
    const isMuted = localStorage.getItem(STORAGE_MUTE_KEY) === 'true';
    if (isMuted) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Pleasant high-clarity 2-note chime (F5 -> A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now); // F5
    osc1.frequency.setValueAtTime(880.00, now + 0.12); // A5
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
  } catch (err) {
    // Autoplay policy or browser audio disabled
    console.debug('Audio chime skipped:', err);
  }
};

export const useNewOrderAlerts = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [newCount, setNewCount] = useState(0);
  const [latestOrders, setLatestOrders] = useState([]);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem(STORAGE_MUTE_KEY) === 'true';
  });

  const prevCountRef = useRef(null);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_MUTE_KEY, String(next));
      toast.success(next ? 'Order alert sounds muted' : 'Order alert sounds enabled', {
        icon: next ? '🔇' : '🔔',
      });
      return next;
    });
  };

  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await orderService.getNewOrderSummary();
      const count = Number(data.newCount || 0);
      const latest = data.latest || [];

      setNewCount(count);
      setLatestOrders(latest);

      // Trigger alert when count increases compared to previous poll
      if (prevCountRef.current !== null && count > prevCountRef.current) {
        playNotificationSound();

        const latestItem = latest[0];
        const title = latestItem
          ? `New online order ${latestItem.orderNumber} from ${latestItem.customerName} - ${formatCurrency(latestItem.totalAmount)}`
          : `You have ${count} new online order requests awaiting staff action`;

        toast(
          (t) => (
            <div className="flex items-center justify-between gap-3 min-w-[280px]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🥻</span>
                <div>
                  <p className="font-bold text-xs text-maroon-950">{title}</p>
                  <p className="text-[10px] text-slate-500">Tap View to accept or reject</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate('/online-orders');
                }}
                className="px-2.5 py-1 rounded-lg bg-maroon-900 text-gold-200 text-xs font-bold hover:bg-maroon-950 transition-colors shadow-sm flex-shrink-0 cursor-pointer"
              >
                View
              </button>
            </div>
          ),
          {
            duration: 9000,
            id: 'new-order-online-toast',
            style: {
              background: '#FFFDF9',
              border: '1px solid #D4AF37',
              boxShadow: '0 10px 25px -5px rgba(53, 2, 13, 0.2)',
            },
          }
        );
      }

      prevCountRef.current = count;
    } catch (err) {
      console.debug('Failed to fetch new order summary:', err);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNewCount(0);
      setLatestOrders([]);
      prevCountRef.current = null;
      return;
    }

    // Initial fetch immediately
    fetchSummary();

    // Poll every 15 seconds
    const interval = setInterval(fetchSummary, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchSummary]);

  return {
    newCount,
    latestOrders,
    isMuted,
    toggleMute,
    refetch: fetchSummary,
  };
};
