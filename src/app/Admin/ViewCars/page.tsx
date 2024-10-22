'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import DashboardLayout from '../DashBoard/page';
import styles from './adminViewCars.module.css';
import Swal from 'sweetalert2'; 
import { BsFillFuelPumpFill } from "react-icons/bs";
import { GiGearStickPattern } from "react-icons/gi";
import { MdAirlineSeatReclineExtra } from 'react-icons/md';
import { GET_RENTABLE_VEHICLES, DELETE_RENTABLE_VEHICLE, UPDATE_RENTABLE_VEHICLE } from '@/graphql/mutations';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  price: number;
  quantity: number;
  availability: boolean;
  transmission: string;
  fuel_type: string;
  seats: number;
  primaryImageUrl: string | null;
  additionalImageUrls: string[] | null;
  description: string;
}

interface GetRentableVehiclesResponse {
  getRentableVehicles: Vehicle[];
}

interface DeleteRentableVehicleResponse {
  deleteRentableVehicle: {
    success: boolean;
    message: string;
  };
}

interface UpdateRentableVehicleResponse {
  updateRentableVehicle: {
    success: boolean;
    message: string;
    vehicle: Vehicle;
  };
}

const AdminViewCars: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [newPrimaryImage, setNewPrimaryImage] = useState<File | null>(null);
  const [newAdditionalImages, setNewAdditionalImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement>(null);

  const { loading, error, data } = useQuery<GetRentableVehiclesResponse>(GET_RENTABLE_VEHICLES);

  const [deleteRentableVehicle] = useMutation<DeleteRentableVehicleResponse>(DELETE_RENTABLE_VEHICLE, {
    onError: (error) => {
      Swal.fire('Error!', `Failed to delete vehicle: ${error.message}`, 'error');
    },
  });

  const [updateRentableVehicle] = useMutation<UpdateRentableVehicleResponse>(UPDATE_RENTABLE_VEHICLE, {
    onError: (error) => {
      Swal.fire('Error!', `Failed to update vehicle: ${error.message}`, 'error');
    },
  });

  useEffect(() => {
    if (!loading && data?.getRentableVehicles) {
      setVehicles(data.getRentableVehicles);
    }
  }, [data, loading]);

  useEffect(() => {
    const cards = document.querySelectorAll('.card') as NodeListOf<HTMLElement>;
    const heights = Array.from(cards).map(card => card.clientHeight);
    const maxHeight = Math.max(...heights);
    cards.forEach(card => {
      card.style.height = `${maxHeight}px`;
    });
  }, [vehicles]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error fetching vehicles: {error.message}</p>;

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditing(true);
  };

  const handleDelete = async (vehicleId: string) => {
    const confirmDelete = await Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this vehicle!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirmDelete.isConfirmed) {
      try {
        const response = await deleteRentableVehicle({ variables: { id: vehicleId } });
        if (response.data?.deleteRentableVehicle.success) {
          setVehicles((prevVehicles) => prevVehicles.filter(vehicle => vehicle.id !== vehicleId));
          Swal.fire('Deleted!', response.data.deleteRentableVehicle.message, 'success');
        }
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete vehicle. Please try again.', 'error');
      }
    }
  };

  const handlePrimaryImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewPrimaryImage(file);
    }
  };

  const handleAdditionalImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setNewAdditionalImages(Array.from(files));
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;

    const { id, make, model, year, price, quantity, availability, transmission, fuel_type, seats, description } = selectedVehicle;

    try {
      const response = await updateRentableVehicle({
        variables: { 
          id, 
          make,
          model,
          year,
          price: Number(price),
          quantity: Number(quantity),
          availability,
          transmission,
          fuel_type,
          seats: Number(seats),
          description,
          primaryImage: newPrimaryImage,
          additionalImages: newAdditionalImages
        },
      });

      const updateResponse = response.data?.updateRentableVehicle;

      if (updateResponse) {
        if (updateResponse.success) {
          setVehicles((prevVehicles) => 
            prevVehicles.map((vehicleItem) => 
              vehicleItem.id === id ? updateResponse.vehicle : vehicleItem
            )
          );
          Swal.fire('Updated!', updateResponse.message, 'success');
          setIsEditing(false);
          setSelectedVehicle(null);
          setNewPrimaryImage(null);
          setNewAdditionalImages([]);
        } else {
          Swal.fire('Error!', updateResponse.message || 'Failed to update vehicle. Please try again.', 'error');
        }
      } else {
        Swal.fire('Error!', 'No vehicle data returned. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      Swal.fire('Error!', 'An unexpected error occurred. Please try again.');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.model.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={styles.cardContainer}>
      {/* Search input */}
      <div className={styles.group}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.searchicon}>
          <g>
            <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z">
            </path>
          </g>
        </svg>
        <input
          id="query"
          className={styles.input}
          type="search"
          placeholder="Search..."
          name="searchbar"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Vehicle cards */}
      {/* <div className={styles.vehicleCardContainer}>
        {filteredVehicles.map((vehicle) => (
          <div className={styles.card} key={vehicle.id}>
            <img
              className={styles.cardImage}
              src={vehicle.primaryImageUrl || 'https://via.placeholder.com/150'}
              alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
            />
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>
                {vehicle.make} {vehicle.model} {vehicle.year}
              </h2>
              <p><strong>Price:</strong> {vehicle.price}</p>
              <p><strong>Quantity:</strong> {vehicle.quantity}</p>
              <p><strong>Available:</strong> {vehicle.availability ? 'Yes' : 'No'}</p>
              <div className={styles.specs}>
                <p><GiGearStickPattern/> {vehicle.transmission}</p>
                <p><BsFillFuelPumpFill/> {vehicle.fuel_type}</p>
                <p><MdAirlineSeatReclineExtra/> {vehicle.seats}</p>
              </div>
              <div className={styles.descriptionContainer}>
                <p>{vehicle.description}</p>
              </div>
              <div className={styles.deleteAndUpdateButtonContainer}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEdit(vehicle)}
                >
                  Edit
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(vehicle.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div> */}
      <div className={styles.vehicleCardContainer}>
        {filteredVehicles.length === 0 ? (
          <div className={styles.noCarsContainer}>
            <img
              src="/banners/not_found_1.jpg"
              alt="No cars available"
              className={styles.noCarsImage}
            />
            <p>No vehicles available</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div className={styles.card} key={vehicle.id}>
              <img
                className={styles.cardImage}
                src={vehicle.primaryImageUrl || 'https://via.placeholder.com/150'}
                alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
              />
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>
                  {vehicle.make} {vehicle.model} {vehicle.year}
                </h2>
                <p><strong>Price:</strong> {vehicle.price}</p>
                <p><strong>Quantity:</strong> {vehicle.quantity}</p>
                <p><strong>Available:</strong> {vehicle.availability ? 'Yes' : 'No'}</p>
                <div className={styles.specs}>
                  <p><GiGearStickPattern /> {vehicle.transmission}</p>
                  <p><BsFillFuelPumpFill /> {vehicle.fuel_type}</p>
                  <p><MdAirlineSeatReclineExtra /> {vehicle.seats}</p>
                </div>
                <div className={styles.descriptionContainer}>
                  <p>{vehicle.description}</p>
                </div>
                <div className={styles.deleteAndUpdateButtonContainer}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(vehicle)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(vehicle.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit popup */}
      {isEditing && selectedVehicle && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <span className={styles.close} onClick={() => setIsEditing(false)}>&times;</span>
            {/* <h2>Edit Vehicle</h2> */}
            <form onSubmit={handleUpdate} className={styles.form}>
              <div className={styles.imagePreview} onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={newPrimaryImage ? URL.createObjectURL(newPrimaryImage) : (selectedVehicle.primaryImageUrl || 'https://via.placeholder.com/150')} 
                  alt="Primary vehicle image preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handlePrimaryImageChange}
                  accept="image/*"
                />
                <p>Click to update primary image</p>
              </div>
              
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>Make:</td>
                    <td><input
                      className={styles.popupinput}
                      type="text" 
                      value={selectedVehicle.make} 
                      onChange={(e) => setSelectedVehicle({ ...selectedVehicle, make: e.target.value })} 
                      required 
                    /></td>
                  </tr>
                  <tr>
                    <td>Model:</td>
                    <td><input
                      className={styles.popupinput}
                      type="text" 
                      value={selectedVehicle.model} 
                      onChange={(e) => setSelectedVehicle({ ...selectedVehicle, model: e.target.value })} 
                      required 
                    /></td>
                  </tr>
                  <tr>
                    <td>Year:</td>
                    <td><input
                      className={styles.popupinput}
                      type="text"
                      value={selectedVehicle.year}
                      onChange={(e) => setSelectedVehicle({ ...selectedVehicle, year: e.target.value })} 
                      required 
                    /></td>
                  </tr>
                  <tr>
                    <td>Price:</td>
                    <td><input
                      className={styles.popupinput}
                      type="number" 
                      value={selectedVehicle.price} 
                      onChange={(e) => setSelectedVehicle({ ...selectedVehicle, price: Number(e.target.value) })} 
                      required 
                    /></td>
                  </tr>
                  <tr>
                    <td>Quantity:</td>
                    <td><input
                      className={styles.popupinput}
                      type="number" 
                      value={selectedVehicle.quantity} 
                      onChange={(e) => setSelectedVehicle({ ...selectedVehicle, quantity: Number(e.target.value) })} 
                      required 
                    /></td>
                  </tr>
                  <tr>
                    <td>Description:</td>
                    <td><textarea 
                      className={styles.popuptextarea}
                      value={selectedVehicle.description} 
                      onChange={(e) => setSelectedVehicle({ ...selectedVehicle, description: e.target.value })} 
                      required 
                    /></td>
                  </tr>
                </tbody>
              </table>
              
              <div className={styles.popupformcontrols}>
                <button type="submit" className={styles.updateButton}>Update Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminViewRentableCarsPage = () => {
  return (
    <DashboardLayout>
      <AdminViewCars/>
    </DashboardLayout>
  )
}

export default AdminViewRentableCarsPage;