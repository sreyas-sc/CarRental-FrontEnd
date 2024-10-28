import React, { useState, useEffect } from 'react';
import styles from './timer.module.css'

const PaymentTimer = () => {
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      window.location.href = '/Admin/ViewAllRentable';
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={styles.maindiv}>
      <div className={styles.mainText}>
        Complete payment in:
      </div>
      <div className={styles.minutes}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      {/* <div className="text-sm text-gray-500">
        Session will expire after timer ends
      </div> */}
    </div>
  );
};

export default PaymentTimer;