import Image from 'next/image';
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import styles from './admin-dashboard.module.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={`${styles.left} ${isOpen ? styles.open : styles.closed}`}>
        <button className={styles.toggleButton} onClick={toggleSidebar}>
          {isOpen ? '≪' : '≫'}
        </button>
        <div className={styles.companylogo}>
          <Image
            src="/icons/brand-logo.svg"
            className={styles.companyLogo}
            width={300}
            height={34}
            alt="Company Logo"
          />
        </div>

        {/* Sidebar Navigation Buttons */}
        <div className={styles.dashboardbuttons}>
          <Link href="/" passHref>
            <button className={styles.dashButton}>Home</button>
          </Link>
          <Link href="/Admin/AddCars" passHref>
            <button className={styles.dashButton}>Add Vehicles</button>
          </Link>
          <Link href="/Admin/AddRentableVehicles" passHref>
            <button className={styles.dashButton}>Add Rentable Vehicles</button>
          </Link>
          <Link href="/Admin/ViewCars" passHref>
            <button className={styles.dashButton}>View Vehicles</button>
          </Link>
          <Link href="/Admin/ViewBookings" passHref>
            <button className={styles.dashButton}>View Bookings</button>
          </Link>
        </div>

        {/* Logout Button */}
        <div className={styles.dashboardbuttonslogout}>
          <button className={styles.dashlogoutButton}>Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${styles.right} ${isOpen ? '' : styles.expanded}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;