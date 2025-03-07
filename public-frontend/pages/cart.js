import Header from "@/components/Header";
import styled from "styled-components";
import Center from "@/components/Center";
import Button from "@/components/Button";
import { use, useContext, useEffect, useState } from "react";
import { CartContext } from "@/components/CartContext";
import axiosInstance from "@/components/AxiosInstance";
import axios from "axios";
import Table from "@/components/Table";
import Input from "@/components/Input";
import { fetchProductsByIdsX } from "@/utils/api";
import Modal from "react-modal";
import { loadStripe } from "@stripe/stripe-js";
import { useRouter } from "next/router";

const ColumnsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  @media screen and (min-width: 768px) {
    grid-template-columns: 1.2fr 0.8fr;
  }
  gap: 40px;
  margin-top: 40px;
`;

const Box = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
`;

const ProductInfoCell = styled.td`
  padding: 10px 0;
`;

const ProductImageBox = styled.div`
  width: 70px;
  height: 100px;
  padding: 2px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  img {
    max-width: 60px;
    max-height: 60px;
  }
  @media screen and (min-width: 768px) {
    padding: 10px;
    width: 100px;
    height: 100px;
    img {
      max-width: 80px;
      max-height: 80px;
    }
  }
`;

const QuantityLabel = styled.span`
  padding: 0 15px;
  display: block;
  @media screen and (min-width: 768px) {
    display: inline-block;
    padding: 0 10px;
  }
`;

const CityHolder = styled.div`
  display: flex;
  gap: 5px;
`;

const ModalContent = styled.div`
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 500px;
  margin: auto;
`;

export default function CartPage() {
  const { cartProducts, addProduct, removeProduct, clearCart } =
    useContext(CartContext);
  const [products, setProducts] = useState([]);
  // const [name, setName] = useState("Md Hamidur Rahman Khan");
  // const [email, setEmail] = useState("hamidurrk@gmail.com");
  // const [phoneNumber, setPhoneNumber] = useState("0417405324");
  // const [city, setCity] = useState("Lahti");
  // const [postalCode, setPostalCode] = useState("15300");
  // const [streetAddress, setStreetAddress] = useState("Oikokatu 2");
  // const [country, setCountry] = useState("Finland");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [country, setCountry] = useState("");
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [promptLogin, setPromptLogin] = useState(false);
  const [token, setToken] = useState(null);
  const [goToPayment, setGoToPayment] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState("storePickup");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      if (Object.keys(cartProducts).length > 0) {
        const data = await fetchProductsByIdsX(Object.keys(cartProducts));
        if (data && data.length > 0) {
          setProducts(data);
        }
      } else {
        setProducts([]);
      }
    }
    fetchData();
    // console.log(localStorage.getItem("token"));
  }, [cartProducts]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setPromptLogin(false);
      setGoToPayment(true);
    }
  }, [token]);

  useEffect(() => {
    if (goToPayment) {
      stripeCheckOut();
    }
  }, [goToPayment]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (window?.location.href.includes("success")) {
      setIsSuccess(true);
    }
  }, []);

  useEffect(() => {
    if (!window?.location.href.includes("success")) {
      localStorage.setItem("deliveryOption", deliveryOption);
    }
  }, [deliveryOption]);
  
  useEffect(() => {
    if (isSuccess && !hasSubmitted) {
      async function submitOrderAsync() {
        await submitOrder();
      }
      submitOrderAsync();
      setHasSubmitted(true);
    }
  }, [isSuccess, hasSubmitted]);

  function moreOfThisProduct(id) {
    addProduct(id);
  }

  function lessOfThisProduct(id) {
    removeProduct(id);
  }

  async function checkOut() {
    try {
      const endpoint =
        deliveryOption === "storePickup"
          ? "/orders/checkout-offline"
          : "/orders/checkout-online";
      const payload = {
        cart_items: cartProducts,
        name,
        email,
        phone_number: phoneNumber,
        password : password
      };

      if (deliveryOption === "homeDelivery") {
        payload.city = city;
        payload.postal_code = postalCode;
        payload.street_address = streetAddress;
        payload.country = country;
      }

      // store the payload in local storage
      localStorage.setItem("checkoutPayload", JSON.stringify(payload));

      const response = await axiosInstance.post(endpoint, payload);
      if (response.data.message === "Token received") {
        setGoToPayment(true);
      }
      if (response.data) {
        const { access_token } = response.data;
        setToken(access_token);
        console.log("Checkout success:", access_token);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        console.error("Checkout error detail:", err.response.data.detail);
        setError(err.response.data.detail);
        if (err.response.data.detail === "Password or JWT token required") {
          setPromptLogin(false);
          setShowModal(true);
        }
        if (err.response.data.detail === "User already exists") {
          setPromptLogin(true);
          setShowModal(true);
        }
      } else {
        console.error("Checkout error:", err);
        setError("Failed to process the order. Please try again later.");
      }
    }
  }

  async function submitOrder() {
    if (hasSubmitted) {
      return;
    }
    if (Object.keys(cartProducts).length === 0) {
      return;
    }
    console.log("Submitting order...");
    // retrive payload from local storage
    const storedPayload = localStorage.getItem("checkoutPayload");
    const payload = JSON.parse(storedPayload);
    const storedDeliveryOption = localStorage.getItem("deliveryOption");
    console.log("Delivery option:", storedDeliveryOption);
    const endpoint =
      storedDeliveryOption === "storePickup"
        ? "/orders/submit-order-offline"
        : "/orders/submit-order-online";
    console.log("Cart products:", cartProducts);

    const cartItems = products
      .map((p) => ({
        title: p.title,
        price: p.price,
        quantity: cartProducts[p.id],
      }))
      .filter((item) => item.quantity > 0);

    const response = await axiosInstance.post(endpoint, payload);
    console.log("Checkout success:", response.data);
    clearCart();
    localStorage.removeItem("checkoutPayload");
    localStorage.removeItem("deliveryOption");
  }

  function handleModalSubmit() {
    setShowModal(false);
    checkOut();
  }

  async function stripeCheckOut() {
    try {
      const cartItems = products
        .map((p) => ({
          title: p.title,
          price: p.price,
          quantity: cartProducts[p.id],
        }))
        .filter((item) => item.quantity > 0);
      console.log("Cart items:", cartItems);
      setGoToPayment(false);
      const { data } = await axiosInstance.post(
        "/orders/create-checkout-session",
        {
          cart_items: cartItems,
        }
      );
      const { sessionId } = data;

      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      );
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      console.error("Stripe checkout error:", err);
    }
  }

  function redirectToProducts() {
    router.push("/products");
  }

  let total = 0;
  for (const productId in cartProducts) {
    if (cartProducts.hasOwnProperty(productId)) {
      const product = products.find((p) => p.id === Number(productId));
      const price = product ? product.price : 0;
      const quantity = cartProducts[productId];
      total += price * quantity;
    }
  }

  if (isSuccess) {
    return (
      <>
        <Header />
        <Center>
          <ColumnsWrapper>
            <Box>
              <h1>Thanks for your order!</h1>
              <p>We will email you when your order will be sent.</p>
            </Box>
          </ColumnsWrapper>
          <Button black onClick={redirectToProducts}>
            Explore More
          </Button>
        </Center>
      </>
    );
  }

  return (
    <>
      <Header />
      <Center>
        <ColumnsWrapper>
          <Box>
            <h2>Cart</h2>
            {Object.keys(cartProducts).length === 0 && (
              <div>Your cart is empty</div>
            )}
            {products?.length > 0 && (
              <>
                <Table>
                  <thead>
                    <tr className="pb-2 pt-2 border-b-2 border-gray-200">
                      <th className="w-1/2 text-left">Product</th>
                      <th className="w-1/4 text-center !important">Quantity</th>
                      <th className="w-1/4 text-center !important">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const quantity = cartProducts[product.id] || 0;
                      return (
                        <tr
                          key={product.id}
                          className="border-b-2 border-gray-100"
                        >
                          <ProductInfoCell>
                            <ProductImageBox>
                              <img src={product.images[0]} alt="" />
                            </ProductImageBox>
                            {product.title}
                          </ProductInfoCell>
                          <td className="text-center">
                            <Button onClick={() => removeProduct(product.id)}>
                              -
                            </Button>
                            <QuantityLabel>{quantity}</QuantityLabel>
                            <Button onClick={() => addProduct(product.id)}>
                              +
                            </Button>
                          </td>
                          <td className="text-center">
                            €{(quantity * product.price).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td></td>
                      <td></td>
                      <td className="text-center">€{total.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </Table>
              </>
            )}
            <Button black onClick={clearCart}>
              Clear Cart
            </Button>
          </Box>
          {Object.keys(cartProducts).length > 0 && (
            <Box>
              <h2>Order information</h2>
              <div>
                <label>
                  <input
                    type="radio"
                    value="storePickup"
                    checked={deliveryOption === "storePickup"}
                    onChange={() => setDeliveryOption("storePickup")}
                  />
                  Store Pickup
                </label>
                <label>
                  <input
                    type="radio"
                    value="homeDelivery"
                    checked={deliveryOption === "homeDelivery"}
                    onChange={() => setDeliveryOption("homeDelivery")}
                  />
                  Home Delivery
                </label>
              </div>
              <Input
                type="text"
                placeholder="Name"
                value={name}
                name="name"
                onChange={(ev) => setName(ev.target.value)}
              />
              <Input
                type="text"
                placeholder="Email"
                value={email}
                name="email"
                onChange={(ev) => setEmail(ev.target.value)}
              />
              <Input
                type="text"
                placeholder="Phone Number"
                value={phoneNumber}
                name="phoneNumber"
                onChange={(ev) => setPhoneNumber(ev.target.value)}
              />
              {deliveryOption === "homeDelivery" && (
                <>
                  <CityHolder>
                    <Input
                      type="text"
                      placeholder="City"
                      value={city}
                      name="city"
                      onChange={(ev) => setCity(ev.target.value)}
                    />
                    <Input
                      type="text"
                      placeholder="Postal Code"
                      value={postalCode}
                      name="postalCode"
                      onChange={(ev) => setPostalCode(ev.target.value)}
                    />
                  </CityHolder>
                  <Input
                    type="text"
                    placeholder="Street Address"
                    value={streetAddress}
                    name="streetAddress"
                    onChange={(ev) => setStreetAddress(ev.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Country"
                    value={country}
                    name="country"
                    onChange={(ev) => setCountry(ev.target.value)}
                  />
                </>
              )}
              <Button black block onClick={checkOut}>
                Check Out
              </Button>
              {error && (
                <div style={{ color: "red", marginTop: "10px" }}>
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </div>
              )}
            </Box>
          )}
        </ColumnsWrapper>
      </Center>
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Password Required"
        ariaHideApp={false}
        className="w-1/2 mx-auto mt-20"
      >
        <ModalContent>
          <h2>
            {promptLogin
              ? "Login Required"
              : "Enter Password to Create New Account"}
          </h2>
          {promptLogin ? (
            <p>Please log in to continue with your order.</p>
          ) : (
            <p>
              You need to create an account before ordering. Please check your
              email and enter your password.
            </p>
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            readOnly={promptLogin}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
          />
          <Button black block onClick={handleModalSubmit}>
            Submit
          </Button>
        </ModalContent>
      </Modal>
    </>
  );
}
