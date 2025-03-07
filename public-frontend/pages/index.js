import Header from "@/components/Header";
import Featured from "@/components/Featured";
import NewProducts from "@/components/NewProducts";
import { useEffect, useState } from "react";
import {fetchRecentProducts} from "@/utils/api";


export default function HomePage() {
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const products = await fetchRecentProducts(1);
        setFeaturedProduct(products?.[0] || null);
        setNewProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div>
      <Header />
      {/* <Featured product={featuredProduct} /> */}
      <NewProducts products={newProducts} />
    </div>
  );
}

// export async function getServerSideProps() {
//   const featuredProductId = '67b5b1f2c866965ae9d8599a';
//   await mongooseConnect();
//   const featuredProduct = await Product.findById(featuredProductId);
//   const newProducts = await Product.find({}, null, {sort: {'_id':-1}, limit:10});
//   return {
//     props: {
//       featuredProduct: JSON.parse(JSON.stringify(featuredProduct)),
//       newProducts: JSON.parse(JSON.stringify(newProducts)),
//     },
//   };
// }