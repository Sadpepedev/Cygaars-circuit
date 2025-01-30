import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Clock } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(10);
        
      if (data) {
        setEntries(data);
      }
      setLoading(false);
    };
    
    fetchLeaderboard();
    
    const channel = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leaderboard'
        },
        () => {
          fetchLeaderboard();
        }
      )
      .subscribe();
    
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-7 h-7 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">Top Players</h2>
      </div>
      
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading scores...
          </div>
        ) : entries.length > 0 ? (
          entries.map((entry, index) => (
            <div
              key={entry.id}
              className="flex flex-col p-3 bg-blue-50 rounded-xl transition-transform hover:scale-102"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {index === 0 ? (
                      <Medal className="w-6 h-6 text-yellow-500" />
                    ) : index === 1 ? (
                      <Medal className="w-6 h-6 text-gray-400" />
                    ) : index === 2 ? (
                      <Medal className="w-6 h-6 text-amber-600" />
                    ) : (
                      <span className="font-bold text-gray-400">#{index + 1}</span>
                    )}
                  </div>
                  <span className="font-medium text-gray-700">{entry.player_name}</span>
                </div>
                <span className="font-bold text-blue-600">{entry.score}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 ml-11">
                <Clock className="w-3 h-3" />
                <span>{formatDate(entry.created_at)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No scores yet. Be the first to play!
          </div>
        )}
      </div>
    </div>
  );
};