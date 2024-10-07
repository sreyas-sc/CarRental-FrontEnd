import React from 'react'
import styles from './welcome-banner.module.css'
import Image from 'next/image'

const Banner = () => {
  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <div id="carImagetext" className={styles.welcometext}>
            <Image
                src="/banners/welcome-banner-text.svg"
                layout="responsive"  
                width={300}          
                height={300}
                alt="Welcome Car"
            />

            <div className={styles.storeButtons}>
                <Image
                    src="/icons/play-store-icon.svg"
                    layout="responsive"  
                    width={100}          
                    height={100}
                    alt="Welcome Car"
                />
                <Image
                    src="/icons/app-store-icon.svg"
                    layout="responsive"  
                    width={100}          
                    height={100}
                    alt="Welcome Car"
                />
            </div>
        </div>
      </div>
      <div className={styles.right}>
        <div id="carImage" className={styles.welcomeCarImage}>
          <Image
            src="/banners/welcome-car-image.png"
            layout="responsive"  // Use responsive layout for better scaling
            width={600}          // Natural width of the image
            height={600}         // Natural height of the image
            alt="Welcome Car"
          />
        </div>
      </div>
    </div>
  )
}

export default Banner
