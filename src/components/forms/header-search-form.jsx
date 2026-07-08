import { useState } from "react";
// internal
import { Search } from "@/svg";
import NiceSelect from "@/ui/nice-select";
import useSearchFormSubmit from "@/hooks/use-search-form-submit";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";

const HeaderSearchForm = () => {
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
  const categoryOptions = [
    { value: "Select Category", text: "Select Category" },
    ...(categories?.result || []).map((category) => ({
      value: String(category.id),
      text: category.name,
    })),
  ];

  // selectHandle
  const selectCategoryHandle = (e) => {
    setCategory(e.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="tp-header-search-wrapper d-flex align-items-center">
        <div className="tp-header-search-box">
          <input
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            type="text"
            placeholder="Search for Products..."
          />
          {(isSuggestionsLoading || suggestions.length > 0) && (
            <div className="tp-header-search-suggestions">
              {isSuggestionsLoading && <span>Searching...</span>}
              {!isSuggestionsLoading &&
                suggestions.map((product) => (
                  <button key={product._id} type="button" onClick={() => handleSuggestionClick(product)}>
                    {product.title}
                    <small>{product.parent}</small>
                  </button>
                ))}
            </div>
          )}
        </div>
        <div className="tp-header-search-category">
          <NiceSelect
            options={categoryOptions}
            defaultCurrent={0}
            onChange={selectCategoryHandle}
            name="Select Category"
          />
        </div>
        <div className="tp-header-search-btn">
          <button type="submit">
            <Search />
          </button>
        </div>
      </div>
    </form>
  );
};

export default HeaderSearchForm;
