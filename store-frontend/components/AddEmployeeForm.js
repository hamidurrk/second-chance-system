import { useState } from 'react';
import { useRouter } from 'next/router';
import axiosInstance from '@/components/AxiosInstance';
import { withSwal } from 'react-sweetalert2';
import { set } from 'mongoose';

function AddEmployeeForm({ swal }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function saveEmployee(ev) {
    ev.preventDefault();
    setIsSubmitting(true);

    try {
      await axiosInstance.post('/store/admin/new-employee', {
        email,
        name,
        address,
      });
      swal.fire({
        title: 'Success',
        text: 'New employee has been added!',
        icon: 'success',
      });
      router.push('/employees'); 
    } catch (error) {
      console.error('Error saving new employee:', error);
      swal.fire({
        title: 'Error',
        text: 'There was an error adding the employee.',
        icon: 'error',
      });
    } finally {
      setIsSubmitting(false);
      setEmail('');
      setName('');
      setAddress('');
    }
  }

  return (
    <form onSubmit={saveEmployee}>
      <h1>Add Employee</h1>
      <label>Email</label>
      <input
        type="email"
        placeholder="Employee email"
        value={email}
        onChange={ev => setEmail(ev.target.value)}
        required
      />

      <label>Name</label>
      <input
        type="text"
        placeholder="Employee name"
        value={name}
        onChange={ev => setName(ev.target.value)}
        required
      />

      <label>Address</label>
      <input
        type="text"
        placeholder="Employee address"
        value={address}
        onChange={ev => setAddress(ev.target.value)}
        required
      />

      <button type="submit" className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
      <button
        type="button"
        className="btn-default ml-4"
        onClick={() => router.back()}>
        Cancel
      </button>
    </form>
  );
}

export default withSwal(({ swal }, ref) => <AddEmployeeForm swal={swal} />);