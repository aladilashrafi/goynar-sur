import CommonBreadcrumb from "@/components/breadcrumb/common-breadcrumb";
import ErrorMsg from "@/components/common/error-msg";
import SearchPrdLoader from "@/components/loader/search-prd-loader";
import EmptyState from "@/components/common/empty-state";
import ProductItem from "@/components/products/jewelry/product-item";
import SEO from "@/components/seo";
import Footer from "@/layout/footers/footer";
import HeaderTwo from "@/layout/headers/header-2";
import Wrapper from "@/layout/wrapper";
import { useGetShowCategoryQuery } from "@/redux/features/categoryApi";
import { useGetAllProductsQuery, useGetPopularProductByTypeQuery } from "@/redux/features/productApi";
import NiceSelect from "@/ui/nice-select";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

export default function SearchPage() {
  const router = useRouter();
  const query = router.query;
  const { searchText = "", productType = "" } = query;
  const productQuery = useMemo(() => {
    const params = new URLSearchParams();
    params.set("per_page", "48");
    if (searchText) params.set("search", searchText);
    if (productType && Number.isFinite(Number(productType))) params.set("category", productType);
    return params.toString();
  }, [productType, searchText]);

  const { data: products, isError, isLoading } = useGetAllProductsQuery(productQuery);
  const { data: categories } = useGetShowCategoryQuery();
  const { data: popularProducts } = useGetPopularProductByTypeQuery();
  const [shortValue, setShortValue] = useState("");
  const perView = 8;
  const [next, setNext] = useState(perView);

  const shortHandler = (e) => {
    setShortValue(e.value);
  };

  const handleLoadMore = () => {
    setNext((value) => value + 4);
  };

  let content = null;

  if (isLoading) {
    content = <SearchPrdLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = <ErrorMsg msg="Search is unavailable right now. Please try again soon." />;
  }

  if (!isLoading && !isError && products?.data?.length === 0) {
    content = (
      <div className="text-center pt-80 pb-80">
        <EmptyState
          title="No matching jewellery found"
          message={searchText ? `Nothing matched "${searchText}". Try another word or browse popular categories.` : "Start a new search or browse the collection."}
          actionHref="/shop"
          actionLabel="Browse Jewellery"
          secondaryHref="/contact"
          secondaryLabel="Ask For Help"
        />
        {categories?.result?.length > 0 && (
          <div className="mt-25">
            <p>Try a popular category:</p>
            {categories.result.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={`/product-category/${category.slug}`}
                className="tp-btn tp-btn-2 tp-btn-blue mr-10 mb-10"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
        {popularProducts?.data?.length > 0 && (
          <div className="mt-35">
            <p>Popular products may help you continue browsing.</p>
          </div>
        )}
      </div>
    );
  }

  if (!isLoading && !isError && products?.data?.length > 0) {
    let productItems = products.data;

    if (shortValue === "Price low to high") {
      productItems = productItems.slice().sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (shortValue === "Price high to low") {
      productItems = productItems.slice().sort((a, b) => Number(b.price) - Number(a.price));
    }

    content = (
      <section className="tp-shop-area pb-120">
        <div className="container">
          <div className="row">
            <div className="col-xl-12 col-lg-12">
              <div className="tp-shop-main-wrapper">
                <div className="tp-shop-top mb-45">
                  <div className="row">
                    <div className="col-xl-6">
                      <div className="tp-shop-top-left d-flex align-items-center">
                        <div className="tp-shop-top-result">
                          <p>
                            Showing 1-{productItems.length} of {products.count || productItems.length} results
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-xl-6">
                      <div className="tp-shop-top-right d-sm-flex align-items-center justify-content-xl-end">
                        <div className="tp-shop-top-select">
                          <NiceSelect
                            options={[
                              { value: "Sort By Price", text: "Sort By Price" },
                              { value: "Price low to high", text: "Price low to high" },
                              { value: "Price high to low", text: "Price high to low" },
                            ]}
                            defaultCurrent={0}
                            onChange={shortHandler}
                            name="Sort By Price"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="tp-shop-items-wrapper tp-shop-item-primary">
                  <div className="row">
                    {productItems.slice(0, next).map((item) => (
                      <div key={item._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                        <ProductItem product={item} />
                      </div>
                    ))}
                  </div>
                </div>

                {next < productItems.length && (
                  <div className="load-more-btn text-center pt-50">
                    <button onClick={handleLoadMore} className="tp-btn tp-btn-2 tp-btn-blue">
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <Wrapper>
      <SEO pageTitle="Search" />
      <HeaderTwo style_2={true} />
      <CommonBreadcrumb title="Search Products" subtitle="Search Products" />
      {content}
      <Footer primary_style={true} />
    </Wrapper>
  );
}
