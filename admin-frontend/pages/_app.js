import '@/styles/globals.css';
import { useEffect } from "react";
import { useRouter } from "next/router";
import { UserProvider } from '@/components/UserContext';

function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const { token } = router.query;
    if (token) {
      localStorage.setItem("token", token);
      router.replace(router.pathname);
    }
  }, [router.query]);

  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default App;