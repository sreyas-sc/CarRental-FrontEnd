import Image from "next/image";
import React from "react";
import styles from "./footer.module.css";
import Link from "next/link";

function Footer() {

  // socail media link with images
  const socialLinks = [
    { id: 1, name: "facebook", imgUrl: '/icons/facebook-icon.svg', url: '' },
    { id: 3, name: "Instagram", imgUrl: '/icons/insta-icon.svg', url: '' },
    { id: 5, name: "Youtube", imgUrl: '/icons/youtube-icon.svg', url: '' }
  ]

  return (
    <div>
      <footer>
        <div className={styles.footerMobile}>
          <div className={styles.MediaLinks}>
            <Image
              src="/icons/brand-icon-blue.svg"
              height={46}
              width={113}
              alt="alhabtoor logo"
            />
    
          </div>
          <div className={styles.bottomNavigation}>
            <ul className={styles.navul}>
              <li>Home</li>
              <li>Offers</li>
              <li>Career</li>
              <li>About Us</li>
              <li className={styles.end}>Locations</li>
            </ul>
            <ul className={styles.navul}>
              <li>FAQ</li>
              <li>Terms & Conditions</li>
              <li className={styles.end}>Service Request</li>
            </ul>
            <ul className={styles.navul}>
              <li>Privacy Policy</li>
              <li>Services</li>
              <li className={styles.end}>Contact Us</li>
            </ul>
          </div>
          <div className={styles.groupNavigation}>
            <h3>RENTCARS</h3>
            <ul className={styles.companyUl1}>
              <li>Hospitality</li>
              <li className={styles.middle}>Real Estate</li>
              <li>Publishing</li>
            </ul>

            <ul className={styles.companyUl2}>
              <li className={styles.first}>Automotive</li>
              <li>Vehicle Leasing</li>
            </ul>
          </div>
          <div className={styles.copyright}>
            <p>© 2023 Car rental LLC - All Rights Reserved. </p>
          </div>
        </div>

        {/* <!-- Footer Desktop View --> */}
        <div className={styles.desktop}>
          <div className={styles.row}>
            <div className={styles.col1}>
              <Image
                id="companylogoFooter"
                src="/icons/brand-icon-blue.svg"
                alt=""
                width={120}
                height={140}
              />
            </div>
            <div className={styles.col2}>
              {" "}
              <div className={styles.bottomNavDesktop}>
                <ul className={styles.bottomNavList}>
                  <li>Home</li>
                  <li>About Us</li>
                  <li>Services</li>
                </ul>
                <ul className={styles.bottomNavList}>
                  <li>Offer</li>
                  <li>Location</li>
                  <li>Contact Us</li>
                </ul>
                <ul className={styles.bottomNavList}>
                  <li>FAQ</li>
                  <li>Privacy Policy</li>
                  <li>Service Request</li>
                </ul>
                <ul className={styles.bottomNavList}>
                  <li>Career</li>
                  <li>Terms & Conditions</li>
                </ul>
              </div>
              
            </div>
            <div className={styles.col3}>
              <p>Follow us on</p>
              <ul>
                {socialLinks.map((item) => (
                  <li key={item.id}>
                    <Link href={item.url}><Image
                      src={item.imgUrl}
                      alt={item.name}
                      width={17}
                      height={17}
                    /></Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.copyright}>
            <p>© 2023 Car Rent - All Rights Reserved. </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;