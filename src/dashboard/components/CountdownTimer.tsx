import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      
      const difference = tomorrow.getTime() - now.getTime();
      
      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (time: number) => {
    return time.toString().padStart(2, '0');
  };

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-center mb-4">
        <Clock className="w-6 h-6 mr-2" />
        <h3 className="text-xl font-bold">Next AI Processing</h3>
      </div>
      
      <div className="flex justify-center items-center space-x-4">
        <div className="text-center">
          <div className="text-3xl font-bold bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
            {formatTime(timeLeft.hours)}
          </div>
          <div className="text-sm mt-1 opacity-90">Hours</div>
        </div>
        
        <div className="text-2xl font-bold opacity-75">:</div>
        
        <div className="text-center">
          <div className="text-3xl font-bold bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
            {formatTime(timeLeft.minutes)}
          </div>
          <div className="text-sm mt-1 opacity-90">Minutes</div>
        </div>
        
        <div className="text-2xl font-bold opacity-75">:</div>
        
        <div className="text-center">
          <div className="text-3xl font-bold bg-white/20 rounded-lg px-3 py-2 min-w-[60px]">
            {formatTime(timeLeft.seconds)}
          </div>
          <div className="text-sm mt-1 opacity-90">Seconds</div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <p className="text-sm opacity-90">
          Until 00:00 GMT - When the AI processes community decisions
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;