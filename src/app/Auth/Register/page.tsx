// 'use client';  // This ensures that this component runs as a client component

// import React, { useState } from 'react';
// import styles from './register-page.module.css';
// import Image from 'next/image';
// import { useMutation } from '@apollo/client'; 
// import { REGISTER_MUTATION } from '@/graphql/mutations';  // Ensure this points to the correct mutation file
// import Link from 'next/link';

// const Register = () => {
//   const [register, { loading }] = useMutation(REGISTER_MUTATION);  // Use REGISTER_MUTATION with useMutation

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     city: '',
//     state: '',
//     country: '',
//     password: ''
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const { data } = await register({
//         variables: formData  // Pass formData as variables
//       });
//       alert(`User ${data.register.name} registered successfully!`);
//     } catch (error) {
//       alert(`Error: ${error}`);
//     }
//   };

//   return (
//     <div className={styles.login}>
//       <div className={styles.loginform}>
//         <div className={styles.cardcarimagecontainer}>
//           <Image
//             src="/icons/brandlogo.svg"
//             layout="responsive"
//             width={10}
//             height={10}
//             alt="Welcome Car"
//           />
//         </div>
//         <span className={styles.logintext}>Register</span>
//         <form onSubmit={handleSubmit} className={styles.form}>
//           <div className={styles.inputfields}>
//             <input
//               type='text'
//               name="name"
//               className={styles.emailinput}
//               placeholder='Name'
//               value={formData.name}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type="email"
//               name="email"
//               className={styles.emailinput}
//               placeholder='Email'
//               value={formData.email}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type='number'
//               name="phone"
//               className={styles.phoneinput}
//               placeholder='Phone'
//               value={formData.phone}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type='text'
//               name="city"
//               className={styles.emailinput}
//               placeholder='City'
//               value={formData.city}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type='text'
//               name="state"
//               className={styles.emailinput}
//               placeholder='State'
//               value={formData.state}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type='text'
//               name="country"
//               className={styles.emailinput}
//               placeholder='Country'
//               value={formData.country}
//               onChange={handleChange}
//               required
//             />
//             <input
//               type='password'
//               name="password"
//               className={styles.passwordinput}
//               placeholder='Password'
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//             <button className={styles.registerbutton} disabled={loading}>
//               {loading ? 'Registering...' : 'Register'}
//             </button>
//             <p className={styles.logintext}>Do not have an account?</p>
//             <Link href="/Auth/Login" legacyBehavior passHref>
//               <p className={styles.loginlink}>Login</p>
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Register;
'use client';

import React, { useState } from 'react';
import styles from './register-page.module.css';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION, SEND_OTP_MUTATION, VERIFY_OTP_MUTATION } from '@/graphql/mutations';
import Link from 'next/link';

const Register = () => {
  const [register, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);
  const [sendOTP, { loading: otpLoading }] = useMutation(SEND_OTP_MUTATION);
  const [verifyOTP] = useMutation(VERIFY_OTP_MUTATION);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    password: ''
  });

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpSent) {
      try {
        const { data } = await sendOTP({
          variables: { phone: formData.phone }
        });
        if (data.sendOTP.success) {
          setOtpSent(true);
          setShowOtpPopup(true);
        } else {
          setError(data.sendOTP.message || 'Failed to send OTP');
        }
      } catch (error) {
        setError(`Error sending OTP: ${error}`);
      }
    } else {
      try {
        const { data: verifyData } = await verifyOTP({
          variables: { phone: formData.phone, otp }
        });
        if (verifyData.verifyOTP.success) {
          const { data: registerData } = await register({
            variables: formData
          });
          alert(`User ${registerData.register.name} registered successfully!`);
          setShowOtpPopup(false);
        } else {
          setError(verifyData.verifyOTP.message || 'Invalid OTP');
        }
      } catch (error) {
        setError(`Error: ${error}`);
      }
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  return (
    <div className={styles.login}>
      <div className={styles.loginform}>
        <div className={styles.cardcarimagecontainer}>
          <Image
            src="/icons/brandlogo.svg"
            layout="responsive"
            width={10}
            height={10}
            alt="Welcome Car"
          />
        </div>
        <span className={styles.logintext}>Register</span>
        {error && <p className={styles.errorMessage}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputfields}>
            <input
              type="text"
              name="name"
              className={styles.emailinput}
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              className={styles.emailinput}
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              className={styles.phoneinput}
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              className={styles.emailinput}
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="state"
              className={styles.emailinput}
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="country"
              className={styles.emailinput}
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              className={styles.passwordinput}
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button className={styles.registerbutton} disabled={registerLoading || otpLoading}>
              {otpSent ? 'Verify OTP and Register' : 'Send OTP'}
            </button>
            <p className={styles.logintext}>Already have an account?</p>
            <Link href="/Auth/Login" legacyBehavior passHref>
              <p className={styles.loginlink}>Login</p>
            </Link>
          </div>
        </form>
      </div>
      
      {showOtpPopup && (
        <div className={styles.otpPopup}>
          <h3>Enter OTP</h3>
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="Enter OTP"
          />
          <button onClick={handleSubmit}>Verify and Register</button>
        </div>
      )}
    </div>
  );
};

export default Register;