import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
import { fetchCategories, fetchProductById } from "@/utils/api";
import axiosInstance from "./AxiosInstance";

export default function ProductForm({
  id,
  assignedCategories = [],
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  properties: assignedProperties = {}, // Default to an empty object
}) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [productProperties, setProductProperties] = useState(assignedProperties || {});
  const [price, setPrice] = useState(existingPrice || '');
  const [images, setImages] = useState(existingImages || []);
  const [imageIds, setImageIds] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [propertiesToFill, setPropertiesToFill] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    if (Array.isArray(assignedCategories) && assignedCategories.length > 0) {
      return assignedCategories;
    }
    return ['']; // Show one empty category slot if none assigned
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
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
        setProductProperties(productData.properties || {}); // Ensure it's an object
        setImageIds(productData.imageIds || []);

        if (Array.isArray(productData.category)) {
          setSelectedCategories(productData.category);
        } else {
          setSelectedCategories(productData.category ? [productData.category] : []);
        }
      }
    }
    fetchData();
    fillImageURLs();
  }, [id]);

  useEffect(() => {
    fillImageURLs();
  }, [images]);

  useEffect(() => {
    if (categories.length === 0 || selectedCategories.length === 0) {
      setPropertiesToFill([]);
      return;
    }

    const collectedProperties = new Map();

    selectedCategories.forEach(catId => {
      let catInfo = categories.find(c => c.id === catId);
      while (catInfo) {
        if (catInfo.properties) {
          for (const [propName, propValues] of Object.entries(catInfo.properties)) {
            if (!collectedProperties.has(propName)) {
              collectedProperties.set(propName, new Set());
            }
            propValues.forEach(v => collectedProperties.get(propName).add(v));
          }
        }
        if (catInfo.parent?.id) {
          catInfo = categories.find(c => c.id === catInfo.parent.id);
        } else {
          catInfo = null;
        }
      }
    });

    const mergedProperties = [];
    for (const [name, valuesSet] of collectedProperties.entries()) {
      mergedProperties.push([name, Array.from(valuesSet)]);
    }

    setPropertiesToFill(mergedProperties);
  }, [selectedCategories, categories]);

  async function fillImageURLs() {
    if (!images || images.length === 0) {
      setImageURLs([]);
      return;
    }
    const imageUrlList = await Promise.all(images.map(async (imageId) => {
      const response = await axiosInstance.get(`/image/${imageId}`);
      return response.data.image_url;
    }));
    setImageURLs(imageUrlList);
  }

  async function saveProduct(ev) {
    ev.preventDefault();
    const data = {
      title,
      description,
      price,
      images: images.map(String),
      category: selectedCategories,
      properties: productProperties,
    };

    try {
      if (id) {
        await axiosInstance.put(`store/products/${id}`, data);
      } else {
        const response = await axiosInstance.post('store/products', data);
        await uploadNewImage(response.data.product_id);
      }
      setGoToProducts(true);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  }

  if (goToProducts) {
    router.push('/products');
  }

  async function handleImage(ev) {
    if (id) {
      await uploadImages(ev);
    } else {
      const files = ev.target.files;
      if (files.length > 0) {
        setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
        const fileURLs = Array.from(files).map(file => URL.createObjectURL(file));
        setImageURLs(prevURLs => [...prevURLs, ...fileURLs]);
      }
    }
  }

  async function uploadNewImage(product_id) {
    if (selectedFiles.length > 0) {
      for (const file of selectedFiles) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('product_id', product_id);
        try {
          const res = await axiosInstance.post('/image/upload', formData, {
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
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      data.append('product_id', id);
      try {
        const res = await axiosInstance.post('/image/upload', data, {
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

  function updateImagesOrder(newOrder) {
    setImages(newOrder);
  }

  function setProductProp(propName, value) {
    setProductProperties(prev => ({
      ...prev,
      [propName]: value
    }));
  }

  function addCategory() {
    setSelectedCategories(prev => [...prev, '']);
  }

  function removeCategory(index) {
    setSelectedCategories(prev => prev.filter((_, i) => i !== index));
  }

  function handleCategoryChange(index, newValue) {
    setSelectedCategories(prev => {
      const updated = [...prev];
      updated[index] = parseInt(newValue) || '';
      return updated;
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

      <label>Categories</label>
      {selectedCategories.map((cat, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px' }}>
          <select
            value={cat}
            onChange={ev => handleCategoryChange(index, ev.target.value)}
          >
            <option value="">Select category</option>
            {categories.length > 0 && categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {selectedCategories.length > 1 && (
            <button type="button" onClick={() => removeCategory(index)}>
              -
            </button>
          )}
          {index === selectedCategories.length - 1 && (
            <button type="button" onClick={addCategory}>+</button>
          )}
        </div>
      ))}

      {propertiesToFill?.length > 0 && propertiesToFill.map(([propName, propValues]) => (
        <div key={propName}>
          <label>{propName[0].toUpperCase() + propName.substring(1)}</label>
          {propValues.length > 0 ? (
            <select
              value={productProperties[propName] ?? ''} // Use nullish coalescing operator to handle null/undefined
              onChange={ev => setProductProp(propName, ev.target.value)}
            >
              <option value="">Select {propName}</option>
              {propValues.map(v => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={productProperties[propName] ?? ''} // Use nullish coalescing operator to handle null/undefined
              onChange={ev => setProductProp(propName, ev.target.value)}
            />
          )}
        </div>
      ))}

      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-1">
        <ReactSortable
          list={imageURLs}
          className="flex flex-wrap gap-1"
          setList={updateImagesOrder}>
          {imageURLs?.map(link => (
            <div
              key={link}
              className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
            >
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24"
            strokeWidth={1.5} stroke="currentColor"
            className="w-6 h-6"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5
                 A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0
                 0l4.5 4.5M12 3v13.5" 
            />
          </svg>
          <div>Add image</div>
          <input type="file" onChange={handleImage} className="hidden" />
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
        type="number"
        placeholder="price"
        value={price}
        onChange={ev => setPrice(ev.target.value)}
      />

      <button type="submit" className="btn-primary">Save</button>
      <button
        type="button"
        className="btn-default ml-4"
        onClick={() => router.back()}>
        Cancel
      </button>
    </form>
  );
}