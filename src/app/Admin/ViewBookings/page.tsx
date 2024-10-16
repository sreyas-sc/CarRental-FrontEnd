'use client';
import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import DashboardLayout from '../DashBoard/page';
import styles from './view-bookings.module.css';
import { useQuery } from '@apollo/client';
import { GET_ALL_BOOKINGS } from '@/graphql/mutations';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: string;
  vehicle: {
    make: string;
    model: string;
  };
  user: {
    name: string;
    email: string;
  };
}

const ViewBookings: React.FC = () => {
  const { data, loading, error } = useQuery(GET_ALL_BOOKINGS);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    startDate: '',
    endDate: '',
    carModel: '',
  });

  useEffect(() => {
    if (data && data.getAllBookings) {
      setBookings(data.getAllBookings);
      setFilteredBookings(data.getAllBookings);
    }
  }, [data]);

  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      return (
        booking.user.name.toLowerCase().includes(filters.name.toLowerCase()) &&
        booking.user.email.toLowerCase().includes(filters.email.toLowerCase()) &&
        booking.startDate.includes(filters.startDate) &&
        booking.endDate.includes(filters.endDate) &&
        `${booking.vehicle.make} ${booking.vehicle.model}`
          .toLowerCase()
          .includes(filters.carModel.toLowerCase())
      );
    });
    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [filters, bookings]);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error loading bookings: {error.message}</p>;

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Bookings Report', 20, 10);
    autoTable(doc, {
      head: [['User Name', 'User Email', 'Start Date', 'End Date', 'Car Model', 'Status', 'Total Price']],
      body: filteredBookings.map((booking) => [
        booking.user?.name || 'N/A',
        booking.user?.email || 'N/A',
        booking.startDate,
        booking.endDate,
        `${booking.vehicle.make} ${booking.vehicle.model}`,
        booking.status,
        `₹${booking.totalPrice}`,
      ]),
    });
    doc.save('bookings_report.pdf');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredBookings.map((booking) => ({
        'User Name': booking.user?.name || 'N/A',
        'User Email': booking.user?.email || 'N/A',
        'Start Date': booking.startDate,
        'End Date': booking.endDate,
        'Car Model': `${booking.vehicle.make} ${booking.vehicle.model}`,
        Status: booking.status,
        'Total Price': `₹${booking.totalPrice}`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    // Uncomment the following line to save the file
    // saveAs(blob, 'bookings_report.xlsx');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>View Bookings</h1>
      <div className={styles.buttonsContainer}>

        <button onClick={exportToPDF} className={styles.exportButton}>
          <div className={styles.docs}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              width="24"
              height="24"
              className={styles.pdfIcon}
            >
              <title>pdf-file-flat</title>
              <rect y="9.14" width="512" height="493.72" rx="54.99" ry="54.99" transform="translate(512) rotate(90)" fill="#e6d6a6"/>
              <rect x="20.24" y="11.1" width="471.53" height="489.81" rx="43.89" ry="43.89" fill="#b9a468"/>
              <path d="M269.31,91.7l-.05-.05H148a9.39,9.39,0,0,0-9.39,9.39V411a9.39,9.39,0,0,0,9.39,9.39H364a9.39,9.39,0,0,0,9.39-9.39V195.78H269.31Z" fill="#eb5959"/>
              <polygon points="269.31 195.77 373.38 195.77 269.31 91.7 269.31 195.77" fill="#f27878"/>
              <polygon points="373.39 299.85 373.39 195.78 373.38 195.77 269.31 195.77 269.31 195.77 373.39 299.85" fill="#333" opacity="0.1"/>
              <path d="M203.35,354.46v19.27h-12.6V317.79h19.74q21.14,0,21.14,17.83a17.11,17.11,0,0,1-6.06,13.63q-6.07,5.2-16.21,5.21Zm0-27V344.9h5q10.06,0,10.06-8.82,0-8.62-10.06-8.62Z" fill="#eff0f0"/>
              <path d="M237.75,373.73V317.79h19.82q29.8,0,29.8,27.27,0,13.07-8.13,20.87t-21.67,7.8ZM250.35,328v35.46h6.24q8.19,0,12.85-4.92t4.67-13.38q0-8-4.62-12.58t-13-4.58Z" fill="#eff0f0"/>
              <path d="M326.92,328H307.18v13.73h18.14V352H307.18v21.73h-12.6V317.79h32.34Z" fill="#eff0f0"/>
            </svg>
            Export PDF
          </div>
          <div className={styles.download}>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.css_i6dzq1}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
        </button>
        <button onClick={exportToExcel} className={styles.exportButton}>
          <div className={styles.docs}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 48 48"
              className={styles.excelIcon}
            >
              <path fill="#4CAF50" d="M41,10H25v28h16c0.553,0,1-0.447,1-1V11C42,10.447,41.553,10,41,10z"></path>
              <path fill="#FFF" d="M32 15H39V18H32zM32 25H39V28H32zM32 30H39V33H32zM32 20H39V23H32zM25 15H30V18H25zM25 25H30V28H25zM25 30H30V33H25zM25 20H30V23H25z"></path>
              <path fill="#2E7D32" d="M27 42L6 38 6 10 27 6z"></path>
              <path fill="#FFF" d="M19.129,31l-2.411-4.561c-0.092-0.171-0.186-0.483-0.284-0.938h-0.037c-0.046,0.215-0.154,0.541-0.324,0.979L13.652,31H9.895l4.462-7.001L10.274,17h3.837l2.001,4.196c0.156,0.331,0.296,0.725,0.42,1.179h0.04c0.078-0.271,0.224-0.68,0.439-1.22L19.237,17h3.515l-4.199,6.939l4.316,7.059h-3.74V31z"></path>
            </svg>
            Export Excel
          </div>
          <div className={styles.download}>
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.css_i6dzq1}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
        </button>

      </div>
      <div className={styles.filters}>
        <input
          type="text"
          name="name"
          placeholder="Filter by name"
          value={filters.name}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <input
          type="text"
          name="email"
          placeholder="Filter by email"
          value={filters.email}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
        <input
          type="date"
          name="startDate"
          placeholder="Filter by start date"
          value={filters.startDate}
          onChange={handleFilterChange}
          className={styles.filterInput}
          title="Select Pick Up Date" 
        />
        <input
          type="date"
          name="endDate"
          placeholder="Filter by end date"
          value={filters.endDate}
          onChange={handleFilterChange}
          className={styles.filterInput}
          title="Select Drop Off Date" 
        />
        <input
          type="text"
          name="carModel"
          placeholder="Filter by car model"
          value={filters.carModel}
          onChange={handleFilterChange}
          className={styles.filterInput}
        />
      </div>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Pick up Date</th>
            <th>Drop off Date</th>
            <th>Car Model</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {currentItems.map((booking) => (
            <tr key={booking.id} className={styles.tableRow}>
              <td>{booking.user?.name || 'N/A'}</td>
              <td>{booking.user?.email || 'N/A'}</td>
              <td>{booking.startDate}</td>
              <td>{booking.endDate}</td>
              <td>{`${booking.vehicle.make} ${booking.vehicle.model}`}</td>
              <td>{`₹${booking.totalPrice}`}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.pagination}>
        {Array.from({ length: Math.ceil(filteredBookings.length / itemsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`${styles.paginationButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

const ViewBookingsPage: React.FC = () => {
  return (
    <DashboardLayout>
      <ViewBookings />
    </DashboardLayout>
  );
};

export default ViewBookingsPage;