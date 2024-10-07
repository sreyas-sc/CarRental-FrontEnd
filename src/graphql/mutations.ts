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


export const ADD_BOOKING_MUTATION = gql`
  mutation AddBooking(
  $vehicleId: Int!,
  $userId: Int!,
  $startDate: String!,
  $endDate: String!,
  $status: String!,
  $totalPrice: String!
) {
  addBooking(
    input: {
      vehicleId: $vehicleId,
      userId: $userId,
      startDate: $startDate,
      endDate: $endDate,
      status:  $status,
      totalPrice: $totalPrice
    }
  ) {
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

export const DELETE_RENTABLE_VEHICLE = gql`
  mutation DeleteRentableVehicle($id: String!) {
    deleteRentableVehicle(id: $id) {
      success
      message
    }
  }
`;

export const GET_ALL_MAKES = gql`
  query GetAllMakes {
    getAllMakes
  }
`;



export const GET_MODELS_BY_MAKE = gql`
  query GetModelsByMake($make: String!) {
    getModelsByMake(make: $make) {
      model
      year
    }
  }
`;

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
