'use client';

import React, { useState } from 'react';
import Joi from 'joi';
import styles from './register-page.module.css';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION, SEND_OTP_MUTATION, VERIFY_OTP_MUTATION } from '@/graphql/mutations';
import Link from 'next/link';

// Validation schema
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),
    
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit phone number'
    }),
    
  city: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'City is required',
      'string.min': 'City must be at least 2 characters long',
      'string.max': 'City cannot exceed 50 characters'
    }),
    
  state: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'State is required',
      'string.min': 'State must be at least 2 characters long',
      'string.max': 'State cannot exceed 50 characters'
    }),
    
  country: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Country is required',
      'string.min': 'Country must be at least 2 characters long',
      'string.max': 'Country cannot exceed 50 characters'
    }),
    
  password: Joi.string()
    .min(6)
    // .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    })
});

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

  type ValidationErrors = {
    [key: string]: string;
  };

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [error, setError] = useState('');

  const validateField = (name: string, value: string): string | null => {
    const fieldSchema = Joi.object({ [name]: registerSchema.extract(name) });
    const { error } = fieldSchema.validate({ [name]: value });
    return error ? error.details[0].message : null;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Handle the null case explicitly
    const errorMessage = validateField(name, value);
    if (errorMessage) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: errorMessage
      }));
    } else {
      // Remove the field from errors if it's valid
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const { error } = registerSchema.validate(formData, { abortEarly: false });
    if (error) {
      const errors: { [key: string]: string } = {};
      error.details.forEach((detail) => {
        errors[detail.path[0]] = detail.message;
      });
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

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
            <div className={styles.inputContainer}>
              <input
                type="text"
                name="name"
                className={`${styles.emailinput} ${validationErrors.name ? styles.errorInput : ''}`}
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {validationErrors.name && <span className={styles.errorText}>{validationErrors.name}</span>}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="email"
                name="email"
                className={`${styles.emailinput} ${validationErrors.email ? styles.errorInput : ''}`}
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {validationErrors.email && <span className={styles.errorText}>{validationErrors.email}</span>}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="tel"
                name="phone"
                className={`${styles.phoneinput} ${validationErrors.phone ? styles.errorInput : ''}`}
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              {validationErrors.phone && <span className={styles.errorText}>{validationErrors.phone}</span>}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                name="city"
                className={`${styles.emailinput} ${validationErrors.city ? styles.errorInput : ''}`}
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
              />
              {validationErrors.city && <span className={styles.errorText}>{validationErrors.city}</span>}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                name="state"
                className={`${styles.emailinput} ${validationErrors.state ? styles.errorInput : ''}`}
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                required
              />
              {validationErrors.state && <span className={styles.errorText}>{validationErrors.state}</span>}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="text"
                name="country"
                className={`${styles.emailinput} ${validationErrors.country ? styles.errorInput : ''}`}
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                required
              />
              {validationErrors.country && <span className={styles.errorText}>{validationErrors.country}</span>}
            </div>

            <div className={styles.inputContainer}>
              <input
                type="password"
                name="password"
                className={`${styles.passwordinput} ${validationErrors.password ? styles.errorInput : ''}`}
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {validationErrors.password && <span className={styles.errorText}>{validationErrors.password}</span>}
            </div>

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