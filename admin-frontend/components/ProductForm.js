import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
import { fetchCategories, fetchProductById } from "@/utils/api";
import axiosInstance from "./AxiosInstance";

export default function ProductForm({
  id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [category, setCategory] = useState(assignedCategory || '');
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [price, setPrice] = useState(existingPrice || '');
  const [images, setImages] = useState(existingImages || []);
  const [imageIds, setImageIds] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [propertiesToFill, setPropertiesToFill] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      if (id) {
        const productData = await fetchProductById(id);
        setTitle(productData.title);
        setDescription(productData.description);
        setPrice(productData.price);
        setImages(productData.images);
        setCategory(productData.category);
        setProductProperties(productData.properties);
        setImageIds(productData.imageIds || []);
      }
    }
    fetchData();
    fillImageURLs();
  }, [id]);

  useEffect(() => {
    fillImageURLs();
  }, [images]);

  useEffect(() => {
    if (categories.length > 0 && category) {
      let catInfo = categories.find(({ id }) => id === category);
      const newPropertiesToFill = [];
      if (catInfo) {
        newPropertiesToFill.push(...Object.entries(catInfo.properties));
        while (catInfo?.parent?.id) {
          const parentCat = categories.find(({ id }) => id === catInfo?.parent?.id);
          if (parentCat) {
            newPropertiesToFill.push(...Object.entries(parentCat.properties));
            catInfo = parentCat;
          } else {
            break;
          }
        }
      }
      setPropertiesToFill(newPropertiesToFill);
    }
  }, [category, categories]);

  async function fillImageURLs() {
    const imageUrlList = await Promise.all(images.map(async (imageId) => {
      const response = await axiosInstance.get(`/image/${imageId}`);
      // console.log('Image URL:', response.data.image_url);
      return response.data.image_url;
    }));
    setImageURLs(imageUrlList);
    console.log('Image URLs:', imageURLs);
  }

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title, description, price, images, category,
      properties: productProperties,
      imageIds
    };
    try {
      if (id) {
        // update
        await axiosInstance.put(`/products/${id}`, data);
      } else {
        // create
        await axiosInstance.post('/products', data);
      }
      setGoToProducts(true);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }

  if (goToProducts) {
    router.push('/products');
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      // Add product ID to the FormData
      data.append('product_id', id);
      try {
        const res = await axiosInstance.post('/image/upload', data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log(res.data);

        const newImageId = res.data.image_id;
        setImages(oldImageIds => [...oldImageIds, newImageId]);
        console.log('Images:', images);

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

  function setProductProp(propName, value) {
    setProductProperties(prev => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="product name"
        value={title}
        onChange={ev => setTitle(ev.target.value)} />
      <label>Category</label>
      <select
        value={category}
        onChange={ev => setCategory(parseInt(ev.target.value))}
      >
        <option value="">Select category</option>
        {categories.length > 0 && categories.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {propertiesToFill && (propertiesToFill.length > 0 && propertiesToFill.map(([propName, propValues]) => (
        <div key={propName} className="">
          <label>{propName[0].toUpperCase() + propName.substring(1)}</label>
          <div>
            {propValues.length > 0 ? (
              <select value={productProperties[propName]}
                onChange={ev =>
                  setProductProp(propName, ev.target.value)
                }
              >
                {propValues.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={productProperties[propName] || ''}
                onChange={ev =>
                  setProductProp(propName, ev.target.value)
                }
              />
            )}
          </div>
        </div>
      )))}
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
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div>
            Add image
          </div>
          <input type="file" onChange={uploadImages} className="hidden" />
        </label>
      </div>
      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={ev => setDescription(ev.target.value)}
      />
      <label>Price (in Euro)</label>
      <input
        type="number" placeholder="price"
        value={price}
        onChange={ev => setPrice(ev.target.value)}
      />
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