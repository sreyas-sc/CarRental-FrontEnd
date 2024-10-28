'use client'
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, ApolloError } from '@apollo/client';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Table, Checkbox, Button, Pagination, Form, Input, Modal, Upload, Dropdown, Menu, message  } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import { GET_BOOKINGS_BY_USER_ID, UPDATE_USER_MUTATION, CHANGE_PASSWORD_MUTATION, UPLOAD_IMAGE_MUTATION, GET_USER_IMAGE } from '@/graphql/mutations';
import styles from './user-profile.module.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx';
import { FaFilePdf } from "react-icons/fa";
import { SiMicrosoftexcel } from "react-icons/si";
import { PiPencilSimpleLine } from "react-icons/pi";

interface User {
  id: string;
  phone: string;
  email: string;
  name: string;
  city: string;
  state: string;
  country: string;
  imageUrl: string;
}

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
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [file, setFile] = useState(null);



  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  const { data, loading, error } = useQuery(GET_BOOKINGS_BY_USER_ID, {
    variables: { userId: user?.id },
    skip: !user,
  });


  //  GET_USER_IMAGE query
  // const { data: ImageData } = useQuery(GET_USER_IMAGE, {
  //   variables: { userId: user?.id },
  //   skip: !user,
  // });

  // Add GET_USER_IMAGE query with refetch functionality
  const { data: ImageData, refetch: refetchImage } = useQuery(GET_USER_IMAGE, {
    variables: { userId: user?.id },
    skip: !user,
  });


  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const [changePassword] = useMutation(CHANGE_PASSWORD_MUTATION);
  const [uploadImage] = useMutation(UPLOAD_IMAGE_MUTATION);


  
  useEffect(() => {
    const sessionUser: User = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (sessionUser) {
      setUser(sessionUser);
    }
  }, []);

  useEffect(() => {
    if (data) {
      setBookings(data.getBookingsByUserId);
    }
  }, [data]);

  // delete this if not working
  if (!user) return <div>
      <div className={styles.spinnerContainer}><div className={styles.spinner}></div></div>
  </div>;
  // till here

  // if (!user) return <div>Loading...</div>;
  if (loading) return <div className={styles.spinnerContainer}><div className={styles.spinner}></div></div>;
  if (error) return <p>Error loading bookings: {error.message}</p>;

  const handleRowSelectionChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleImageUpload = async ({ file }: { file: any }) => {
    console.log('Uploaded file object:', file); // Log the uploaded file object
  
    // Check if the file object is valid and has a proper type
    if (file && (file.originFileObj || file instanceof File)) {
      const fileToUpload = file.originFileObj || file; // Get the correct file reference
  
      try {
        const { data } = await uploadImage({
          variables: { file: fileToUpload, userId: user?.id },
        });
        if (data.uploadImage.success) {
          await refetchImage();
          setUser({ ...user, imageUrl: data.uploadImage.fileUrl });
          sessionStorage.setItem('user', JSON.stringify({ ...user, imageUrl: data.uploadImage.fileUrl }));
          message.success('Image uploaded successfully');
        } else {
          message.error('Upload failed: ' + data.uploadImage.message);
        }
      } catch (error) {
        console.error("Upload error:", error);
        message.error('Failed to upload image');
      }
    } else {
      console.warn("Invalid file object:", file);
      message.error('Invalid file upload');
    }
  };
  
  const avatarMenu = (
    <Menu>
      <Menu.Item key="1" icon={<CameraOutlined />}>
        <Upload customRequest={handleImageUpload} showUploadList={false} accept=".png,.jpg,.jpeg">
          <span>Upload Image</span>
        </Upload>
      </Menu.Item>
    </Menu>
  );

  const downloadPDF = () => {
    const doc = new jsPDF()
    autoTable(doc, {
      head: [['Start Date', 'End Date', 'Car Model', 'Status', 'Total Price']],
      body: bookings
        .filter(booking => selectedRowKeys.includes(booking.id))
        .map(booking => [
          booking.startDate,
          booking.endDate,
          `${booking.vehicle.make} ${booking.vehicle.model}`,
          booking.status,
          `₹${booking.totalPrice}`,
        ]),
    });
    doc.save('user-bookings.pdf');
  };

  const downloadExcel = () => {
    const exportData = bookings.filter(booking => selectedRowKeys.includes(booking.id));
    const worksheet = XLSX.utils.json_to_sheet(exportData.map(booking => ({
      StartDate: booking.startDate,
      EndDate: booking.endDate,
      CarModel: `${booking.vehicle.make} ${booking.vehicle.model}`,
      Status: booking.status,
      TotalPrice: `₹${booking.totalPrice}`,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, 'user-bookings.xlsx');
  };

  const columns = [
    {
      title: <Checkbox onChange={e => {
        setSelectedRowKeys(e.target.checked ? bookings.map(booking => booking.id) : []);
      }} />,
      dataIndex: 'checkbox',
      render: (_: any, record: Booking) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.id)}
          onChange={() => handleRowSelectionChange(
            selectedRowKeys.includes(record.id)
              ? selectedRowKeys.filter(key => key !== record.id)
              : [...selectedRowKeys, record.id]
          )}
        />
      ),
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
    },
    {
      title: 'Car Model',
      render: (text: any, record: Booking) => {
        // Check if the vehicle is available
        if (record.vehicle) {
          return `${record.vehicle.make} ${record.vehicle.model}`;
        } else {
          return 'Vehicle Deleted'; // Return a placeholder if the vehicle is not available
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text: string, record: Booking) => {
        const today = new Date();
        const startDate = new Date(record.startDate);
        const endDate = new Date(record.endDate);
  
        if (today > endDate) {
          return 'Used';  // Booking is completed in the past
        } else if (today >= startDate && today <= endDate) {
          return 'In Use';  // Currently in use
        } else {
          return 'Booked';  // Future booking
        }
      },
    },
    {
      title: 'Total Price',
      dataIndex: 'totalPrice',
      render: (text: string) => `₹${text}`,
    },
  ];
  
  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  const showEditModal = () => {
    form.setFieldsValue(user);
    setIsEditModalVisible(true);
  };

  const handleEditOk = async () => {
    try {
      const values = await form.validateFields();
      const { data } = await updateUser({ variables: { id: user.id, ...values } });
      setUser(data.updateUser);
      sessionStorage.setItem('user', JSON.stringify(data.updateUser));
      setIsEditModalVisible(false);
      setEditError(null); // Clear any previous error
      message.success('User details updated successfully');
    } catch (error) {
      const apolloError = error as ApolloError; // Explicitly casting the error to ApolloError
      const errorMessage = apolloError.graphQLErrors?.[0]?.message || 'Failed to update user';
      setEditError(errorMessage); // Set the error message in state
    }
  };
  


  const showChangePasswordModal = () => {
    passwordForm.resetFields();
    setIsChangePasswordModalVisible(true);
  };
  

  const handleChangePasswordOk = async () => {
    try {
      const values = await passwordForm.validateFields();
      
      // Call the mutation with user ID, current password, and new password
      const { data } = await changePassword({
        variables: {
          userId: user.id,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });
  
      // Check for success response and handle accordingly
      if (data.changePassword.success) {
        Modal.success({
          content: data.changePassword.message,
        });
        passwordForm.resetFields(); // Clear form fields
        setIsChangePasswordModalVisible(false); // Close modal
      } else {
        Modal.error({
          content: data.changePassword.message,
        });
      }
    } catch (error) {
      const apolloError = error as ApolloError;
        
        // Extract the error message from the Apollo error
        const errorMessage = apolloError.graphQLErrors?.[0]?.message || 'Failed to change password';

        Modal.error({
            title: 'Error',
            content: errorMessage,
        });
    }
  };
  

  return (
    <div className={styles.userProfileContainer}>
      <div className={styles.profileCard}>
        <div className={styles.ProfilecardHeader}>
          <h2 className={styles.cardTitle}>{user.name}</h2>
          <button className={styles.editButton} onClick={showEditModal}><PiPencilSimpleLine /></button>
        </div>
        <div className={styles.usercardContent}>
        <div className={styles.avatarContainer}>
          <Dropdown overlay={avatarMenu} trigger={['click']}>
            <div className={styles.avatar}>
              {/* {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.name}
                  className={styles.avatarImage}
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/150"; // Fallback image in case of error
                  }}
                />
              ) : (
                <UserOutlined className={styles.defaultAvatarIcon} />
              )} */}
              {ImageData?.getUserImage ? (
              <img
                src={ImageData.getUserImage}
                alt={user.name}
                className={styles.avatarImage}
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/150";
                }}
              />
            ) : (
              <UserOutlined className={styles.defaultAvatarIcon} />
            )}
              {!user.imageUrl && (
                <div className={styles.avatarFallback}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </Dropdown>
        </div>

          <div className={styles.userInfo}>
            <div className={styles.infoItem}>
              <Mail className={styles.infoIcon} />
              <span>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <Phone className={styles.infoIcon} />
              <span>{user.phone}</span>
            </div>
            <div className={styles.infoItem}>
              <MapPin className={styles.infoIcon} />
              <span>{`${user.city}, ${user.state}, ${user.country}`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bookingsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Bookings</h2>
          <div className={styles.excelPdfButtonContainer}>
            <Button onClick={downloadPDF} disabled={selectedRowKeys.length === 0} className={styles.downloadButton}>
              <FaFilePdf className={styles.pdficon} />Download PDF
            </Button>
            <Button onClick={downloadExcel} disabled={selectedRowKeys.length === 0} className={styles.downloadButton}>
              <SiMicrosoftexcel className={styles.excelicon} />Download Excel
            </Button>
          </div>
        </div>
        <div className={styles.cardContent}>
          <Table
            className={styles.table}
            columns={columns}
            // dataSource={bookings.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
            dataSource={[...bookings].reverse().slice((currentPage - 1) * pageSize, currentPage * pageSize)} //to sshow the table in reverse cronological order
            rowKey="id"
            pagination={false}
            locale={{ emptyText: 'No bookings available.' }}
          />
          <Pagination
            className={styles.pagination}
            current={currentPage}
            total={bookings.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          />
        </div>
      </div>

      <Modal
        title="Edit User Details"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Form form={form} layout="vertical">
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input readOnly />
        </Form.Item>
        <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
          <Input readOnly />
        </Form.Item>
        <Form.Item name="city" label="City" rules={[
            { required: true, message: 'City is required' },
            { 
              pattern: /^[A-Za-z\s]+$/, 
              message: 'State must contain only letters' 
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="state" label="State" 
          rules={[
            { required: true, message: 'State is required' },
            { 
              pattern: /^[A-Za-z\s]+$/, 
              message: 'State must contain only letters' 
            },
          ]}
        >

          <Input />
        </Form.Item>
        <Form.Item 
          name="country" 
          label="Country" 
          rules={[
              { required: true, message: 'Country is required' },
              { 
                pattern: /^[A-Za-z\s]+$/, 
                message: 'Country must contain only letters' 
              },
          ]}
        >
          <Input />
        </Form.Item>
        {editError && <div style={{ color: 'red', marginBottom: 16 }}>{editError}</div>} {/* Display error here */}
        </Form>
        <Button onClick={showChangePasswordModal}>Change Password</Button>
      </Modal>

      <Modal
    title="Change Password"
    open={isChangePasswordModalVisible}
    onOk={handleChangePasswordOk}
    onCancel={() => setIsChangePasswordModalVisible(false)}
>
    <Form form={passwordForm} layout="vertical">
        <Form.Item
            name="currentPassword"
            label="Current Password"
            rules={[{ required: true, message: 'Please input your current password!' }]}
        >
            <Input.Password />
        </Form.Item>
        <Form.Item
            name="newPassword"
            label="New Password"
            rules={[
                { required: true, message: 'Please input your new password!' },
                { min: 8, message: 'Password must be at least 8 characters long' },
            ]}
        >
            <Input.Password />
        </Form.Item>
        <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
                { required: true, message: 'Please confirm your new password!' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                    },
                }),
            ]}
        >
            <Input.Password />
        </Form.Item>
    </Form>
      </Modal>

    </div>
  );
};

export default UserProfile;