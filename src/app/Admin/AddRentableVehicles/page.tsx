'use client';
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../DashBoard/page';
import styles from './add-rentable-vehicles.module.css';
import { useLazyQuery, useMutation } from '@apollo/client';
import { ADD_RENTABLE_VEHICLE_MUTATION, GET_ALL_MAKES, GET_MODELS_BY_MAKE } from '@/graphql/mutations';
import Swal from 'sweetalert2';

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
  const [seats, setSeats] = useState<number>(1);



  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);

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
    if (e.target.files && e.target.files.length > 0) {
      setPrimaryImage(e.target.files[0]);
    }
  };

  const handleAdditionalImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const updatedImages = [...additionalImages];
      updatedImages[index] = file;
      setAdditionalImages(updatedImages);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    // Log all the values to check for missing fields
    console.log("Selected Make:", selectedMake);
    console.log("Selected Model:", selectedModel);
    console.log("Selected Year:", selectedYear);
    console.log("Price:", price);
    console.log("Quantity:", quantity);
    console.log("Description:", description);
    console.log("Primary Image:", primaryImage);
    console.log("Additional Images:", additionalImages);

    // Basic validation
    if (!selectedMake || !selectedModel || !selectedYear || price <= 0 || quantity <= 0) {
      alert('Please fill all required fields and ensure price and quantity are positive numbers.');
      return;
    }

    // Create input object for mutation
    const input = {
      make: selectedMake,
      model: selectedModel,
      year: selectedYear,
      price,
      quantity,
      availability,
      description,
      transmission: selectedTransmission,
      fuelType: selectedFuelType,
      seats,
      primaryImage, // Primary image file object
      additionalImages, // Array of additional image file objects
    };

    try {
      // Submit the form data
      const { data } = await addRentableVehicle({
        variables: {
          make: input.make,
          model: input.model,
          year: input.year,
          price: input.price,
          quantity: input.quantity,
          availability : input.quantity,
          description: input.description,
          transmission: input.transmission,
          fuel_type: input.fuelType,
          _seats: input.seats,
          get seats() {
            return this._seats;
          },
          set seats(value) {
            this._seats = value;
          },
          primaryImage: input.primaryImage,
          additionalImages: input.additionalImages,
        },
      });

      // Log the response
      console.log("Vehicle Added:", data);
      // alert('Vehicle added successfully! ');

      Swal.fire('Vehicle Added Successfully!', data, 'success');
        
    } catch (error) {
      Swal.fire('Error Adding Vehicle! 😕','error');
      console.error("Error Adding Vehicle:", error);
      // alert('Failed to add the vehicle. Please try again.');
    }
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
          <option value="Manual">Manual</option>
          <option value="Automatic">Automatic</option>
          <option value="Semi-Automatic">Semi-Automatic</option>
        </select>
      </div>

      {/* Number of Seats Input */}
        <div>
          <input
            type="number"
            placeholder="Number of Seats"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            min="1"
            className={styles.inputfields}
          />
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
        <label>Primary Image:</label>
        <div className={styles.imagePicker}>
          <input type="file" accept="image/*" onChange={handlePrimaryImageChange} />
        </div>

        {/* Multiple Images Input */}
        <div className={styles.imagePicker}>
          <label>Additional Images:</label>
          {additionalImages.map((_, index) => (
            <div key={index}>
              <input type="file" accept="image/*" onChange={(e) => handleAdditionalImageChange(e, index)} />
            </div>
          ))}
          <button type="button" onClick={handleAddImageField} className={styles.addImageButton}>
            Add More Images
          </button>
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
