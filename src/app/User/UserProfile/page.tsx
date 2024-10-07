'use client'
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import styles from './user-profile.module.css';

const UserProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    // Fetch user data from session storage
    const sessionUser = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (sessionUser) {
      setUser(sessionUser);
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.userProfileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>User Profile</h2>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              <img
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.name}`}
                alt={user.name}
                className={styles.avatarImage}
              />
              <div className={styles.avatarFallback}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              {/* <p className="text-gray-500">{user.id}</p> */}
            </div>
          </div>
          <div className={styles.userInfo}>
            <div className={styles.infoItem}>
              <Mail className={styles.infoIcon} />
              <span>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <Phone className={styles.infoIcon} />
              <span>{user.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <MapPin className={styles.infoIcon} />
              <span>{`${user.city}, ${user.state}, ${user.country}`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bookingsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Bookings</h2>
        </div>
        <div className={styles.cardContent}>
          <table className={styles.bookingsTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Car Model</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={3} className={styles.noBookings}>
                    No bookings available.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.date}</td>
                    <td>{booking.carModel}</td>
                    <td>{booking.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

