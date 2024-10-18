
// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useQuery, useMutation } from '@apollo/client';
// import { GET_VEHICLE_DETAILS_BY_ID, ADD_BOOKING_MUTATION, CREATE_RAZORPAY_ORDER } from '@/graphql/mutations';
// import styles from './book-car.module.css';
// import Swal from 'sweetalert2';
// import dotenv from 'dotenv';


// dotenv.config();

// // Define types for Vehicle and User
// interface Vehicle {
//   id: string;
//   make: string;
//   model: string;
//   year: string;
//   price: number;
//   description: string;
//   primaryImageUrl?: string;
//   additionalImageUrls?: string[];
// }

// interface User {
//   id: string;
//   phone: string;
//   email: string;
//   name: string;
// }

// interface VehicleData {
//   getVehicleDetailsById: Vehicle;
// }

// declare global {
//   interface Window {
//     Razorpay: any;
//   }
// }

// const Booking: React.FC = () => {
//   const router = useRouter();
  
//   const [vehicleId, setVehicleId] = useState<string | null>(null);
//   const [user, setUser] = useState<User | null>(null);
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [amount, setAmount] = useState(0);

//   const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);


//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const id = params.get('id');
//     const fromdate = params.get('fromdate');
//     const todate = params.get('todate');
//     const totalAmount = params.get('amount');

//     setVehicleId(id);
//     setFromDate(fromdate || '');
//     setToDate(todate || '');
//     setAmount(parseInt(totalAmount || '0'));

//     // Parse user data from session storage
//     const sessionUser: User = JSON.parse(sessionStorage.getItem('user') || 'null');
//     if (sessionUser) {
//       setUser(sessionUser);
//     }

//     // Load Razorpay script
//     const script = document.createElement('script');
//     script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//     script.async = true;
//     document.body.appendChild(script);

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);



//   const { loading, error, data } = useQuery<VehicleData>(GET_VEHICLE_DETAILS_BY_ID, {
//     variables: { id: vehicleId },
//     skip: !vehicleId,
//   });

//   useEffect(() => {
//     if (data?.getVehicleDetailsById?.primaryImageUrl) {
//       setSelectedImage(data.getVehicleDetailsById.primaryImageUrl);
//     }
//   }, [data]);

//   const [addBooking] = useMutation(ADD_BOOKING_MUTATION);
//   const [createRazorpayOrder] = useMutation(CREATE_RAZORPAY_ORDER);

//   const handlePayment = async () => {
//     if (!user || !fromDate || !toDate || !vehicleId) {
//       Swal.fire({
//         title: 'Missing Information!',
//         text: 'Please ensure all fields are filled out correctly.',
//         icon: 'warning',
//       });
//       return;
//     }

//     try {
//       // Create Razorpay order
//       const orderResponse = await createRazorpayOrder({
//         variables: {
//           input: {  
//             amount: amount * 100,  
//             currency: 'INR',
//           },
//         },
//       });

//       const options = {
//         key: process.env.KEY_ID,
//         amount: amount * 100,
//         currency: 'INR',
//         name: 'Car Rental',
//         description: `Booking for ${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model}`,
//         order_id: orderResponse.data.createRazorpayOrder.id,

        
//         handler: async function (response: any) {
//           console.log("razorpayPaymentId",response.razorpay_payment_id)
//           console.log("razorpayOrderId",response.razorpay_order_id)
//           console.log("razorpaySignature",response.razorpay_signature)
//           try {
//             const result = await addBooking({
//               variables: {
//                 vehicleId: parseInt(vehicleId), 
//                 userId: parseInt(user.id),
//                 startDate: fromDate.toString(),
//                 endDate: toDate.toString(),
//                 status: "booked",
//                 totalPrice: amount.toString(),
//                 razorpayPaymentId: response.razorpay_payment_id,
//                 razorpayOrderId: response.razorpay_order_id,
//                 razorpaySignature: response.razorpay_signature
//               },        
//             });
            
//             if (result.data) {
//               Swal.fire({
//                 title: 'Booking Confirmed!',
//                 text: `You booked a ${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model} from ${fromDate} to ${toDate}.`,
//                 icon: 'success',
//               });
//               router.push('/User/UserProfile');
//             }
//           } catch (error) {
//             console.error('Error creating booking:', error);
//             Swal.fire({
//               title: 'Error!',
//               text: 'There was an error processing your booking. Please try again.',
//               icon: 'error',
//             });
//           }
//         },
//         prefill: {
//           name: user.name,
//           email: user.email,
//           contact: user.phone,
//         },
//         theme: {
//           color: '#3399cc',
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (error) {
//       console.error('Error initiating payment:', error);
//       Swal.fire({
//         title: 'Error!',
//         text: 'There was an error initiating the payment. Please try again.',
//         icon: 'error',
//       });
//     }
//   };

//   // Function to calculate total number of days
//   const calculateTotalDays = () => {
//     return Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / (1000 * 3600 * 24));
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error.message}</p>;

//   const totalDays = calculateTotalDays();

 

//   return (
//     <div className={styles.bookingContainer}>
//       {/* <h1 className={styles.title}>Booking Details</h1> */}
//       <div className={styles.vehicleDetails}>
//         <img
//           src={data?.getVehicleDetailsById?.primaryImageUrl || 'https://via.placeholder.com/300'}
//           alt={`${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model}`}
//           className={styles.vehicleImage}
//         />
//         <div className={styles.imageSlider}>
//           {Array.isArray(data?.getVehicleDetailsById?.additionalImageUrls) && data?.getVehicleDetailsById?.additionalImageUrls.length > 0 ? (
//             data?.getVehicleDetailsById?.additionalImageUrls.map((img, index) => (
//               <img
//                 key={index}
//                 src={img}
//                 alt={`${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model} - Image ${index + 1}`}
//                 className={styles.thumbnailImage}
//                 onClick={() => setSelectedImage(img)}
//               />
//             ))
//           ) : (
//             <p>No additional images available</p>
//           )}
//         </div>

//         <h2 className={styles.vehicleName}>{data?.getVehicleDetailsById?.make} {data?.getVehicleDetailsById?.model} ({data?.getVehicleDetailsById?.year})</h2>
//         <p className={styles.description}><strong>Price:</strong> ₹{data?.getVehicleDetailsById?.price}/day</p>
//         <p className={styles.description}>{data?.getVehicleDetailsById?.description}</p>
//       </div>
//       <div className={styles.detailsContaineSub}>
//         <div className={styles.priceSummary}>
//           <p><strong>Pickup Date:</strong> {fromDate}</p>
//           <p><strong>Drop Off Date:</strong> {toDate}</p>
//         </div>
//         <div className={styles.priceSummary2}>
//           <p><strong>Total Days:</strong> {totalDays}</p>
//         </div>
//         <div className={styles.priceSummary3}>
//           <p><strong>Total Price:</strong> ₹{amount}</p>
//         </div>
//       </div>
      
//       <button onClick={handlePayment} className={styles.bookButton}>Pay Now</button>
//     </div>
//   );
// };

// export default Booking;

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { GET_VEHICLE_DETAILS_BY_ID, ADD_BOOKING_MUTATION, CREATE_RAZORPAY_ORDER } from '@/graphql/mutations';
import styles from './book-car.module.css';
import Swal from 'sweetalert2';
import dotenv from 'dotenv';
import confetti from 'canvas-confetti';

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
  additionalImageUrls?: string[];
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

  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);

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

  useEffect(() => {
    if (data?.getVehicleDetailsById?.primaryImageUrl) {
      setSelectedImage(data.getVehicleDetailsById.primaryImageUrl);
    }
  }, [data]);

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
              // Show confetti
              confetti({
                particleCount: 200,
                spread: 70,
                origin: { y: 0.6 },  
              });
            
              // Delay the SweetAlert and navigation
              setTimeout(() => {
                Swal.fire({
                  title: 'Booking Confirmed!',
                  text: `You booked a ${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model} from ${fromDate} to ${toDate}.`,
                  icon: 'success',
                });
            
                // Navigate to User Profile after the alert
                setTimeout(() => {
                  // router.push('/User/UserProfile');
                  window.location.href = '/User/UserProfile';
                }, 3000); // Delay navigation for a few seconds after the alert
              }, 3000); // Adjust this delay for how long you want the confetti to show (in milliseconds)
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
      <div className={styles.first}>
      {/* <h1 className={styles.title}>Booking Details</h1> */}
      <div className={styles.vehicleDetails}>
        <img
          src={selectedImage || 'https://via.placeholder.com/300'}
          alt={`${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model}`}
          className={styles.vehicleImage}
        />
        {/* <div className={styles.imageSlider}>
          {Array.isArray(data?.getVehicleDetailsById?.additionalImageUrls) && data?.getVehicleDetailsById?.additionalImageUrls.length > 0 ? (
            data?.getVehicleDetailsById?.additionalImageUrls.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model} - Image ${index + 1}`}
                className={styles.thumbnailImage}
                onClick={() => setSelectedImage(img)}
              />
            ))
          ) : (
            <p>No additional images available</p>
          )}
        </div> */}
        <div className={styles.imageSlider}>
  {/* Display primary image if available */}
  {data?.getVehicleDetailsById?.primaryImageUrl ? (
    <img
      src={data.getVehicleDetailsById.primaryImageUrl}
      alt={`${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model} - Primary Image`}
      className={styles.thumbnailImage}
      onClick={() => setSelectedImage(data.getVehicleDetailsById.primaryImageUrl)}
    />
  ) : (
    <p>No primary image available</p>
  )}

  {/* Display additional images if available */}
  {Array.isArray(data?.getVehicleDetailsById?.additionalImageUrls) && data?.getVehicleDetailsById?.additionalImageUrls.length > 0 ? (
    data?.getVehicleDetailsById?.additionalImageUrls.map((img, index) => (
      <img
        key={index}
        src={img}
        alt={`${data?.getVehicleDetailsById?.make} ${data?.getVehicleDetailsById?.model} - Image ${index + 1}`}
        className={styles.thumbnailImage}
        onClick={() => setSelectedImage(img)}
      />
    ))
  ) : (
    <p>No additional images available</p>
  )}
</div>

        </div>
      </div>
        
        <div className={styles.second}>
        <h2 className={styles.vehicleName}>{data?.getVehicleDetailsById?.make} {data?.getVehicleDetailsById?.model} ({data?.getVehicleDetailsById?.year})</h2>
        <p className={styles.description}><strong>Price:</strong> ₹{data?.getVehicleDetailsById?.price}/day</p>
        <p className={styles.description}>{data?.getVehicleDetailsById?.description}</p>
      
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

      {/*  */}
      <div className={styles.btnmain}>
        <div className={styles.btncontainer} onClick={handlePayment}>
        <div className={styles.btnleft_side}>
          <div className={styles.btncard}>
          <div className={styles.btncard_line}></div>
          <div className={styles.btnbuttons}></div>
          </div>
          <div className={styles.btnpost}>
          <div className={styles.btnpost_line}></div>
          <div className={styles.btnscreen}>
            <div className={styles.btndollar}>₹</div>
          </div>
          <div className={styles.btnnumbers}></div>
          <div className={styles.btnnumbers_line2}></div>
          </div>
        </div>
        <div className={styles.btnright_side}>
          <div className={styles.btnnew}>Make Payment</div>
          
          <svg viewBox="0 0 451.846 451.847" height="512" width="512" xmlns="http://www.w3.org/2000/svg" className={styles.btnarrow}><path fill="#cfcfcf" data-old_color="#000000" className={styles.btnactive_path}  data-original="#000000" d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"></path></svg>
        
        </div>
        </div>
      </div>
      {/*  */}
      
      {/* <button onClick={handlePayment} className={styles.bookButton}>Pay Now</button> */}
    </div>
    </div>
    
  );
};

export default Booking;
