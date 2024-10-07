'use client';
import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import DashboardLayout from '../DashBoard/page';
import styles from './adminViewCars.module.css';
import Swal from 'sweetalert2'; 
import { GET_RENTABLE_VEHICLES, DELETE_RENTABLE_VEHICLE, UPDATE_RENTABLE_VEHICLE } from '@/graphql/mutations';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: String;
  price: number;
  quantity: number;
  availability: number;
  transmission: String;
  fuel_type:  String;
  seats: number;
  primaryImageUrl: string | null;
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
  const { loading, error, data } = useQuery<GetRentableVehiclesResponse>(GET_RENTABLE_VEHICLES);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
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
      console.log(data.getRentableVehicles);
    }
  }, [data, loading]);

  if (loading) return 
  <p>Loading...</p>;
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

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.model.toLowerCase().includes(filter.toLowerCase())
  );

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
  
    const { id, make, model, year, price, quantity, availability, transmission, fuel_type, seats,  description } = selectedVehicle;   
  
    try {
      console.log("make is", make)
      const response = await updateRentableVehicle({
        variables: { 
          id, 
          make,  // New make
          model,  // New model
          year: String(year),  // Ensure year is a number
          price: Number(price),  // Ensure price is a number
          quantity: Number(quantity),  // Ensure quantity is a number
          availability: Number(availability),
          transmission: String(transmission),
          fuel_type: String(fuel_type),
          seats: Number(seats),
          description,  // New description
        },
        
      });
  
      // Check if response and data are defined
      const updateResponse = response.data?.updateRentableVehicle;
  
      if (updateResponse) {
        // Check if the update was successful
        if (updateResponse.success) {
          setVehicles((prevVehicles) => 
            prevVehicles.map((vehicleItem) => 
              vehicleItem.id === id ? updateResponse.vehicle : vehicleItem
            )
          );
          Swal.fire('Updated!', updateResponse.message, 'success');
          setIsEditing(false);
          setSelectedVehicle(null);
        } else {
          // Handle case where update was not successful
          Swal.fire('Error!', updateResponse.message || 'Failed to update vehicle. Please try again.', 'error');
        }
      } else {
        // Handle case where updateResponse is undefined
        Swal.fire('Error!', 'No vehicle data returned. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      // Handle error with a more specific message if possible
      Swal.fire('Error!', error as string);
    }    
  };
  

  return (
    <div className={styles.cardContainer}>
      <div className={styles.group}>
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.searchicon}>
          <g>
            <path
              d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z">
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

      <div className={styles.vehicleCardContainer}>
        {filteredVehicles.map((vehicle) => (
          <div className={styles.card} key={vehicle.id}>
            <img
              className={styles.cardImage}
              src={vehicle.primaryImageUrl || 'https://via.placeholder.com/150'}
              alt={`${vehicle.make} ${vehicle.model}`}
            />
            <div className={styles.cardBody}>
              <h2 className={styles.cardTitle}>
                {vehicle.make} {vehicle.model}
              </h2>
              
              <p><strong>Year:</strong> {vehicle.year}</p>
              <p><strong>Price:</strong>{vehicle.price}</p>
              <p><strong>Description:</strong> {vehicle.description}</p>
              <p><strong>Quantity:</strong> {vehicle.quantity} </p>
              <p><strong>Available Quantity:</strong>{vehicle.availability} </p>
              <p><strong>Transmission Type:</strong>{vehicle.transmission} </p>
              <p><strong>Fuel Type:</strong>{vehicle.fuel_type} </p>
              <p><strong>Numnber of Seats:</strong>{vehicle.seats} </p>



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
        ))}
      </div>

      {/* Popup Form for Editing Vehicle */}
      {isEditing && selectedVehicle && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <span className={styles.close} onClick={() => setIsEditing(false)}>&times;</span>
            <h2>Edit Vehicle</h2>
            <form onSubmit={handleUpdate}>
              <div className={styles.popupformcontrols}>
                <div className={styles.controlandlabel}>
                  <span>Make:</span>
                  <input
                     className={styles.popupinput}
                    readOnly
                    type="text" 
                    value={selectedVehicle.make} 
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, make: e.target.value })} 
                    required 
                  />
                </div>

                <div className={styles.controlandlabel}>
                  <span>Model:</span>
                  <input
                     className={styles.popupinput}
                    readOnly
                    type="text" 
                    value={selectedVehicle.model} 
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, model: e.target.value })} 
                    required 
                  />
                </div>

                <div className={styles.controlandlabel}>
                  <span>Year:</span>
                  <input
                    className={styles.popupinput}
                    readOnly 
                    type="text"  // Change type to text
                    value={selectedVehicle.year.toString()}  // Convert number to string
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, year: String(e.target.value) })} 
                    required 
                  />
                </div>


                <div className={styles.controlandlabel}>
                  <span>Price:</span>
                  <input
                    className={styles.popupinput}
                    type="number" 
                    value={selectedVehicle.price} 
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, price: Number(e.target.value) })} 
                    required 
                  />
                </div>

                <div className={styles.controlandlabel}>
                  <span>Quantity:</span>
                  <input
                    className={styles.popupinput}
                    type="number" 
                    value={selectedVehicle.quantity} 
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, quantity: Number(e.target.value) })} 
                    required 
                  />
                </div>

                <div className={styles.controlandlabel}>
                  <span>Description:</span>
                  <textarea 
                    className={styles.popuptextarea}
                    value={selectedVehicle.description} 
                    onChange={(e) => setSelectedVehicle({ ...selectedVehicle, description: e.target.value })} 
                    required 
                  />
                </div>

                <button type="submit" className= {styles.updateButton}>Update Vehicle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


const AdminViewRentableCarsPage = () =>{
  return (
    <DashboardLayout>
      <AdminViewCars/>
    </DashboardLayout>
  )
}
export default AdminViewRentableCarsPage;
