import React from 'react'
import styles from './how-it-work.module.css'
import Image from 'next/image'

const HowItWork = () => {

    const icons = [
      '/icons/honda-icon.svg',
      '/icons/jaguar-icon.svg',
      '/icons/nisan-icon.svg',
      '/icons/volvo-icon.svg',
      '/icons/audi-icon.svg',
      '/icons/acura-icon.svg',
      '/icons/lexus-logo.png',
      '/icons/marcedes-logo.png'
    ];

  return (
    <div className={styles.howitworks}>
      <div className={styles.headinglabel}>
        <span className={styles.heading}>HOW IT WORK</span>
      </div>
      <div className={styles.labelstepsdiv}>
        <span className={styles.labelsteps}>Rent with following 3 working steps</span>
      </div>

      {/* Steps boxes */}
      <div className={styles.steps}>
        {/* First box (location) */}
        <div className={styles.stepsbox}>
          <Image
            src="/icons/steps-location-icon.svg"
            width={100}  
            height={100} 
            alt="Choose location"
          />
          <span className={styles.headtext}>Choose location</span>
          <span className={styles.spantext}>Choose your and find
          your best car</span>
        </div>
        {/* Second box (pickup date) */}
        <div className={styles.stepsbox}>
          <Image
            src="/icons/steps-calander-icon.svg"
            width={100}  
            height={100} 
            alt="Choose pickup date"
          />
          <span className={styles.headtext}>Choose pickup date</span>
          <span className={styles.spantext}>Select your pick up date and
          time to book your car</span>
        </div>
        {/* Third box (book car) */}
        <div className={styles.stepsbox}>
          <Image
            src="/icons/steps-bookcar-icon.svg"
            width={100}  
            height={100} 
            alt="Book the car"
          />
          <span className={styles.headtext}>Book the car</span>
          <span className={styles.spantext}>Book your car and we will deliver
          it directly to you</span>
        </div>
      </div>
      
      {/* Marquee */}
      <div className={styles.marquee}>
        <div className={styles.marqueeInner}>
          {/* Loop through icons */}
          {icons.concat(icons).map((icon, index) => (
            <Image key={index} src={icon} alt={`icon-${index}`} width={100} height={100} />
          ))}
        </div>
      </div>

    </div>
  )
}

export default HowItWork
