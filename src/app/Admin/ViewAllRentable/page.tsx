'use client';
import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { GET_AVAILABLE_CARS } from '@/graphql/mutations'; // Change your GraphQL query accordingly
import styles from './viewallrentables.module.css';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { BsFillFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { MdAirlineSeatReclineExtra } from 'react-icons/md';
import { DatePicker, Space } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';



dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  price: number;
  primaryImageUrl: string | null;
  additionalImageUrls : string | null;
  description: string;
  quantity: number;
  availability: number;
  type: string;
  transmission: string;
  fuel_type: string;
  seats: number;
  totalAmount: number;
}

interface GetAvailableCarsResponse {
  getAvailableCars: Vehicle[];
}

const ViewAllCarsPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [sortBy, setSortBy] = useState('');
  const [fetchAvailableCars, { loading, error, data }] = useLazyQuery<GetAvailableCarsResponse>(GET_AVAILABLE_CARS);
  const router = useRouter();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);


  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');

  // State for date popup
  const [showDatePopup, setShowDatePopup] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (data?.getAvailableCars) {
      setVehicles(data.getAvailableCars);
    }
  }, [data]);

  const calculateDaysBetween = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

      // Function to disable past dates and prevent invalid date ranges
    const disabledDate = (current: dayjs.Dayjs) => {
      return current && current < dayjs().startOf('day'); // Disable past dates
    };

    const handleDateChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
      if (dates && dates[0] && dates[1]) {
        const start = dates[0];
        const end = dates[1];
    
        // Check if the selected range is valid
        if (end.diff(start, 'day') < 1) {
          Swal.fire({
            title: 'Error',
            text: 'There must be at least a 1-day gap between the pick-up date and drop-off dates.',
            icon: 'error',
          });
          setDateRange(null);
        } else {
          setDateRange(dates);
        }
      } else {
        setDateRange(dates);
      }
    };

  // courosel section
  const getImageUrl = (url: string | null): string => {
    return url || '/placeholder.png';
  };

  const getImageUrls = (vehicle: Vehicle): string[] => {
    const urls = [getImageUrl(vehicle.primaryImageUrl)];
    if (vehicle.additionalImageUrls && Array.isArray(vehicle.additionalImageUrls)) {
      urls.push(...vehicle.additionalImageUrls.map(getImageUrl));
    }
    return urls;
  };
  

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (selectedVehicle) {
      setImageUrls(getImageUrls(selectedVehicle));
      setCurrentImageIndex(0);
    }
  }, [selectedVehicle]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + imageUrls.length) % imageUrls.length);
  };

  // courosel section

  useEffect(() => {
    if (data?.getAvailableCars) {
      const daysBooked = calculateDaysBetween(selectedStartDate, selectedEndDate);
      const vehiclesWithTotalAmount = data.getAvailableCars.map(vehicle => ({
        ...vehicle,
        totalAmount: vehicle.price * daysBooked
      }));
      setVehicles(vehiclesWithTotalAmount);
    }
  }, [data, selectedStartDate, selectedEndDate]);

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
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to proceed with the booking!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel',
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/Auth/Login");
        }
      });
    } else if (selectedVehicle && selectedStartDate && selectedEndDate) {
      const queryParams = new URLSearchParams({
        id: selectedVehicle.id,
        fromdate: selectedStartDate,
        todate: selectedEndDate,
        amount: selectedVehicle.totalAmount.toString(),
      });
      router.push(`/User/BookCar?${queryParams.toString()}`);
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Please select valid dates and vehicle for booking.',
        icon: 'error',
      });
    }
  };
  

  // Function to handle date submission
  const handleDateSubmit = () => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      setSelectedStartDate(startDate);
      setSelectedEndDate(endDate);
      fetchAvailableCars({
        variables: { startdate: startDate, enddate: endDate },
      });
      setShowDatePopup(false);
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Please select both start and end dates.',
        icon: 'error',
      });
    }
  };


  const openDatePopup = () => {
    if (selectedStartDate && selectedEndDate) {
      setDateRange([dayjs(selectedStartDate), dayjs(selectedEndDate)]);
    }
    setShowDatePopup(true);
  };

  const filteredAndSortedVehicles = vehicles
    .filter(vehicle =>
      (vehicle.make.toLowerCase().includes(filter.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(filter.toLowerCase())) &&
      vehicle.price >= 0 // Adjust price filtering logic as needed
    )
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Type') return a.type.localeCompare(b.type);
      return 0;
    });

  if (loading) return <div className={styles.loaderContainer}><div className={styles.loader}></div></div>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className={styles.mainContainer}>
      <div className={styles.textcontainer}>
        <h1 className={styles.mainhead}>Find Your Perfect Ride</h1>
        <p className={styles.description}>Explore our wide range of vehicles for rent</p>
      </div>


      {selectedStartDate && selectedEndDate && (
    <div className={styles.selectedDates}>
      <p>Selected Dates: {selectedStartDate} to {selectedEndDate}</p>
      <button onClick={openDatePopup} className={styles.changeDateButton}>Change Dates</button>
    </div>
  )}

      {/* Date Popup */}
      {showDatePopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h2 className={styles.popupheader}>Select Dates</h2>
            <Space direction="vertical" size={12}>
              <RangePicker
                value={dateRange}
                onChange={handleDateChange}
                format="YYYY-MM-DD"
                disabledDate={disabledDate} // Disable past dates
              />
            </Space>
            <div className={styles.popupButtonContainer}>
              <button onClick={handleDateSubmit} className={styles.dateButton}>View Available Vehicles</button>
              <button onClick={() => setShowDatePopup(false)} className={styles.closeButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
          </select>
        </div>
        
       
        {vehicles.length === 0 && !loading && (
          <div className={styles.noVehiclesContainer}>
          <Image
            src="/banners/search-not_found.jpg"
            width={300}
            height={300}
            alt="No cars available"
            className={styles.noVehiclesImage}
          />
          <p className={styles.noVehiclesText}>No vehicles available for the selected dates. Please try different dates.</p>
        </div>
        )}

        <div className={styles.vehiclesContainer}>
          {filteredAndSortedVehicles.map(vehicle => (
            <div key={vehicle.id} className={styles.vehicleCard} onClick={() => handleCardClick(vehicle)}>
              <Image
                src={vehicle.primaryImageUrl || '/placeholder.png'}
                alt={`${vehicle.make} ${vehicle.model}`}
                width={300}
                height={200}
                className={styles.vehicleImage}
              />
              <h2 className={styles.vehicleTitle}>{`${vehicle.make} ${vehicle.model}`}</h2>
              <p className={styles.vehicleYear}>{vehicle.year}</p>
              <p className={styles.vehiclePrice}>₹{vehicle.price}/day</p>
              {selectedStartDate && selectedEndDate && (
                <p className={styles.totalAmount}>Total: ₹{vehicle.totalAmount}</p>
              )}
              <div className={styles.vehicleDetails}>
                <div className={styles.detailItem}>
                  <BsFillFuelPumpFill /> <span>{vehicle.fuel_type}</span>
                </div>
                <div className={styles.detailItem}>
                  <GiGearStickPattern /> <span>{vehicle.transmission}</span>
                </div>
                <div className={styles.detailItem}>
                  <MdAirlineSeatReclineExtra /> <span>{vehicle.seats} seats</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Popup for Selected Vehicle */}
        {selectedVehicle && (
          <div className={styles.popupOverlay} onClick={closePopup}>
            <div className={styles.popupContent} onClick={e => e.stopPropagation()}>
              <h2>{`${selectedVehicle.make} ${selectedVehicle.model}`}</h2>
              <div className={styles.imageCarousel}>
              <button onClick={prevImage} className={styles.carouselButton}>&#10094;</button>
              <Image
                src={imageUrls[currentImageIndex]}
                alt={`${selectedVehicle.make} ${selectedVehicle.model}`}
                width={400}
                height={250}
                className={styles.carouselImage}
              />
              <button onClick={nextImage} className={styles.carouselButton}>&#10095;</button>
            </div>
              <p>{selectedVehicle.description}</p>
              <p>Price: ₹{selectedVehicle.price}/day</p>
              {selectedStartDate && selectedEndDate && (
                <p className={styles.totalAmountPopup}>Total: ₹{selectedVehicle.totalAmount}</p>
              )}

              <div className={styles.popupCarOtherDetails}>
                <div className={styles.detailItemPopup}>
                  <BsFillFuelPumpFill /> <span>{selectedVehicle.fuel_type}</span>
                </div>
                <div className={styles.detailItemPopup}>
                  <GiGearStickPattern /> <span>{selectedVehicle.transmission}</span>
                </div>
                <div className={styles.detailItemPopup}>
                  <MdAirlineSeatReclineExtra /> <span>{selectedVehicle.seats} seats</span>
                </div>
              </div>
              <div className={styles.popupButtonContainer}>
                <button onClick={handleRentNowClick} className={styles.rentNowButton}>Rent Now</button>
                <button onClick={closePopup} className={styles.closeButton}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllCarsPage;
