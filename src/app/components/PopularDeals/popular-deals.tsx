'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RENTABLE_VEHICLES } from '@/graphql/mutations';
import styles from './popular-deals.module.css';
import Link from 'next/link';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  price: number;
  primaryImageUrl: string | null;
}

interface GetRentableVehiclesResponse {
  getRentableVehicles: Vehicle[];
}

const PopularDeals: React.FC = () => {
  const { loading, error, data } = useQuery<GetRentableVehiclesResponse>(GET_RENTABLE_VEHICLES);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (!loading && data?.getRentableVehicles) {
      setVehicles(data.getRentableVehicles.slice(0, 4));
    }
  }, [data, loading]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className={styles.populardeals}>
      <div className={styles.headinglabel}>
        <span className={styles.heading}>POPULAR DEALS</span>
      </div>
      <div className={styles.subheading}>
        <span className={styles.subheadingtext}>We offer the best experience with our rental deals</span>
      </div>
      <div className={styles.populardealscards}>
        {vehicles.map((vehicle) => (
          <div className={styles.carcard} key={vehicle.id}>
            <div className={styles.cardcarimagecontainer}>
              <img
                src={vehicle.primaryImageUrl || 'https://via.placeholder.com/300x200'}
                alt={`${vehicle.make} ${vehicle.model}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h2 className={styles.cardcarname}>{vehicle.make} {vehicle.model}</h2>
            <p className={styles.cardcaryear}>{vehicle.year}</p>
            <p className={styles.cardcarprice}>₹ {vehicle.price}</p>
            <button className={styles.cardbutton}>Rent Now</button>
          </div>
        ))}
      </div>
      <Link href="/Admin/ViewAllRentable" legacyBehavior passHref>
        <button className={styles.showallbutton}>
            Show All Vehicles →
        </button>
      </Link>
    </div>
  );
};

export default PopularDeals;