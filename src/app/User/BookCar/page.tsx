
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_VEHICLE_DETAILS_BY_ID, ADD_BOOKING_MUTATION, CREATE_RAZORPAY_ORDER } from '@/graphql/mutations';
import styles from './book-car.module.css';
import Swal from 'sweetalert2';
import dotenv from 'dotenv';


dotenv.config();

// Define types for Vehicle and User
interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: string;
  price: number;
  description: string;
  primaryImageUrl?: string;
}

interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
}

interface VehicleData {
  getVehicleDetailsById: Vehicle;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Booking: React.FC = () => {
  const router = useRouter();
  
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const fromdate = params.get('fromdate');
    const todate = params.get('todate');
    const totalAmount = params.get('amount');

    setVehicleId(id);
    setFromDate(fromdate || '');
    setToDate(todate || '');
    setAmount(parseInt(totalAmount || '0'));

    // Parse user data from session storage
    const sessionUser: User = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (sessionUser) {
      setUser(sessionUser);
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const { loading, error, data } = useQuery<VehicleData>(GET_VEHICLE_DETAILS_BY_ID, {
    variables: { id: vehicleId },
    skip: !vehicleId,
  });

  const [addBooking] = useMutation(ADD_BOOKING_MUTATION);
  const [createRazorpayOrder] = useMutation(CREATE_RAZORPAY_ORDER);

  const handlePayment = async () => {
    if (!user || !fromDate || !toDate || !vehicleId) {
      Swal.fire({
        title: 'Missing Information!',
        text: 'Please ensure all fields are filled out correctly.',
        icon: 'warning',
      });
      return;
    }

    try {
      // Create Razorpay order
      const orderResponse = await createRazorpayOrder({
        variables: {
          input: {  
            amount: amount * 100,  
            currency: 'INR',
          },
        },
      });

      const options = {
        key: process.env.KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Car Rental',
        description: `Booking for ${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model}`,
        order_id: orderResponse.data.createRazorpayOrder.id,

        
        handler: async function (response: any) {
          console.log("razorpayPaymentId",response.razorpay_payment_id)
          console.log("razorpayOrderId",response.razorpay_order_id)
          console.log("razorpaySignature",response.razorpay_signature)
          try {
            const result = await addBooking({
              variables: {
                vehicleId: parseInt(vehicleId), 
                userId: parseInt(user.id),
                startDate: fromDate.toString(),
                endDate: toDate.toString(),
                status: "booked",
                totalPrice: amount.toString(),
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              },        
            });
            
            if (result.data) {
              Swal.fire({
                title: 'Booking Confirmed!',
                text: `You booked a ${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model} from ${fromDate} to ${toDate}.`,
                icon: 'success',
              });
              router.push('/User/UserProfile');
            }
          } catch (error) {
            console.error('Error creating booking:', error);
            Swal.fire({
              title: 'Error!',
              text: 'There was an error processing your booking. Please try again.',
              icon: 'error',
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: '#3399cc',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      Swal.fire({
        title: 'Error!',
        text: 'There was an error initiating the payment. Please try again.',
        icon: 'error',
      });
    }
  };

  // Function to calculate total number of days
  const calculateTotalDays = () => {
    return Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 3600 * 24));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const totalDays = calculateTotalDays();

  return (
    <div className={styles.bookingContainer}>
      <h1 className={styles.title}>Booking Details</h1>
      <div className={styles.vehicleDetails}>
        <img
          src={data?.getVehicleDetailsById?.primaryImageUrl || 'https://via.placeholder.com/300'}
          alt={`${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model}`}
          className={styles.vehicleImage}
        />
        <h2 className={styles.vehicleName}>{data?.getVehicleDetailsById?.make} {data?.getVehicleDetailsById?.model} ({data?.getVehicleDetailsById?.year})</h2>
        <p className={styles.description}><strong>Price:</strong> ₹{data?.getVehicleDetailsById?.price}/day</p>
        <p className={styles.description}>{data?.getVehicleDetailsById?.description}</p>
      </div>
      <div className={styles.detailsContaineSub}>
        <div className={styles.priceSummary}>
          <p><strong>Pickup Date:</strong> {fromDate}</p>
          <p><strong>Drop Off Date:</strong> {toDate}</p>
        </div>
        <div className={styles.priceSummary2}>
          <p><strong>Total Days:</strong> {totalDays}</p>
        </div>
        <div className={styles.priceSummary3}>
          <p><strong>Total Price:</strong> ₹{amount}</p>
        </div>
      </div>
      
      <button onClick={handlePayment} className={styles.bookButton}>Pay Now</button>
    </div>
  );
};

export default Booking;

