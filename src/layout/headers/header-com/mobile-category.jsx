import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
// internal
import { useGetProductTypeCategoryQuery } from "@/redux/features/categoryApi";
import ErrorMsg from "@/components/common/error-msg";
import Loader from "@/components/loader/loader";

const MobileCategory = ({ isCategoryActive, categoryType }) => {
  const {data: categories,isError,isLoading} = useGetProductTypeCategoryQuery(categoryType);
  const [isActiveSubMenu,setIsActiveSubMenu] = useState("")
  const router = useRouter();

  // handleOpenSubMenu
  const handleOpenSubMenu = (title) => {
    if(title === isActiveSubMenu){
      setIsActiveSubMenu("")
    }
    else {
      setIsActiveSubMenu(title)
    }
  }

  // handle category route
  const handleCategoryRoute = (item) => {
    router.push(`/product-category/${item.slug}`);
  };
  // decide what to render
  let content = null;

  if (isLoading) {
    content = (
      <div className="py-5">
        <Loader loading={isLoading} />
      </div>
    );
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
      <li className="has-dropdown" key={item._id}>
        <a className="cursor-pointer" onClick={() => handleCategoryRoute(item)}>
          {item.img && (
            <span>
              <Image src={item.img} alt="cate img" width={50} height={50} />
            </span>
          )}
          {item.name}
          {item.children?.length > 0 && (
            <button onClick={(event)=> { event.stopPropagation(); handleOpenSubMenu(item.name); }} className="dropdown-toggle-btn">
              <i className="fa-regular fa-angle-right"></i>
            </button>
          )}
        </a>

        {item.children?.length > 0 && (
          <ul className={`tp-submenu ${isActiveSubMenu === item.name ? 'active':''}`}>
            {item.children.map((child, i) => (
              <li
                key={i}
                onClick={() => handleCategoryRoute(child, "children")}
              >
                <a className="cursor-pointer">{child}</a>
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  }
  return <ul className={isCategoryActive ? "active" : ""}>{content}</ul>;
};

export default MobileCategory;
