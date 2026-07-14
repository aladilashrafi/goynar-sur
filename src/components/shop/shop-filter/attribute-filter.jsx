import React from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { useGetProductFiltersQuery } from "@/redux/features/productApi";
import { handleFilterSidebarClose } from "@/redux/features/shop-filter-slice";

const COLOR_KEYS = new Set(["color", "colour"]);

function normalizeKey(value = "") {
  return String(value)
    .replace(/^pa_/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const AttributeFilter = ({ setCurrPage }) => {
  const { data: filters, isLoading, isError } = useGetProductFiltersQuery();
  const router = useRouter();
  const dispatch = useDispatch();
  const attributes = filters?.attributes || [];

  function getSelectedValues(key) {
    const value = router.query[key];
    if (!value) return [];
    return String(value).split(",").filter(Boolean);
  }

  const handleAttributeRoute = (attribute, option) => {
    setCurrPage(1);
    const nextQuery = { ...router.query };
    const taxonomy = attribute.taxonomy || attribute.slug;
    const queryKey = `attr_${taxonomy}`;
    const labelKey = `attr_label_${taxonomy}`;
    const termLabelKey = `attr_term_labels_${taxonomy}`;
    const termValue = String(option.id || option.slug);
    const selectedValues = getSelectedValues(queryKey);
    const selectedLabels = getSelectedValues(termLabelKey);
    const isActive = selectedValues.includes(termValue);
    const nextValues = isActive
      ? selectedValues.filter((value) => value !== termValue)
      : [...selectedValues, termValue];
    const nextLabels = isActive
      ? selectedLabels.filter((value) => value !== option.name)
      : [...selectedLabels, option.name];

    delete nextQuery.attribute;
    delete nextQuery.attribute_term;
    delete nextQuery.attribute_relation;
    delete nextQuery.attribute_label;
    delete nextQuery.attribute_term_label;

    if (nextValues.length) {
      nextQuery[queryKey] = nextValues.join(",");
      nextQuery[labelKey] = attribute.name;
      nextQuery[termLabelKey] = nextLabels.join(",");
    } else {
      delete nextQuery[queryKey];
      delete nextQuery[labelKey];
      delete nextQuery[termLabelKey];
    }

    router.push({ pathname: router.pathname, query: nextQuery }, undefined, { scroll: false });
  };

  if (isLoading) {
    return (
      <div className="tp-shop-widget mb-50 gs-shop-attribute-filter">
        <h3 className="tp-shop-widget-title">Product Options</h3>
        <p className="mb-0">Loading options...</p>
      </div>
    );
  }

  if (isError || !attributes.length) return null;

  return (
    <div className="tp-shop-widget mb-50 gs-shop-attribute-filter">
      <h3 className="tp-shop-widget-title">Product Options</h3>
      {attributes.map((attribute) => {
        const key = normalizeKey(attribute.slug || attribute.name);
        const isColor = attribute.type === "color" || COLOR_KEYS.has(key);
        const isSize = attribute.type === "size" || key.includes("size");

        return (
          <div className="gs-shop-attribute-group" key={attribute.id || attribute.slug}>
            <h4>{attribute.name}</h4>
            <div className={isColor ? "gs-shop-color-options" : isSize ? "gs-shop-size-options" : "gs-shop-check-options"}>
              {attribute.options.map((option) => {
                const taxonomy = attribute.taxonomy || attribute.slug;
                const active = getSelectedValues(`attr_${taxonomy}`).includes(String(option.id || option.slug));

                if (isColor) {
                  return (
                    <button
                      key={option.id || option.slug}
                      type="button"
                      className={active ? "active" : ""}
                      onClick={() => handleAttributeRoute(attribute, option)}
                      aria-pressed={active}
                    >
                      <span
                        style={{ backgroundColor: option.color || "transparent" }}
                        className={!option.color ? "is-text" : ""}
                      >
                        {!option.color ? option.name.slice(0, 2) : ""}
                      </span>
                      {option.name}
                    </button>
                  );
                }

                if (isSize) {
                  return (
                    <button
                      key={option.id || option.slug}
                      type="button"
                      className={active ? "active" : ""}
                      onClick={() => handleAttributeRoute(attribute, option)}
                      aria-pressed={active}
                    >
                      {option.name}
                    </button>
                  );
                }

                return (
                  <button
                    key={option.id || option.slug}
                    type="button"
                    className={active ? "active" : ""}
                    onClick={() => handleAttributeRoute(attribute, option)}
                    aria-pressed={active}
                  >
                    <span aria-hidden="true"></span>
                    {option.name}
                    <small>{option.count}</small>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttributeFilter;
