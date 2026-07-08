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
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSuggestionsLoading(true);
      try {
        const response = await fetch(`/api/search/suggestions?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        setSuggestions(response.ok && data.success ? data.suggestions || [] : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSuggestionsLoading(false);
        }
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
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
