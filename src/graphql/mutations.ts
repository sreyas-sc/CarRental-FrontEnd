import { gql } from '@apollo/client';

export const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $phone: String, $city: String, $state: String, $country: String) {
    register(name: $name, email: $email, password: $password, phone: $phone, city: $city, state: $state, country: $country) {
      id
      name
      email
    }
  }
`;

// To update the user details(Address, name)
export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String, $phone: String, $city: String, $state: String, $country: String) {
    updateUser(id: $id, input: { name: $name, email: $email, phone: $phone, city: $city, state: $state, country: $country }) {
      id
      name
      email
      phone
      city
      state
      country
    }
  }
`;

// User to change the password
export const CHANGE_PASSWORD_MUTATION = gql`
    mutation ChangePassword($userId: ID!, $currentPassword: String!, $newPassword: String!) {
    changePassword(userId: $userId, currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;

// Send otp for user authentication
export const SEND_OTP_MUTATION = gql`
  mutation SendOTP($phone: String!) {
    sendOTP(phone: $phone) {
      success
      message
    }
  }
`;

// User OTP verification for registration
export const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOTP($phone: String!, $otp: String!) {
    verifyOTP(phone: $phone, otp: $otp) {
      success
      message
    }
  }
`;

// Admin mutation to add rentable vehicles 
export const ADD_RENTABLE_VEHICLE_MUTATION = gql`
    mutation AddRentableVehicle(
        $make: String!
        $model: String!
        $year: String!
        $price: Float!
        $quantity: Int!
        $availability: Int!
        $transmission:  String!
        $fuel_type: String!
        $seats: Int!
        $description: String
        $primaryImage: Upload
        $additionalImages: [Upload]
    ) {
        addRentableVehicle(
            input:{
              make: $make
              model: $model
              year: $year
              price: $price
              quantity: $quantity
              availability: $availability
              transmission: $transmission
              fuel_type: $fuel_type
              seats:  $seats
              description: $description
              
            }
            primaryImage: $primaryImage
            additionalImages: $additionalImages
        ) {
            id
            make
            model
            year
            price
            quantity
            availability
            transmission
            fuel_type
            seats
            description
            primaryImageUrl
            additionalImageUrls
        }
    }
`;

// Add Bookings (user)
export const ADD_BOOKING_MUTATION = gql`
  mutation AddBooking(
  $vehicleId: Int!,
  $userId: Int!,
  $startDate: String!,
  $endDate: String!,
  $status: String!,
  $totalPrice: String!
  $razorpayPaymentId: String!,
  $razorpayOrderId: String!,
  $razorpaySignature: String!
) {
  addBooking(
    input: {
      vehicleId: $vehicleId,
      userId: $userId,
      startDate: $startDate,
      endDate: $endDate,
      status:  $status,
      totalPrice: $totalPrice
      razorpayPaymentId: $razorpayPaymentId,
      razorpayOrderId: $razorpayOrderId,
      razorpaySignature: $razorpaySignature
    }
  ) {
    id
    vehicleId
    userId
    startDate
    endDate
    status
    totalPrice
    razorpayPaymentId
    razorpayOrderId
    razorpaySignature
  }
}
`;

// Mutation to upload user profile photo
export const UPLOAD_IMAGE_MUTATION = gql`
  mutation UploadImage($file: Upload!, $userId: ID!) {
    uploadImage(file: $file, userId: $userId) {
      success
      message
      fileUrl
    }
  }
`;

// Add new vehicle
export const ADD_VEHICLE_MUTATION = gql`
  mutation AddVehicle($make: String!, $model: String!, $year: String!) {
    addVehicle(make: $make, model: $model, year: $year) {
      id
      make
      model
      year
    }
  }
`;

// Update the rentable vehicles
export const UPDATE_RENTABLE_VEHICLE = gql`
  mutation updateRentableVehicle(
      $id: ID
      $make: String!
      $model: String!
      $year: String!
      $price: Float!
      $quantity: Int!
      $description: String
      $primaryImage: Upload
      $additionalImages: [Upload]
  ) {
    updateRentableVehicle(
      id: $id,
      make: $make,
      model: $model,
      year: $year,
      price: $price,
      quantity: $quantity,
      description: $description,
      primaryImage: $primaryImage
      additionalImages: $additionalImages
    ) {
      
      make
      model
      year
      price
      quantity
      description
      primaryImageUrl
      additionalImageUrls
    }
  }
`;

// To get all the vehicles
export const GET_ALL_VEHICLES_MUTATION = gql`
  query GetAllVehicles {
    getAllCars {
      id
      make
      model
      year
    }
  }
`;

// Get The bookings (Admin view)
export const GET_BOOKINGS = gql`
  query GetBookings {
    getBookings {
      id
      vehicleId
      userId
      startDate
      endDate
      status
      totalPrice
    }
  }
`;

// 
export const GET_RENTABLE_VEHICLES = gql`
  query {
    getRentableVehicles {
      id
      make
      model
      year
      price
      quantity
      availability
      transmission
      fuel_type
      seats
      primaryImageUrl
      description
    }
  }
`;

// Delete Rentable Vehicles
export const DELETE_RENTABLE_VEHICLE = gql`
  mutation DeleteRentableVehicle($id: String!) {
    deleteRentableVehicle(id: $id) {
      success
      message
    }
  }
`;

// Get all the Makes
export const GET_ALL_MAKES = gql`
  query GetAllMakes {
    getAllMakes
  }
`;

// Get the model and make of the car
export const GET_MODELS_BY_MAKE = gql`
  query GetModelsByMake($make: String!) {
    getModelsByMake(make: $make) {
      model
      year
    }
  }
`;

// Get the available rentable cars by the selected date
export const GET_AVAILABLE_CARS = gql`
  query GetAvailableCars($startdate: String!, $enddate: String!){
    getAvailableCars(startdate: $startdate, enddate: $enddate) {
      id
      make
      model
      year
      price
      availability
      transmission
      fuel_type
      seats
      description
      primaryImageUrl
      additionalImageUrls
    }
  }
`;

// Get the details of the vehicle by the Id(on Booking page)
export const GET_VEHICLE_DETAILS_BY_ID = gql`
  query GetVehicleDetailsById($id: ID!) {  
    getVehicleDetailsById(id: $id) {  
      make
      model
      year
      price
      quantity
      availability
      transmission
      fuel_type
      seats
      description
      primaryImageUrl
      additionalImageUrls
    }
  }
`;

// Get the bookings of a specific user(Loggedin user)
export const GET_BOOKINGS_BY_USER_ID = gql`
  query GetBookingsByUserId($userId: ID!) { 
    getBookingsByUserId(userId: $userId) {
      id
      startDate
      endDate
      status
      totalPrice
      user {
        name
        email
      }
      vehicle {
        make
        model
      }
    }
  }
`;

// To get all the rentable car bookings
export const GET_ALL_BOOKINGS = gql`
  query GetAllBookings {
    getAllBookings {
      id
      startDate
      endDate
      status
      totalPrice
      vehicle {
        make
        model
      }
      user {
        id
        name
        email
      }
    }
  }
`;

// For Razorpay
export const CREATE_RAZORPAY_ORDER = gql`
 mutation CreateRazorpayOrder($input: CreateRazorpayOrderInput!) {
  createRazorpayOrder(input: $input) {
    id
    amount
    currency
  }
}
`;