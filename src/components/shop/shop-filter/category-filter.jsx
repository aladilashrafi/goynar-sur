import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
// internal
import ErrorMsg from "@/components/common/error-msg";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { handleFilterSidebarClose } from "@/redux/features/shop-filter-slice";
import ShopCategoryLoader from "@/components/loader/shop/shop-category-loader";

const CategoryFilter = ({setCurrPage,shop_right=false}) => {
  const { data: categories, isLoading, isError } = useGetShowCategoryQuery();
  const router = useRouter();
  const dispatch = useDispatch();

  // handle category route
  const handleCategoryRoute = (categoryId) => {
    setCurrPage(1);
    const nextQuery = { ...router.query };

    if (String(router.query.category) === String(categoryId)) {
      delete nextQuery.category;
      delete nextQuery.category_label;
    } else {
      const category = categories?.result?.find((item) => Number(item.id) === Number(categoryId));
      nextQuery.category = String(categoryId);
      nextQuery.category_label = category?.name || "";
    }

    router.push({ pathname: "/shop", query: nextQuery }, undefined, { scroll: false });
    dispatch(handleFilterSidebarClose());
  }
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <ShopCategoryLoader loading={isLoading}/>;
  }
  if (!isLoading && isError) {
    content = <ErrorMsg msg="There was an error" />;
  }
  if (!isLoading && !isError && categories?.result?.length === 0) {
    content = <ErrorMsg msg="No Category found!" />;
  }
  if (!isLoading && !isError && categories?.result?.length > 0) {
    const category_items = categories.result;
    content = category_items.map((item) => (
      <li key={item._id}>
        <a
          onClick={() => handleCategoryRoute(item.id)}
          style={{ cursor: "pointer" }}
          className={
            String(router.query.category) === String(item.id)
              ? "active"
              : ""
          }
        >
          {item.name} <span>{item.count}</span>
        </a>
      </li>
    ));
  }
  return (
    <>
      <div className="tp-shop-widget mb-50">
        <h3 className="tp-shop-widget-title">Categories</h3>
        <div className="tp-shop-widget-content">
          <div className="tp-shop-widget-categories">
            <ul>{content}</ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryFilter;
