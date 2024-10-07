'use client'
import React, { useState, useEffect } from "react";
import styles from "./header.module.css";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2'; // Import SweetAlert2


function Navbar() {
  const [isSidebarActive, setSidebarActive] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // State to check if user is admin
  const [isUser, setIsUser] = useState<boolean>(false); // State to check if user is a regular user
  const router = useRouter();

  useEffect(() => {
    const checkUserData = () => {
      const userData = sessionStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.__typename === "Admin");
        setIsUser(user.__typename === "User"); // Set user state based on __typename
      } else {
        setIsAdmin(false);
        setIsUser(false); // Reset user state
      }
    };

    checkUserData();

    const handleStorageChange = () => {
      checkUserData();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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

  const handleBurgerClick = () => {
    setSidebarActive(true);
  };

  const handleCloseClick = () => {
    setSidebarActive(false);
  };

  return (
    <div className={styles.header}>
      <header>
        <div className={styles.nav}>
          <div className={styles.navLayer}>
            <div id="navLogo">
              <Link href="/" legacyBehavior passHref>
                <Image
                  src="/icons/brand-icon-blue.svg"
                  className={styles.companyLogo}
                  width={370}
                  height={54}
                  alt=""
                />
              </Link>
            </div>
            <div className={styles.navList}>
              <ul className={styles.navLinkList}>
                {!isAdmin && !isUser ? (
                  <li className={`${styles.navLinkLi} ${styles.navLinkButtonLi}`} id="navLinkButtonLi">
                    <Link href="/Auth/Login" legacyBehavior passHref>
                      <button className={styles.siginInButton}>Sign in</button>
                    </Link>
                    <Link href="/Auth/Register" legacyBehavior passHref>
                      <button className={styles.signUpButton}>Sign Up</button>
                    </Link>
                  </li>
                ) : isUser ? (
                  <li className={styles.navLinkLi}>
                    <Link href="/Admin/ViewAllRentable" legacyBehavior passHref>
                      <button className={styles.siginInButton}>Rent a Car</button>
                    </Link>
                    <Link href="/User/UserProfile" legacyBehavior passHref>
                      <button className={styles.siginInButton}>Profile</button>
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                      Logout
                    </button>
                  </li>
                ) : (
                  <li className={styles.navLinkLi}>
                    <Link href="/Admin/ViewCars" legacyBehavior passHref>
                      <button className={styles.dashboardButton}>Dashboard</button>
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                      Logout
                    </button>
                  </li>
                )}
              </ul>
              <div className={styles.burger} onClick={handleBurgerClick}>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
                <div className={styles.line}></div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.sideBar} ${isSidebarActive ? styles.sideBarActive : ""}`}>
          <div>
            <Image
              src="/icons/close.png"
              alt="Close Icon For Side Bar"
              className={styles.closeButtonIcon}
              onClick={handleCloseClick}
              width="24"
              height="24"
            />
          </div>

          <div className={styles.dropNavMenu}>
            {!isAdmin && !isUser ? (
              <>
                <Link href="/Auth/Login" legacyBehavior passHref>
                  <button className={styles.loginSignUpButton}>Sign in</button>
                </Link>
                <Link href="/Auth/Register" legacyBehavior passHref>
                  <button className={styles.loginSignUpButton}>Sign Up</button>
                </Link>
              </>
            ) : isUser ? (
              <>
                <Link href="/Admin/ViewAllRentable" legacyBehavior passHref>
                  <button className={styles.loginSignUpButton}>Rent a Car</button>
                </Link>
                <Link href="/User/UserProfile" legacyBehavior passHref>
                  <button className={styles.loginSignUpButton}>Profile</button>
                </Link>
                <button onClick={handleLogout} className={styles.loginSignUpButton}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/Admin/ViewCars" legacyBehavior passHref>
                  <button className={styles.loginSignUpButton}>Dashboard</button>
                </Link>
                <button onClick={handleLogout} className={styles.loginSignUpButton}>Logout</button>
              </>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}

export default Navbar;
