'use client';  // This ensures that this component runs as a client component

import React, { useState } from 'react';
import styles from './register-page.module.css';
import Image from 'next/image';
import { useMutation } from '@apollo/client'; 
import { REGISTER_MUTATION } from '@/graphql/mutations';  // Ensure this points to the correct mutation file
import Link from 'next/link';

const Register = () => {
  const [register, { loading }] = useMutation(REGISTER_MUTATION);  // Use REGISTER_MUTATION with useMutation

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data } = await register({
        variables: formData  // Pass formData as variables
      });
      alert(`User ${data.register.name} registered successfully!`);
    } catch (error) {
      alert(`Error: ${error}`);
    }
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
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputfields}>
            <input
              type='text'
              name="name"
              className={styles.emailinput}
              placeholder='Name'
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              className={styles.emailinput}
              placeholder='Email'
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type='number'
              name="phone"
              className={styles.phoneinput}
              placeholder='Phone'
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <input
              type='text'
              name="city"
              className={styles.emailinput}
              placeholder='City'
              value={formData.city}
              onChange={handleChange}
              required
            />
            <input
              type='text'
              name="state"
              className={styles.emailinput}
              placeholder='State'
              value={formData.state}
              onChange={handleChange}
              required
            />
            <input
              type='text'
              name="country"
              className={styles.emailinput}
              placeholder='Country'
              value={formData.country}
              onChange={handleChange}
              required
            />
            <input
              type='password'
              name="password"
              className={styles.passwordinput}
              placeholder='Password'
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button className={styles.registerbutton} disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>
            <p className={styles.logintext}>Do not have an account?</p>
            <Link href="/Auth/Login" legacyBehavior passHref>
              <p className={styles.loginlink}>Login</p>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
