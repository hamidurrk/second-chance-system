import styled from "styled-components";
import Button from "@/components/Button";
import CartIcon from "@/components/icons/CartIcon";
import Link from "next/link";
import { use, useContext } from "react";
import { CartContext } from "@/components/CartContext";
import { fetchImageURL } from "@/utils/api";
import { useEffect, useState } from "react";

const ProductWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WhiteBox = styled(Link)`
  background-color: #fff;
  padding: 20px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  min-height: 280px;
  max-height: 320px;
  // height: 300px;
  img {
    max-width: 200px;
    max-height: 250px;
  }
`;

const TitleWrapper = styled.div`
  position: relative;
  display: inline-block;
  /* Ensure no overflow hidden here so the tooltip can appear */

  &:hover .tooltip {
    opacity: 1;
    transform: translateY(0);
  }
`;

const TitleText = styled(Link)`
  font-weight: normal;
  font-size: 1rem;
  color: inherit;
  text-decoration: none;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2rem; /* Adjust the line height as needed */
  height: 2.4rem;
`;

const Tooltip = styled.div`
  position: absolute;
  left: 0;
  top: 100%;
  // white-space: nowrap;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  z-index: 9999;
  transform: translateY(5px);
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  pointer-events: none; /* so it doesn't block hover */
`;

const ProductInfoBox = styled.div`
  margin-top: 5px;
`;

const PriceRow = styled.div`
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: space-between;
  margin-top: 2px;
`;

const Price = styled.div`
  font-size: 1rem;
  font-weight: 400;
  text-align: right;
  @media screen and (min-width: 768px) {
    font-size: 1.2rem;
    font-weight: 600;
    text-align: left;
  }
`;

export default function ProductBox({ id, title, description, price, images }) {
  const { addProduct } = useContext(CartContext);
  const [imageURL, setImageURL] = useState([]);
  const url = "/product/" + id;

  async function fetchImage(image_id) {
    const url = await fetchImageURL(image_id);
    if (url) {
      setImageURL(url.image_url);
    }
  }

  useEffect(() => {
    if (images && images.length > 0) {
      fetchImage(images[0]);
    }
    // console.log(imageURL);
  }, [images]);

  // if (images && images.length > 0) {
  //   // console.log("ProductBox:", id, title, description, price, images[0]);
  //   // fetchImage(images[0]);
  // }

  return (
    <ProductWrapper>
      <WhiteBox href={url} className="w-full h-4/5">
        <div>{imageURL && <img src={imageURL} alt="" />}</div>
      </WhiteBox>
      <ProductInfoBox>
        <TitleWrapper>
          <TitleText href={url}>{title}</TitleText>
          <Tooltip className="tooltip">{title}</Tooltip>
        </TitleWrapper>
        <PriceRow>
          <Price>€{price}</Price>
          <div>
            {/* <Button block onClick={() => addProduct(id)} primary outline >
              Add to cart
            </Button> */}
            <button
              onClick={() => addProduct(id)}
              className="btn btn-primary pr-2"
            >
              <CartIcon />
            </button>
          </div>
        </PriceRow>
      </ProductInfoBox>
    </ProductWrapper>
  );
}
