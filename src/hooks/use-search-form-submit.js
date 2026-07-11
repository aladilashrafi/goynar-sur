import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { productUrl } from "@/utils/routes";

const useSearchFormSubmit = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);

  useEffect(() => {
    const query = searchText.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    let isActive = true;
    let requestStarted = false;
    const timer = setTimeout(async () => {
      requestStarted = true;
      if (isActive) setIsSuggestionsLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (isActive) {
          setSuggestions(response.ok && data.success ? data.suggestions || [] : []);
        }
      } catch (error) {
        if (isActive && error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        if (isActive && !controller.signal.aborted) {
          setIsSuggestionsLoading(false);
        }
      }
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(timer);
      if (requestStarted && !controller.signal.aborted) {
        const reason =
          typeof DOMException === "function"
            ? new DOMException("Search suggestion request cancelled.", "AbortError")
            : "Search suggestion request cancelled.";
        controller.abort(reason);
      }
    };
  }, [searchText]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (searchText) {
      let route = `/search?searchText=${encodeURIComponent(searchText)}`;

      if (category && category !== "Select Category") {
        route += `&productType=${encodeURIComponent(category)}`;
        setCategory("");
      }

      router.push(route, null, { scroll: false });
      setSearchText("");
      setSuggestions([]);
    } else {
      router.push(`/`, null, { scroll: false });
      setSearchText("");
      setCategory("");
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    if (!product?._id) return;
    setSearchText("");
    setSuggestions([]);
    router.push(productUrl(product));
  };

  return {
    searchText,
    category,
    setSearchText,
    setCategory,
    handleSubmit,
    suggestions,
    isSuggestionsLoading,
    handleSuggestionClick,
  };
};

export default useSearchFormSubmit;
