import { useState } from 'react';
import axios from 'axios';
import axiosInstance from '@/components/AxiosInstance';
import Layout from "@/components/Layout";
import styled from 'styled-components';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;

  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f4f4f4;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }

  td {
    text-align: center;
  }

  td:last-child {
    text-align: center;
  }
`;

export default function SalesPage() {
  const [barcode, setBarcode] = useState('');
  const [scannedProducts, setScannedProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null); 

  const handleFetchProduct = async () => {
    if (!barcode.trim()) {
      setErrorMsg('Please enter a barcode.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const response = await axiosInstance.get(`store/employee/product/${barcode.trim()}`);
      if (response.data) {
        const existing = scannedProducts.find(
          (item) => item.barcode === barcode.trim()
        );
        if (existing) {
          setScannedProducts(
            scannedProducts.map((item) =>
              item.barcode === barcode.trim()
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          );
        } else {
          setScannedProducts([
            ...scannedProducts,
            { ...response.data, barcode: barcode.trim(), quantity: 1 },
          ]);
        }
        setBarcode('');
      } else {
        setErrorMsg('Product not found.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error retrieving the product.');
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = (barcodeValue) => {
    setScannedProducts(
      scannedProducts.map((item) =>
        item.barcode === barcodeValue && item.quantity < item.qty
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decrementQuantity = (barcodeValue) => {
    setScannedProducts(
      scannedProducts.map((item) =>
        item.barcode === barcodeValue && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const removeProduct = (barcodeValue) => {
    setScannedProducts(
      scannedProducts.filter((item) => item.barcode !== barcodeValue)
    );
  };

  const handleSubmitOrder = async () => {
    if (!scannedProducts.length) {
      setErrorMsg('No products to submit.');
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const body = scannedProducts.reduce((acc, product) => {
        acc[product.id] = product.quantity;
        return acc;
      }, {});
      console.log(body);
      const response = await axiosInstance.post('/store/employee/submit-order', { cart_items: body });
      setScannedProducts([]);
      setSuccessMsg('Order submitted successfully!');
      setOrderId(response.data.orderId);
    } catch (err) {
      console.error(err);
      setErrorMsg('Could not submit order.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await axiosInstance.get(`/store/employee/invoice/${orderId}`, {
        responseType: 'blob' 
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);
      const newWindow = window.open(pdfUrl, "_blank");
      if (newWindow) {
        newWindow.print();
      } else {
        console.error("Failed to open the invoice in a new tab.");
      }
    } catch (error) {
      console.error("Error printing invoice:", error);
    }
  };

  return (
    <Layout>
      <div className="w-3/4 mx-auto my-10 font-sans">
        <h1 className="text-2xl mb-4">Sales Entry</h1>

        <div className="mb-4">
          <label htmlFor="barcode" className="mr-2">Barcode: </label>
          <input
            id="barcode"
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="border p-2 mr-2"
          />
          <button
            onClick={handleFetchProduct}
            disabled={loading}
            className="bg-gray-100 text-primary hover:bg-highlight px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch Product'}
          </button>
        </div>

        {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}
        {successMsg && <div className="text-green-500 mb-4">{successMsg}</div>}

        {scannedProducts.length > 0 && (
          <StyledTable>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Qty</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scannedProducts.map((item) => (
                <tr key={item.barcode}>
                  <td>{item.barcode}</td>
                  <td>{item.title ?? '[No title]'}</td>
                  <td>{'€'+item.price ?? '[No price]'}</td>
                  <td>{item.qty ?? '[No stock]'}</td>
                  <td>{item.quantity}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => decrementQuantity(item.barcode)}
                      className="bg-red-100 text-red-600 hover:bg-red-300 px-2 py-1 rounded mr-2"
                    >
                      -
                    </button>
                    <button
                      onClick={() => incrementQuantity(item.barcode)}
                      className="bg-green-100 text-green-600 hover:bg-green-300 px-2 py-1 rounded mr-2"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeProduct(item.barcode)}
                      className="bg-gray-100 text-red-600 hover:bg-red-300 px-2 py-1 m-2 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Price:</td>
                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                  {'€'+scannedProducts.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0).toFixed(2)}
                </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </StyledTable>
        )}

        <div className="mt-4">
          <button
            onClick={handleSubmitOrder}
            disabled={loading || !scannedProducts.length}
            className="bg-highlight text-primary hover:bg-primary hover:text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Order'}
          </button>
          {successMsg && orderId && (
            <button
              onClick={handleDownloadInvoice}
              className="bg-primary text-white right-2 px-4 py-2 rounded mt-4"
            >
              Download Invoice
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}