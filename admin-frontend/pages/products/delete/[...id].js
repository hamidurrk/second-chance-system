import Layout from "@/components/Layout";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import axios from "axios";
import { fetchProductById, deleteProductById } from "@/utils/api";
import axiosInstance from "@/components/AxiosInstance";

export default function DeleteProductPage() {
  const router = useRouter();
  const [productInfo,setProductInfo] = useState();
  const {id} = router.query;
  useEffect(() => {
    if (!id) {
      return;
    }
    fetchProductById(id).then(data => {
      setProductInfo(data);
    });
  }, [id]);
  
  function goBack() {
    router.push('/products');
  }

  async function deleteProduct() {
    deleteProductById(id);
    goBack();
  }

  return (
    <Layout>
      <h1 className="text-center">Do you really want to delete
        &nbsp;&quot;{productInfo?.title}&quot;?
      </h1>
      <div className="flex gap-2 justify-center">
        <button
          onClick={deleteProduct}
          className="btn-red">Yes</button>
        <button
          className="btn-default"
          onClick={goBack}>
          NO
        </button>
      </div>
    </Layout>
  );
}
