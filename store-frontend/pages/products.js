import Layout from "@/components/Layout";
import Link from "next/link";
import {useEffect, useState} from "react";
import axiosInstance from "@/components/AxiosInstance";
import { fetchProducts, fetchCategories } from "@/utils/api";
import { useUser } from "@/components/UserContext";
import DownloadBarcodeButton from '@/components/DownloadBarcodeButton';

export default function Products() {
  const [products,setProducts] = useState([]);
  const [categories,setCategories] = useState([]);
  const { user } = useUser();
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const productsData = await fetchProducts();
    const categoriesData = await fetchCategories();
    setProducts(productsData);
    setCategories(categoriesData);
  }

  function getCategory(categoryIds) {
    if (!categoryIds || !Array.isArray(categoryIds)) return 'N/A';
    const categoryNames = categoryIds.map(categoryId => {
      const category = categories.find(category => category.id === categoryId);
      return category ? category.name : 'N/A';
    });
    return categoryNames.join(', ');
  }

  return (
    <Layout>
      <Link className="btn-primary" href={'/products/new'}>Add new product</Link>
      <table className="basic mt-2">
        <thead>
          <tr className="border-b-2 border-gray-200 bord">
          <td className="w-1/24">Id</td>
          <td className="w-10/24">Product name</td>
          <td className="w-3/24">Product price</td>
          <td className="w-8/24">Product category</td>
          <td className="w-2/24"></td>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td>{product.id}</td>
              <td >{product.title}</td>
              <td>{product.price}</td>
              <td>{getCategory(product.category)}</td>
              <td className="flex flex-col gap-2 m-1">
                <Link className="flex items-center justify-center w-full hover:bg-highlight text-primary" href={'/products/edit/'+product.id}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  {/* Edit */}
                </Link>
                {user?.is_admin && (<Link className=" flex items-center justify-center w-full hover:bg-red-100 text-red-500" href={'/products/delete/'+product.id}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  {/* Delete */}
                </Link>)}
                <DownloadBarcodeButton productId={product.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}