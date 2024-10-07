import DashboardLayout from '../DashBoard/page';

const ViewBookings = () => {
  return (
    <div>
      <h1>View Bookings</h1>
      {/* Content to display bookings */}
    </div>
  );
};

const ViewBookingsPage = () => {
  return (
    <DashboardLayout>
      <ViewBookings />
    </DashboardLayout>
  );
};

export default ViewBookingsPage;