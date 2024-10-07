import React from 'react'
import styles from './why-choose-us.module.css'
import Image from 'next/image'

const WhyChooseUs = () => {
  return (
    <div className={styles.banner}>
        
        <div className={styles.right}>
        <div id="carImage" className={styles.whychooseusCarImage}>
          <Image
            src="/banners/audi-car.png"
            layout="responsive"  // Use responsive layout for better scaling
            width={600}          // Natural width of the image
            height={600}         // Natural height of the image
            alt="Welcome Car"
          />
        </div>
        </div>
        
        <div className={styles.left}>
            <div className={styles.headinglabel}>
                <span className={styles.heading}>WHY CHOOSE US</span>
            </div>
            <div className={styles.subheading}>
                <span className={styles.subheadingtext}>We offer the best experience with our rental deals</span>
            </div>
            <div className={styles.whychooseustext}>
                <Image
                src="/banners/why-choose-us.svg"
                layout="responsive"  
                width={200}          
                height={200}
                alt="Welcome Car"
            />   
            </div>
        
        </div>
    </div>
  )
}

export default WhyChooseUs