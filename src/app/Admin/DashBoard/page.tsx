import Image from 'next/image';
import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import styles from './admin-dashboard.module.css';
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation";


interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);


  const [isAdmin, setIsAdmin] = useState<boolean>(false); // State to check if user is admin
  const [isUser, setIsUser] = useState<boolean>(false); // State to check if user is a regular user
  const router = useRouter();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      // Clear session storage
      sessionStorage.clear();
      setIsAdmin(false); // Update state after logout
      setIsUser(false); // Reset user state after logout
      router.push('/'); // Redirect to home
    }
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
            <button className={styles.dashButton}>Make</button>
          </Link>
          <Link href="/Admin/AddCars" passHref>
            <button className={styles.dashButton}>Models</button>
          </Link>
          <Link href="/Admin/AddRentableVehicles" passHref>
            <button className={styles.dashButton}>Add Rentables</button>
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
          <Link href="/" passHref>
              <button className={styles.dashlogoutButton} onClick={handleLogout} >Logout</button>
            </Link>
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