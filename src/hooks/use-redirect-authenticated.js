import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

const safeRedirect = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/profile";

export default function useRedirectAuthenticated() {
  const router = useRouter();
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (router.isReady && accessToken) {
      router.replace(safeRedirect(router.query.redirect));
    }
  }, [accessToken, router]);

  return Boolean(accessToken);
}
