'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../DashBoard/page';
import styles from './add-rentable-vehicles.module.css';
import { useLazyQuery, useMutation } from '@apollo/client';
import { ADD_RENTABLE_VEHICLE_MUTATION, GET_ALL_MAKES, GET_MODELS_BY_MAKE } from '@/graphql/mutations';
import Swal from 'sweetalert2';
import { MdDelete } from "react-icons/md"


const AddRentableVehicles: React.FC = () => {
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<{ model: string; year: string }[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [availability, setAvailability] = useState<number>(1);
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [selectedTransmission, setSelectedTransmission] = useState<string>('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [seats, setSeats] = useState<number>();



  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null);

  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
 

  const [getMakes] = useLazyQuery(GET_ALL_MAKES, {
    onCompleted: (data) => setMakes(data.getAllMakes),
  });

  const [getModels] = useLazyQuery(GET_MODELS_BY_MAKE, {
    variables: { make: selectedMake },
    onCompleted: (data) => setModels(data.getModelsByMake),
  });

  const [addRentableVehicle] = useMutation(ADD_RENTABLE_VEHICLE_MUTATION);

  useEffect(() => {
    getMakes();
  }, [getMakes]);

  useEffect(() => {
    if (selectedMake) {
      getModels();
    }
  }, [selectedMake, getModels]);

 
  const handlePrimaryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPrimaryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrimaryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if(additionalImages.length + files.length > 3)
    {
      Swal.fire({
        title: 'Maximum 3 images are allowed',
        icon: 'error',
        allowOutsideClick: true,
      });
      return;
    }

    setAdditionalImages((prevImages) => [...prevImages, ...files]);
    
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImagePreviews((prevPreviews) => [...prevPreviews, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setAdditionalImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Basic validation
    if (!selectedMake || !selectedModel || !selectedYear || price <= 0 || quantity <= 0) {
      alert('Please fill all required fields and ensure price and quantity are positive numbers.');
      return;
    }
  
    // Validate that a primary image is uploaded
    if (!primaryImage) {
      alert('Please upload a primary image.');
      return;
    }
  
    // Show loader (UI feedback)
    Swal.fire({
      title: 'Adding Vehicle...',
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    
  
    try {
      const { data } = await addRentableVehicle({
        variables: {
          input: {
            make: selectedMake,
            model: selectedModel,
            year: selectedYear,
            price: price,
            quantity: quantity,
            availability: availability,
            transmission: selectedTransmission,
            fuel_type: selectedFuelType,
            seats: seats,
            description: description,
          },
          primaryImage: primaryImage,
          additionalImages: additionalImages,
        },
      });
  
      console.log("Vehicle Added:", data);
  
      // Hide loader and show success message
      Swal.fire('Vehicle Added Successfully!', '', 'success');
  
      // Reset form fields after successful submission
      resetForm();
    } catch (error) {
      console.error("Error Adding Vehicle:", error);
  
      // Show error message
      Swal.fire('Error Adding Vehicle!', '', 'error');
    }
  };
  
  // Function to reset form after successful submission
  const resetForm = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setPrice(0);
    setQuantity(0);
    // setAvailability(true);
    setSelectedTransmission('');
    setSelectedFuelType('');
    setSeats(1);
    setDescription('');
    setPrimaryImage(null);
    setAdditionalImages([]);
    setPrimaryImagePreview('');
    setAdditionalImagePreviews([]);
  };
  


  const handleAddImageField = () => {
    setAdditionalImages([...additionalImages, new File([], '')]);
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + amount)));
    setAvailability((prev) => Math.max(1, Math.min(10, prev + amount)));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Add Rentable Cars</h1>
      <form className={styles.form} onSubmit={handleAddVehicle}>
        {/* Vehicle Make Dropdown */}
        <div className={styles.sectionContainer}>
          <div className={styles.firstSection}>
            <div>
              <select
                name="vehicleMake"
                className={styles.inputfields}
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
              >
                <option value="" disabled>
                  Select Make
                </option>
                {makes.map((make, index) => (
                  <option key={index} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>
            {/* Model Dropdown */}
            <div>
            <select
              name="vehicleModel"
              className={styles.inputfields}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedMake}
            >
              <option value="" disabled>
                Select Model
              </option>
              {models.map((modelYear, index) => (
                <option key={index} value={modelYear.model}>
                  {modelYear.model}
                </option>
              ))}
            </select>
            </div>
            {/* Year Dropdown */}
            <div>
              <select
                name="vehicleYear"
                className={styles.inputfields}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                disabled={!selectedModel}
              >
                <option value="" disabled>
                  Select Year
                </option>
                {models
                  .filter((modelYear) => modelYear.model === selectedModel)
                  .map((modelYear, index) => (
                    <option key={index} value={modelYear.year}>
                      {modelYear.year}
                    </option>
                  ))}
              </select>
            </div>
          </div>


          <div className={styles.secondSection}>
              {/* Transmission Type Dropdown */}
              <div>
                <select
                  name="transmissionType"
                  className={styles.inputfields}
                  value={selectedTransmission}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                >
                  <option value="" disabled>
                    Select Transmission Type
                  </option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Semi-Automatic">Semi-Automatic</option>
                </select>
              </div>
              {/* Fuel Type Dropdown */}
              <div>
                <select
                  name="fuelType"
                  className={styles.inputfields}
                  value={selectedFuelType}
                  onChange={(e) => setSelectedFuelType(e.target.value)}
                >
                  <option value="" disabled>
                    Select Fuel Type
                  </option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electiric</option>
                </select>
              </div>
              {/* Number of Seats Input */}
              <div>
                <input
                  type="number"
                  max={10}
                  min={1}
                  placeholder="Number of Seats"
                  value={seats}
                  // onChange={(e) => setSeats(Number(e.target.value))}
                  onChange={(e) => {
                    const value = Math.max(1, Math.min(10, Number(e.target.value))); // Ensure value stays between 1 and 10
                    setSeats(value);
                  }}
                  className={styles.inputfields}
                />
              </div>
          </div>
          
        {/* Description Textarea */}
        <div>
          <textarea
            placeholder="Description"
            className={styles.description}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        </div>

        {/* Price Input */}
        <div className={styles.priceContainer}>
          <span className={styles.currencySymbol}>₹</span>
          <input
            type="number"
            name="price"
            placeholder="Price"
            className={styles.price}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>

        {/* Quantity Input */}
        <label>Quantity</label>
        <div className={styles.quantityContainer}>
          <button type="button" className={styles.quantityButtonMinus} onClick={() => handleQuantityChange(-1)}>
            -
          </button>
          <input type="text" value={quantity} readOnly className={styles.quantityDisplay} />
          <button type="button" className={styles.quantityButton} onClick={() => handleQuantityChange(1)}>
            +
          </button>
        </div>

        {/* Primary Image Picker */}
        <label>Primary Image* : </label>


      <label className={styles.custum_file_upload} >
      <div className={styles.icon}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24"><g stroke-width="0" id="SVGRepo_bgCarrier"></g><g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path fill="" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" clip-rule="evenodd" fill-rule="evenodd"></path> </g></svg>
      </div>
      <div className={styles.text} >
        <span>Click to upload image</span>
        </div>
        <input type="file" id="file" accept="image/*" onChange={handlePrimaryImageChange} />
      </label>
      {primaryImagePreview && (
          <div className={styles.imagePreview}>
            <img src={primaryImagePreview} alt="Primary" />
          </div>
        )}

        {/* Multiple Images Input */}
        <div className={styles.imagePicker}>
          <label>Additional Images:</label>
          <label className={styles.custum_file_upload}>
            <div className={styles.icon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24"><g stroke-width="0" id="SVGRepo_bgCarrier"></g><g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g><g id="SVGRepo_iconCarrier"> <path fill="" d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z" clip-rule="evenodd" fill-rule="evenodd"></path> </g></svg>
            </div>
            <div className={styles.text}>
              <span>Upload additional images</span>
            </div>
            <input type="file" id="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
          </label>

          <div className={styles.additionalImagePreviews}>
            {additionalImagePreviews.map((preview, index) => (
              <div key={index} className={styles.previewContainer}>
                <img src={preview} alt={`Additional ${index + 1}`} />
                <button type="button" onClick={() => handleRemoveAdditionalImage(index)} className={styles.imageremovebutton}>
                  <MdDelete/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className={styles.submitbutton}>
          Add Car
        </button>
      </form>
    </div>
  );
};

const AddRentableVehiclePage: React.FC = () => {
  return (
    <DashboardLayout>
      <AddRentableVehicles />
    </DashboardLayout>
  );
};

export default AddRentableVehiclePage;
