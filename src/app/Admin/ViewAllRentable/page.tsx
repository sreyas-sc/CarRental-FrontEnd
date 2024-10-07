'use client';
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RENTABLE_VEHICLES } from '@/graphql/mutations';
import styles from './viewallrentables.module.css';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'; // For navigation to login page
import Image from 'next/image';
import { BsFillFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { MdAirlineSeatReclineExtra } from 'react-icons/md';



interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  price: number;
  primaryImageUrl: string | null;
  description: string;
  quantity: number;
  availability: number;
  type: string;
  transmission:  string;
  fuel_type: string;
  seats: number;
}

interface GetRentableVehiclesResponse {
  getRentableVehicles: Vehicle[];
}

const vehicleTypes = ['All', 'SUV', 'Sedan', 'MUV', 'Hatchback', 'Luxury'];
const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Type'];

const ViewAllCarsPage: React.FC = () => {
  const { loading, error, data } = useQuery<GetRentableVehiclesResponse>(GET_RENTABLE_VEHICLES);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedType, setSelectedType] = useState('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState('');
  const router = useRouter(); // Router for navigation

  useEffect(() => {
    if (!loading && data?.getRentableVehicles) {
      setVehicles(data.getRentableVehicles);
    }
  }, [data, loading]);

  const handleCardClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const closePopup = () => {
    setSelectedVehicle(null);
  };

  const handleRentNowClick = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');
  
    if (!user || !token) {
      // If no user in session storage, prompt to login
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to proceed with the booking!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/Auth/Login"); // Navigate to login page
        }
      });
    } else if (selectedVehicle) {
      // Ensure selectedVehicle is not null
      const queryParams = new URLSearchParams({
        id: selectedVehicle.id,
      });
  
      router.push(`/User/BookCar?${queryParams.toString()}`); 
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Selected vehicle is not available.',
        icon: 'error',
      });
    }
  };
  

  
  

  const filteredAndSortedVehicles = vehicles
    .filter(vehicle =>
      (vehicle.make.toLowerCase().includes(filter.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(filter.toLowerCase())) &&
      (selectedType === 'All' || vehicle.type === selectedType) &&
      vehicle.price >= priceRange[0] && vehicle.price <= priceRange[1]
    )
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Type') return a.type.localeCompare(b.type);
      return 0;
    });

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = parseInt(event.target.value, 10);
    setPriceRange(prev => {
      const newRange = [...prev] as [number, number];
      newRange[index] = newValue;
      return newRange;
    });
  };

  if (loading) return <div className={styles.loaderContainer}><div className={styles.loader}></div></div>;
  console.log('Loading:', loading);
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.textcontainer}>
        <h1 className={styles.mainhead}>Find Your Perfect Ride</h1>
        <p className={styles.description}>Explore our wide range of vehicles for rent</p>
      </div>
      <div className={styles.container}>
        <div className={styles.filterContainer}>
          <input
            type="text"
            placeholder="Search cars..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={styles.searchInput}
          />
          <select onChange={handleSortChange} value={sortBy} className={styles.sortSelect}>
            <option value="">Sort by...</option>
            {sortOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <div className={styles.priceFilter}>
            <p>Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}</p>
            <div className={styles.rangeInputs}>
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                className={styles.slider}
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(e, 0)}
              />
              <input
                type="range"
                min="0"
                max="10000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(e, 1)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.carsContainer}>
        {filteredAndSortedVehicles.length > 0 ? (
          filteredAndSortedVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`${styles.carcard} ${vehicle.availability === 0 ? styles.disabledCard : ''}`}
              onClick={() => handleCardClick(vehicle)}
            >
              {vehicle.availability === 0 && <span className={styles.notAvailableOverlay}>Not Available</span>}
              <img
                src={vehicle.primaryImageUrl || 'https://via.placeholder.com/300x200'}
                alt={`${vehicle.make} ${vehicle.model}`}
                className={styles.carImage}
              />
              <div className={styles.carInfo}>
                <h2 className={styles.carName}>{vehicle.make} {vehicle.model}</h2>
                <p className={styles.carDetails}>Price: ₹{vehicle.price}/day</p>
              </div>
              <button
                className={styles.rentbutton}
                onClick={handleRentNowClick}
                disabled={vehicle.availability === 0}
              >
                Rent Now
              </button>
            </div>
          ))
        ) : (
          <div className={styles.noResultsContainer}>
            <Image src="/banners/search-not_found.jpg" alt="No Results Found" width={"500"} height={"400"} className={styles.noResultsImage} />
            <p className={styles.noResultsText}>No results found. Please try adjusting your filters.</p>
          </div>
        )}
      </div>
      {selectedVehicle && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <span className={styles.closeButton} onClick={closePopup}>&times;</span>
            <img
              src={selectedVehicle.primaryImageUrl || 'https://via.placeholder.com/500x300'}
              alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
              className={styles.popupImage}
            />
            <h2>{selectedVehicle.make} {selectedVehicle.model} {selectedVehicle.year}</h2>
            {/* <p><strong>Year:</strong> {selectedVehicle.year}</p> */}
            <p><strong>Price:</strong> ₹{selectedVehicle.price}/day</p>
            <p><strong>Available:</strong> {selectedVehicle.availability}</p>
            <div className={styles.popupdetailscontainer}>
              <p><strong><GiGearStickPattern/></strong> {selectedVehicle.transmission}</p>
              <p><strong><BsFillFuelPumpFill/></strong> {selectedVehicle.fuel_type}</p>
              <p><strong><MdAirlineSeatReclineExtra /></strong> {selectedVehicle.seats}</p>
            </div>
            <div className={styles.descriptionContainer}>
              <p>{selectedVehicle.description}</p>
            </div>
              <button className={styles.rentButton} onClick={handleRentNowClick}>Rent Now</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewAllCarsPage;
