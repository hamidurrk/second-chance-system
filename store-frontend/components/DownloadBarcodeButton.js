import React from "react";
import axiosInstance from "@/components/AxiosInstance";

function DownloadBarcodeButton({ productId }) {
  const handleDownload = async () => {
    try {
      const response = await axiosInstance.get(`/store/employee/product/barcode/${productId}`, {
        responseType: 'blob' 
      });
      if (response.status !== 200) {
        throw new Error("Failed to download barcode");
      }
      const blob = new Blob([response.data], { type: 'image/png' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `barcode_${productId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading barcode:", err);
    }
  };

  return (
    <button onClick={handleDownload}>
      Download Barcode
    </button>
  );
}

export default DownloadBarcodeButton;