// Login.jsx
'use client'
import React, { useState } from 'react';
import styles from './login-page.module.css';
import Image from 'next/image';
import { useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import Swal from 'sweetalert2';
import Link from 'next/link';


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
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginUser, { loading, error }] = useMutation(LOGIN_USER);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ variables: { email, password } });
      // Store the token and user details in session storage
      sessionStorage.setItem('token', data.login.token);
      sessionStorage.setItem('user', JSON.stringify(data.login.user));
      // Redirect or perform further actions upon successful login
      const userName = data.login.user.name;
      

      Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back ${userName}`,
      }).then(() => {
        // Redirect or perform further actions upon successful login
        window.location.href = '/'; // Adjust the redirect path as needed
      });
    } catch (err) {
      console.error(err);
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
            // required
          />
          <input
            type="password"
            className={styles.passwordinput}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            // required
          />
          <button className={styles.loginbutton} type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          {error && <p className={styles.error}>{error.message}</p>}
               
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
