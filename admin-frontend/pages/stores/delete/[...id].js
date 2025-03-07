import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { fetchStoreById, deleteStoreById } from "@/utils/api";

export default function DeleteProductPage() {
  const router = useRouter();
  const [storeInfo, setStoreInfo] = useState(null);
  const { id } = router.query;

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchStoreById(id).then(data => {
      console.log(data);
      setStoreInfo(data);
    });
  }, [id]);

  function goBack() {
    router.push('/stores');
  }

  async function deleteProduct() {
    await deleteStoreById(id);
    goBack();
  }

  const store = Array.isArray(storeInfo) ? storeInfo[0] : storeInfo;

  return (
    <Layout>
      <h1 className="text-center">Do you really want to delete
        &nbsp;&quot;{store?.store_name}&quot;?
      </h1>
      {store && (
        <div className="text-center">
          <p>City: {store.city}</p>
          <p>Description: {store.description}</p>
          <p>Location: {store.location}</p>
          <p>Store Admin Email: {store.store_admin_email}</p>
          <p>Store Admin Name: {store.store_admin_name}</p>
        </div>
      )}
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