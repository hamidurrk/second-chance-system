import Center from "@/components/Center";
import Header from "@/components/Header";
import Title from "@/components/Title";
import styled from "styled-components";
import WhiteBox from "@/components/WhiteBox";
import ProductImages from "@/components/ProductImages";
import Button from "@/components/Button";
import CartIcon from "@/components/icons/CartIcon";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CartContext } from "@/components/CartContext";
import { fetchProductById, fetchImageURL } from "@/utils/api";

const ColWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media screen and (min-width: 768px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
  @media screen and (min-width: 1024px) {
    grid-template-columns: .8fr 1.2fr;
  }
  gap: 40px;
  margin: 40px 0;
`;
const PriceRow = styled.div`
  display: flex;
  gap: 40px;
  align-items: center;
`;
const Price = styled.span`
  font-size: 1.4rem;
`;

export default function ProductPage() {
  const { addProduct } = useContext(CartContext);
  const router = useRouter();
  const { id } = router.query;
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageURLs, setImageURLs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const productFetched = await fetchProductById(id);
        setProductData(productFetched);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setLoading(false);
      }
    }
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    async function fetchImages() {
      if (productData && productData.images) {
        const urls = await Promise.all(productData.images.map(async (imageId) => {
          const response = await fetchImageURL(imageId);
          return response.image_url;
        }));
        setImageURLs(urls);
      }
    }
    fetchImages();
  }, [productData]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!productData) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <Header />
      <Center>
        <ColWrapper>
          <WhiteBox>
            <ProductImages images={imageURLs} />
          </WhiteBox>
          <div>
            <Title className="mb-4">{productData.title}</Title>
            <PriceRow>
              <div>
                <Price>€{productData.price}</Price>
              </div>
              <div>
                <Button primary onClick={() => addProduct(productData.id)}>
                  <CartIcon />Add to cart
                </Button>
              </div>
            </PriceRow>
          </div>
        </ColWrapper>
        <p>{productData.description}</p>
      </Center>
    </>
  );
}