import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import axiosInstance from "@/components/AxiosInstance";
import { useUser } from "@/components/UserContext";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function fetchEmployees() {
    try {
      const response = await axiosInstance.get('/store/admin/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }

  async function deleteEmployee(id) {
    try {
      await axiosInstance.delete(`/store/admin/employee/${id}`);
      setEmployees(employees.filter(employee => employee.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  }

  return (
    <Layout>
      {user?.is_admin && (<Link className="btn-primary" href={'/settings'}>Add new employee</Link>)}
      <table className="basic mt-2">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <td className="w-1/24">No.</td>
            <td className="w-10/24">Employee Name</td>
            <td className="w-10/24">Employee Email</td>
            {user?.is_admin && (<>
            <td className="w-10/24">Employee Address</td>
            <td className="w-2/24"></td>
            </>)}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => (
            <tr key={employee.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td>{index + 1}</td>
              <td>{employee.name}</td>
              <td>{employee.email}</td>
                {user?.is_admin && (<>
              <td>{employee.address}</td>
              <td className="flex flex-col gap-2 m-1">
                  <button
                    className="flex items-center justify-center w-full hover:bg-red-100 text-red-500"
                    onClick={() => deleteEmployee(employee.id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete
                  </button>
              </td>
              </>)}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}