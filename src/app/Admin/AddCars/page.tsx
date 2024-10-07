'use client';
import DashboardLayout from '../DashBoard/page';
import styles from './add-cars.module.css';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_VEHICLES_MUTATION, ADD_VEHICLE_MUTATION } from '@/graphql/mutations';
import * as XLSX from 'xlsx'; // Import xlsx for reading Excel files

const vehicleMakes = [
  "Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Hyundai",
  "Kia", "Volkswagen", "Subaru", "Mazda", "BMW", "Mercedes",
  "Suzuki", "Koenigsegg", "Lamborghini"
];

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
}

interface VehiclesData {
  getAllCars: Vehicle[];
}

const AddVehicle = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [importedVehicles, setImportedVehicles] = useState<Vehicle[]>([]); // Store imported vehicles

  const { loading, error, data, refetch } = useQuery<VehiclesData>(GET_ALL_VEHICLES_MUTATION);
  const [addVehicle] = useMutation(ADD_VEHICLE_MUTATION);

    // Filter state
  const [filterMake, setFilterMake] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterYear, setFilterYear] = useState('');

  const handleMakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMake(value);

    if (value) {
      const filteredSuggestions = vehicleMakes.filter(make =>
        make.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMake(suggestion);
    setSuggestions([]);
  };

  const filteredVehicles = data?.getAllCars.filter(vehicle => {
        return (
          (filterMake ? vehicle.make.toLowerCase().includes(filterMake.toLowerCase()) : true) &&
          (filterModel ? vehicle.model.toLowerCase().includes(filterModel.toLowerCase()) : true) &&
          (filterYear ? vehicle.year.includes(filterYear) : true)
        );
      });
    

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVehicle({
        variables: { make, model, year },
        update: (cache, { data: { addVehicle } }) => {
          const cachedData = cache.readQuery<VehiclesData>({ query: GET_ALL_VEHICLES_MUTATION });
          if (cachedData) {
            const { getAllCars } = cachedData;
            cache.writeQuery({
              query: GET_ALL_VEHICLES_MUTATION,
              data: { getAllCars: [...getAllCars, addVehicle] },
            });
          }
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Vehicle added successfully!',
        confirmButtonText: 'OK'
      });

      setMake('');
      setModel('');
      setYear('');
      refetch();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to add vehicle',
        confirmButtonText: 'Try Again'
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        if (typeof data === 'string') {
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // Map the parsed data into Vehicle format
          const vehicleData: Vehicle[] = jsonData.map((row: any) => ({
            id: '', // Placeholder ID since it's not present in the imported data
            make: row['Make'],
            model: row['Model'],
            year: row['Year'].toString(),
          }));

          setImportedVehicles(vehicleData); // Store the imported data in the state
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleBulkAddVehicles = async () => {
    try {
      for (const vehicle of importedVehicles) {
        await addVehicle({
          variables: { make: vehicle.make, model: vehicle.model, year: vehicle.year },
        });
      }
      refetch();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'All vehicles have been successfully imported!',
      });
      setImportedVehicles([]); // Clear imported vehicles after successful insertion
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Import Error',
        text: 'Failed to import vehicles from the file.',
      });
    }
  };

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p>Error loading vehicles: {error.message}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Add Vehicle</h1>
      <form className={styles.form} onSubmit={handleAddVehicle}>
        {/* Form Fields */}
        <div>
          <input
            type="text"
            name="vehicleName"
            placeholder="Make"
            className={styles.inputfields}
            value={make}
            onChange={handleMakeChange}
          />
          {suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={styles.suggestionItem}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div><input type="text" name="vehicleModel" placeholder="Model" className={styles.inputfields} value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div><input type="text" name="vehicleYear" placeholder="Year" className={styles.inputfields} value={year} onChange={(e) => setYear(e.target.value)} /></div>
        <button type="submit" className={styles.submitbutton}>Add Vehicle</button>
      </form>

      {/* File Upload for Import */}
      <div className={styles.fileUploadContainer}>
        <h2 className={styles.header}>Import Vehicles</h2>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className={styles.fileUpload} />
      </div>

      {/* Show Imported Vehicles Table */}
      {importedVehicles.length > 0 && (
        <div className={styles.importedDataContainer}>
          <h2 className={styles.header}>Imported Vehicles</h2>
          <table className={styles.vehicleTable}>
            <thead>
              <tr>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>
              {importedVehicles.map((vehicle, index) => (
                <tr key={index}>
                  <td>{vehicle.make}</td>
                  <td>{vehicle.model}</td>
                  <td>{vehicle.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className={styles.importButton} onClick={handleBulkAddVehicles}>
            Insert All Imported Vehicles
          </button>
        </div>
      )}

<h2 className={styles.header}>Vehicle List</h2>
      <div className={styles.filterContainer}>
        <input
          type="text"
          placeholder="Filter by Make"
          value={filterMake}
          onChange={(e) => setFilterMake(e.target.value)}
          className={styles.filterfields}
        />
        <input
          type="text"
          placeholder="Filter by Model"
          value={filterModel}
          onChange={(e) => setFilterModel(e.target.value)}
          className={styles.filterfields}
        />
        <input
          type="text"
          placeholder="Filter by Year"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className={styles.filterfields}
        />
      </div>

      <table className={styles.vehicleTable}>
        <thead>
          <tr>
            <th>Make</th>
            <th>Model</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          {filteredVehicles?.length ? (
            filteredVehicles.map((vehicle: Vehicle) => (
              <tr key={vehicle.id}>
                <td>{vehicle.make}</td>
                <td>{vehicle.model}</td>
                <td>{vehicle.year}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No vehicles found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const AddVehiclePage = () => {
  return (
    <DashboardLayout>
      <AddVehicle />
    </DashboardLayout>
  );
};

export default AddVehiclePage;
