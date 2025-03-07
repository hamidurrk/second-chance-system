import Header from "@/components/Header";
import styled from "styled-components";
import Center from "@/components/Center";
import ProductsGrid from "@/components/ProductsGrid";
import { fetchRecentProducts, searchProducts } from "@/utils/api";
import { useEffect, useState, useRef, use } from "react";
import debounce from "lodash.debounce";

const Title = styled.h2`
  font-size: 2rem;
  margin: 30px 0 20px;
  font-weight: normal;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 1rem;
`;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const observer = useRef();

  // useEffect(() => {
  //   window.location.reload();
  // }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const newProducts = await fetchRecentProducts(page);
        setProducts((prevProducts) => [...(prevProducts || []), ...newProducts]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setLoading(false);
      }
    }

    if (!searchTerm) {
      fetchData();
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const debouncedSearch = debounce(async (term) => {
      if (term) {
        try {
          setLoading(true);
          const searchResults = await searchProducts(term);
          setProducts(searchResults);
          setLoading(false);
        } catch (error) {
          console.error("Failed to search products:", error);
          setLoading(false);
        }
      } else {
        setPage(1);
        setProducts([]);
      }
    }, 300);

    debouncedSearch(searchTerm);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  const lastProductElementRef = useRef();

  useEffect(() => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prevPage) => prevPage + 1);
      }
    });

    if (lastProductElementRef.current) {
      observer.current.observe(lastProductElementRef.current);
    }
  }, [loading]);

  return (
    <>
      <Header />
      <Center>
        <Title>All products</Title>
        <SearchInput
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <ProductsGrid products={products} />
        <div ref={lastProductElementRef} />
        {loading && <p>Loading more products...</p>}
      </Center>
    </>
  );
}