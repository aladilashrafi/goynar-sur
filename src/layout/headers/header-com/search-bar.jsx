import React from "react";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import SearchSuggestionItem from "@/components/common/search-suggestion-item";

const SearchBar = ({ isSearchOpen, setIsSearchOpen }) => {
  const {
    setSearchText,
    setCategory,
    handleSubmit,
    searchText,
    suggestions,
    isSuggestionsLoading,
    handleSuggestionClick,
  } = useSearchFormSubmit();
  const { data: categories } = useGetShowCategoryQuery();

  // selectHandle
  const handleCategory = (value) => {
    setCategory(value);
  };

  const categoryItems = categories?.result || [];
  return (
    <>
      <section
        className={`tp-search-area tp-search-style-brown ${
          isSearchOpen ? "opened" : ""
        }`}
      >
        <div className="container">
          <div className="row">
            <div className="col-xl-12">
              <div className="tp-search-form">
                <div
                  onClick={() => setIsSearchOpen(false)}
                  className="tp-search-close text-center mb-20"
                >
                  <button className="tp-search-close-btn tp-search-close-btn"></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="tp-search-input mb-10">
                    <input
                      onChange={(e) => setSearchText(e.target.value)}
                      value={searchText}
                      type="text"
                      placeholder="Search for product..."
                    />
                    <button type="submit">
                      <i className="flaticon-search-1"></i>
                    </button>
                    {(isSuggestionsLoading || suggestions.length > 0) && (
                      <div className="tp-search-suggestions">
                        {isSuggestionsLoading && <span>Searching...</span>}
                        {!isSuggestionsLoading &&
                          suggestions.map((product) => (
                            <SearchSuggestionItem
                              key={product._id}
                              product={product}
                              onSelect={(selectedProduct) => {
                                setIsSearchOpen(false);
                                handleSuggestionClick(selectedProduct);
                              }}
                            />
                          ))}
                      </div>
                    )}
                  </div>
                  <div className="tp-search-category">
                    <span>Search by : </span>
                    {categoryItems.map((c, i) => (
                      <a
                        key={c.id}
                        onClick={() => handleCategory(String(c.id))}
                        className="cursor-pointer"
                      >
                        {c.name}
                        {i < categoryItems.length - 1 && ", "}
                      </a>
                    ))}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* body overlay */}
      <div
        onClick={() => setIsSearchOpen(false)}
        className={`body-overlay ${isSearchOpen ? "opened" : ""}`}
      ></div>
    </>
  );
};

export default SearchBar;
