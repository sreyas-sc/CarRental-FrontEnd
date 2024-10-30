'use client'
import React, { useState } from 'react';
import styles from './login-page.module.css';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import Swal from 'sweetalert2';
import Link from 'next/link';
// import { BiSolidHide } from "react-icons/bi";

const LOGIN_USER = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        phone
        city
        country
        state
        imageUrl
      }
      status
      message
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUser, { loading }] = useMutation(LOGIN_USER);
  const [showPassword, setShowPassword] = useState(false); // Added state for toggling password visibility


  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ variables: { email, password } });
      
      if (data.login.status === 200) {
        // Store the token and user details in session storage
        sessionStorage.setItem('token', data.login.token);
        sessionStorage.setItem('user', JSON.stringify(data.login.user));
        
        const userName = data.login.user.name;
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: `Welcome back ${userName}`,
        }).then(() => {
          window.location.href = '/';
        });
      }
    } catch (err: any) {
      const errorStatus = err.graphQLErrors[0]?.extensions?.status || 500;
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Error';

      switch (errorStatus) {
        case 404:
          errorTitle = 'User Not Found';
          errorMessage = 'No user found with this email';
          break;
        case 422:
          if (err.graphQLErrors[0]?.extensions?.passwordMismatch) {
            errorTitle = 'Invalid Password';
            errorMessage = 'The password you entered is incorrect';
          } else {
            errorTitle = 'Validation Error';
            errorMessage = err.graphQLErrors[0]?.extensions?.validationError || 'Please check your input';
          }
          break;
        case 500:
          errorTitle = 'Server Error';
          errorMessage = 'Something went wrong. Please try again later';
          break;
      }

      Swal.fire({
        icon: 'error',
        title: errorTitle,
        text: errorMessage,
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
        <span className={styles.logintext}>Login</span>
        <form className={styles.inputfields} onSubmit={handleLogin}>
          <input
            type="email"
            className={styles.emailinput}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className={styles.passwordinputcontainer}> {/* Container for password field and icon */}
            <input
              type={showPassword ? 'text' : 'password'}
              className={styles.passwordinput}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span 
              className={styles.togglePassword} 
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🔓' : '🔒'} {/* Toggle eye icon */}
            </span>
          </div>
          <button className={styles.loginbutton} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <p className={styles.registertext}>Do not have an account?</p>
          <Link href="/Auth/Register" legacyBehavior passHref>
            <p className={styles.registerlink}>Register</p>
          </Link>
          <Link href="/Admin/AdminLogin" legacyBehavior passHref>
            <p className={styles.isadmin}>Login as administrator</p>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;