import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
import { fetchCategories, fetchProductById, fetchCities } from "@/utils/api";
import axiosInstance from "./AxiosInstance";
import Select from 'react-select';
import { set } from "mongoose";

export default function StoreForm({
}) {
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [storeAdminName, setStoreAdminName] = useState('');
  const [storeAdminEmail, setStoreAdminEmail] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [city, setCity] = useState('');
  const [images, setImages] = useState([]);
  const [imageIds, setImageIds] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const citiesData = await fetchCities();
      setCities(citiesData);
    }
    fetchData();
    fillImageURLs();
  }, []);

  useEffect(() => {
    fillImageURLs();
  }, [images]);

  async function fillImageURLs() {
    const imageUrlList = await Promise.all(images.map(async (imageId) => {
      const response = await axiosInstance.get(`/image/${imageId}`);
      // console.log('Image URL:', response.data.image_url);
      return response.data.image_url;
    }));
    setImageURLs(imageUrlList);
    // console.log('Image URLs:', imageURLs);
  }

  async function saveStore(ev) {
    ev.preventDefault();
    const data = {
      storeName, storeDescription, city, storeLocation, storeAdminName, storeAdminEmail
    };
    try {
        // create
      const response = await axiosInstance.post('/admin/new-store', data);
      console.log('Store created:', response.data);
      await uploadImage(response.data.store_id);
      setGoToProducts(true);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  
  }

  async function uploadImage(store_id) {
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('file', file);
      });
      formData.append('store_id', store_id);
      try {
        const res = await axiosInstance.post('/admin/image/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const newImageId = res.data.image_id;
        setImages(oldImageIds => [...oldImageIds, newImageId]);
      } catch (error) {
        console.error('Error uploading images:', error);
      } finally {
        setIsUploading(false);
      }
    }
  }

  function handleFileChange(ev) {
    const files = ev.target.files;
    if (files.length > 0) {
      setSelectedFiles(Array.from(files));
      const fileURLs = Array.from(files).map(file => URL.createObjectURL(file));
      setImageURLs(fileURLs);
    }
  }

  if (goToProducts) {
    router.push('/');
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      try {
        const res = await axiosInstance.post('/admin/image/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // console.log(res.data);

        const newImageId = res.data.image_id;
        setImages(oldImageIds => [...oldImageIds, newImageId]);
        // console.log('Images:', images);

        // Fetch image URLs
        // const imageUrls = await Promise.all(newImageId.map(async (imageId) => {
        //   const response = await axiosInstance.get(`/image/${imageId}`);
        //   return response.data.image_url;
        // }));

        // setImages(oldImages => [...oldImages, ...imageUrls]);
      } catch (error) {
        console.error('Error uploading images:', error);
      } finally {
        setIsUploading(false);
      }
    }
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  return (
    <form onSubmit={saveStore}>
      <label>Store name</label>
      <input
        type="text"
        placeholder="Store name"
        value={storeName}
        onChange={ev => setStoreName(ev.target.value)} />
      <label>Description</label>
      <textarea
        placeholder="Description"
        value={storeDescription}
        onChange={ev => setStoreDescription(ev.target.value)}
      />
      <label>City</label>
      <Select
        value={city ? { value: city, label: city } : null}
        onChange={selectedOption => setCity(selectedOption ? selectedOption.value : '')}
        options={cities.map(c => ({ value: c, label: c }))}
        placeholder="Select city"
      />
      <label>Store location</label>
      <input
        type="text"
        placeholder="Store location"
        value={storeLocation}
        onChange={ev => setStoreLocation(ev.target.value)} />
      <label>
        Photos
      </label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={imageURLs}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}>
          {!!imageURLs?.length && imageURLs.map(link => (
            <div key={link} className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
              <img src={link} alt="" className="rounded-lg" />
            </div>
          ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        {imageURLs.length === 0 && (
          <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              Add image
            </div>
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>
      <label>Store admin name</label>
      <input
        type="text"
        placeholder="Store admin name"
        value={storeAdminName}
        onChange={ev => setStoreAdminName(ev.target.value)} />
      <label>Store admin email</label>
      <input
        type="email"
        placeholder="Store admin email"
        value={storeAdminEmail}
        onChange={ev => setStoreAdminEmail(ev.target.value)} />
      <button
        type="submit"
        className="btn-primary">
        Save
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