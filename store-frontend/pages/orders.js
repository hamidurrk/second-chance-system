import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import axios from "axios";
import { useUser } from "@/components/UserContext";
import axiosInstance from "@/components/AxiosInstance";

export default function OrdersPage() {
  const [orders,setOrders] = useState([]);
  useEffect(() => {
    axiosInstance.get('/store/orders').then(response => {
      setOrders(response.data);
      // console.log(response.data);
    });
  }, []);
  return (
    <Layout>
      <h1>Orders</h1> {orders.length} orders
      <table className="basic">
        <thead>
          <tr>
            <th>Date</th>
            <th>Paid</th>
            <th>Recipient</th>
            <th>Type</th>
            <th>Products</th>
          </tr>
        </thead>
        <tbody>
        {orders.length > 0 && orders.map(order => (
          <tr key={order.id}>
            <td>
            {(new Date(order.createdat)).toLocaleDateString()}<br />
            {(new Date(order.createdat)).toLocaleTimeString()}
            </td>
            <td className={order.paid ? 'text-green-600' : 'text-red-600'}>
              {order.paid ? 'YES' : 'NO'} <br />
              €{order.total}
            </td>
            <td>
              {order.name} <br /> 
              {order.email}<br />
              {order.streetaddress}<br />
              {order.city} {order.postalcode} {order.country}
            </td>
            <td className={order.delivery ? 'text-cyan-600 text-center' : 'text-indigo-600 text-center'}>
              {order.delivery ? 'Home Delivery' : 'Store Pickup'} 
              <br />
              <span className={order.status === 'pending' ? 'bg-red-100 text-red-800 inline-block px-3 py-1 rounded-full text-sm font-semibold' : 'bg-green-100 text-green-800 inline-block px-3 py-1 rounded-full text-sm font-semibold'}>
              {order.status === 'pending' ? 'Pending' : 'Delivered'}
              </span>
            </td>
            <td>
              {order.line_items.map(l => (
                <>
                  {l.quantity} x {l.price_data?.product_data.name} <br />
                </>
              ))}
            </td>
          </tr>
        ) )}
        </tbody>
      </table>
    </Layout>
  );
}
