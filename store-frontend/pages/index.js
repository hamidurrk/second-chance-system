import Layout from "@/components/Layout";
import { useUser } from "@/components/UserContext";
import { fetchStoreData, fetchImageURL } from "@/utils/api";
import { useEffect, useState } from "react";

export default function Home() {
  const [store, setStore] = useState(null);
  const [storeImage, setStoreImage] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      fetchData();
    }
    }, [user]);

    async function fetchData() {
      const storeData = await fetchStoreData();
      setStore(storeData);
      if (storeData && storeData.image) {
        const image = await fetchImageURL(storeData.image);
        setStoreImage(image.image_url);
        console.log(image.image_url);
      }
    }

    function resetStoreData() { 
      setStore(null); 
      setStoreImage(null);  
    }

  return <Layout resetStoreData={resetStoreData}>
    <div className="text-primary flex justify-between">
      <h2>
        Hello, <b>{user?.name}</b>
      </h2>
    </div>
    {store && (
    <section className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image container */}
        <div className="max-h-96 aspect-square  bg-green-50 border border-primary rounded-md overflow-hidden flex items-center justify-center">
          {storeImage ? (
            <img
              src={storeImage} 
              alt={`${store.name} Storefront`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-400 italic">No image available</span>
          )}
        </div>

        {/* Store info */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-green-700 mb-2">
              {store.name || "Unnamed Store"}
            </h3>
            <p className="text-sm text-green-600 font-medium uppercase tracking-wide">
              ID: {store.id}
            </p>

            <p className="text-gray-700 mt-4">
              {store.description || "No description available..."}
            </p>

            <div className="mt-4">
              <p className="text-gray-700 text-sm">
                <strong>Location:</strong> {store.location}
              </p>
              <p className="text-gray-700 text-sm">
                <strong>City:</strong> {store.city}
              </p>
              {store.home_delivery ? (
                <p className="mt-2 bg-green-100 text-green-800 inline-block px-3 py-1 rounded-full text-sm font-semibold">
                  Home Delivery Available
                </p>
              ) : (
                <p className="mt-2 bg-red-100 text-red-800 inline-block px-3 py-1 rounded-full text-sm font-semibold">
                  No Home Delivery
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )}
  </Layout>
}
