'use client';
import DashboardLayout from '../DashBoard/page';
import styles from './add-cars.module.css';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useMutation, useQuery } from '@apollo/client';
import { GET_ALL_MAKES_MUTATION, ADD_MANUFACTURER_MUTATION } from '@/graphql/mutations';
import * as XLSX from 'xlsx'; // Import xlsx for reading Excel files

// const vehicleMakes = [
//   "Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Hyundai",
//   "Kia", "Volkswagen", "Subaru", "Mazda", "BMW", "Mercedes",
//   "Suzuki", "Koenigsegg", "Lamborghini"
// ];

interface Make {
  id: string;
  make: string;
}

interface VehiclesData {
  getAllMakesQuery: Make[];
}

const AddVehicle = () => {
  const [make, setMake] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [importedVehicles, setImportedVehicles] = useState<Make[]>([]); // Store imported vehicles

  const { loading, error, data, refetch } = useQuery<VehiclesData>(GET_ALL_MAKES_MUTATION);
  const [addVehicle] = useMutation(ADD_MANUFACTURER_MUTATION);
    // Filter state
  const [filterMake, setFilterMake] = useState('');

    // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [vehiclesPerPage] = useState(10);
  

  const handleMakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMake(value);

    // if (value) {
    //   const filteredSuggestions = vehicleMakes.filter(make =>
    //     make.toLowerCase().startsWith(value.toLowerCase())
    //   );
    //   setSuggestions(filteredSuggestions);
    // } else {
    //   setSuggestions([]);
    // }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMake(suggestion);
    setSuggestions([]);
  };

  const filteredVehicles = data?.getAllMakesQuery?.filter(vehicle => {
    return (
        filterMake ? vehicle.make.toLowerCase().includes(filterMake.toLowerCase()) : true
    );
});

    
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles?.slice(indexOfFirstVehicle, indexOfLastVehicle);
    
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addVehicle({
        variables: { make },
        update: (cache, { data: { addVehicle } }) => {
          const cachedData = cache.readQuery<VehiclesData>({ query: GET_ALL_MAKES_MUTATION });
          if (cachedData) {
            const { getAllMakesQuery } = cachedData;
            cache.writeQuery({
              query: GET_ALL_MAKES_MUTATION,
              data: { getAllCars: [...getAllMakesQuery, addVehicle] },
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
      refetch();
    } catch (err) {
      const error = err as any;
      console.error(err);
      
      // Check if it's a validation error
      if (error.graphQLErrors?.[0]?.extensions?.code === 'BAD_USER_INPUT') {
        const errors = error.graphQLErrors[0].extensions.errors;
        let errorMessage = '';
        
        // Build error message from validation errors
        errors.forEach((error: { field: string; message: string }) => {
          if (error.field === 'general') {
            errorMessage = error.message;
          } else {
            errorMessage += `${error.field}: ${error.message}\n`;
          }
        });

        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      } else if (error.graphQLErrors?.[0]?.message.includes('Duplicate Vehicle')) {
        // Handle duplicate vehicle error
        Swal.fire({
          icon: 'warning',
          title: 'Duplicate Vehicle',
          text: error.graphQLErrors[0].message,
          confirmButtonText: 'OK'
        });
      } else {
        // Handle other errors
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to add vehicle. Please try again.',
          confirmButtonText: 'Try Again'
        });
      }
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
          const vehicleData: Make[] = jsonData.map((row: any) => ({
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
      for (const Make of importedVehicles) {
        await addVehicle({
          variables: { make: Make.make},
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
        {/* <div><input type="text" name="vehicleModel" placeholder="Model" className={styles.inputfields} value={model} onChange={(e) => setModel(e.target.value)} /></div>
        <div><input type="text" name="vehicleYear" placeholder="Year" className={styles.inputfields} value={year} onChange={(e) => setYear(e.target.value)} /></div> */}

        <button className={styles.submitButton} type="submit">
          <span className={styles.circle1}></span>
          <span className={styles.circle2}></span>
          <span className={styles.circle3}></span>
          <span className={styles.circle4}></span>
          <span className={styles.circle5}></span>
          <span className={styles.text}>Add Car Make</span>
      </button>
      </form>

      {/* File Upload for Import */}
      <div className={styles.fileUploadContainer}>
      
        <button className={styles.container_btn_file}>
        <svg
          fill="#fff"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 50 50"
        >
          <path
            d="M28.8125 .03125L.8125 5.34375C.339844 
          5.433594 0 5.863281 0 6.34375L0 43.65625C0 
          44.136719 .339844 44.566406 .8125 44.65625L28.8125 
          49.96875C28.875 49.980469 28.9375 50 29 50C29.230469 
          50 29.445313 49.929688 29.625 49.78125C29.855469 49.589844 
          30 49.296875 30 49L30 1C30 .703125 29.855469 .410156 29.625 
          .21875C29.394531 .0273438 29.105469 -.0234375 28.8125 .03125ZM32 
          6L32 13L34 13L34 15L32 15L32 20L34 20L34 22L32 22L32 27L34 27L34 
          29L32 29L32 35L34 35L34 37L32 37L32 44L47 44C48.101563 44 49 
          43.101563 49 42L49 8C49 6.898438 48.101563 6 47 6ZM36 13L44 
          13L44 15L36 15ZM6.6875 15.6875L11.8125 15.6875L14.5 21.28125C14.710938 
          21.722656 14.898438 22.265625 15.0625 22.875L15.09375 22.875C15.199219 
          22.511719 15.402344 21.941406 15.6875 21.21875L18.65625 15.6875L23.34375 
          15.6875L17.75 24.9375L23.5 34.375L18.53125 34.375L15.28125 
          28.28125C15.160156 28.054688 15.035156 27.636719 14.90625 
          27.03125L14.875 27.03125C14.8125 27.316406 14.664063 27.761719 
          14.4375 28.34375L11.1875 34.375L6.1875 34.375L12.15625 25.03125ZM36 
          20L44 20L44 22L36 22ZM36 27L44 27L44 29L36 29ZM36 35L44 35L44 37L36 37Z"
          ></path>
        </svg>
        Upload File
        <input className={styles.file} name="text" type="file" accept=".xlsx, .xls" onChange={handleFileUpload}/>
        </button>
      </div>

       {importedVehicles.length > 0 && (
        <div className={styles.vehicleTableImport}>
          <h2 className={styles.impoertedHeader}>Imported Vehicles</h2>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2">Make</th>
                {/* <th className="px-4 py-2">Model</th>
                <th className="px-4 py-2">Year</th> */}
              </tr>
            </thead>
            <tbody>
              {importedVehicles.map((vehicle, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="border px-4 py-2">{vehicle.make}</td>
                  {/* <td className="border px-4 py-2">{vehicle.model}</td>
                  <td className="border px-4 py-2">{vehicle.year}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
                   
        <button className={styles.submitButton} type="submit" onClick={handleBulkAddVehicles}>
          <span className={styles.circle1}></span>
          <span className={styles.circle2}></span>
          <span className={styles.circle3}></span>
          <span className={styles.circle4}></span>
          <span className={styles.circle5}></span>
          <span className={styles.text}>Add Imported Vehicles</span>
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
      </div>

     
      <table className={styles.vehicleTable}>
          <thead>
            <tr>
              <th >Make</th>
              {/* <th >Model</th>
              <th>Year</th> */}
            </tr>
          </thead>
          <tbody>
            {currentVehicles?.length ? (
              currentVehicles.map((vehicle: Make) => (
                <tr key={vehicle.id} className={currentVehicles.indexOf(vehicle) % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="border px-4 py-2">{vehicle.make}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="border px-4 py-2 text-center">No vehicles found.</td>
              </tr>
            )}
          </tbody>
        </table>

        
        <div className={styles.pagination_container}>
          {Array.from({ length: Math.ceil((filteredVehicles?.length || 0) / vehiclesPerPage) }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              className={`${styles.pagination_button} ${currentPage === i + 1 ? styles.active : ""}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

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