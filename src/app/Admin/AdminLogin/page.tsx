'use client';
import React, { useState } from 'react';
import styles from './admin-login.module.css';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import Swal from 'sweetalert2';

const LOGIN_ADMIN = gql`
  mutation LoginAdmin($email: String!, $password: String!) {
    loginAdmin(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;

const LoginAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAdmin, { loading, error }] = useMutation(LOGIN_ADMIN);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await loginAdmin({ variables: { email, password } });
      // Store the token and user details in session storage
      sessionStorage.setItem('token', data.loginAdmin.token); // Updated to use loginAdmin
      sessionStorage.setItem('user', JSON.stringify(data.loginAdmin.user)); // Updated to use loginAdmin

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: 'Welcome back!',
      }).then(() => {
        window.location.href = '/Admin/ViewCars'; // Adjust the redirect path as needed
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error?.message || 'Check Login Credentials again',
      });
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
        <span className={styles.logintext}>Administrator Login</span>
        <form className={styles.inputfields} onSubmit={handleLogin}>
          <input
            type="email"
            className={styles.emailinput}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className={styles.passwordinput}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className={styles.loginbutton} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className={styles.error}>{error.message}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginAdmin;
