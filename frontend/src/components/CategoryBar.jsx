// frontend/src/components/CategoryBar.jsx
//
// Fully dynamic — reads categories from the DB.
// Just add products with new category names and they appear here automatically.
// Icon map updated to cover your specific categories.

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTableCellsLarge,
  faMobileScreenButton,
  faShirt,
  faChild,
  faShoePrints,
  faDumbbell,
  faHouseChimney,
  faUtensils,
  faFire,
  faTag,
  faVenusMars,
  faTshirt,
  faPersonDress,
} from "@fortawesome/free-solid-svg-icons";
import { faShopify } from "@fortawesome/free-brands-svg-icons";

// Map every category name (lowercase) to an icon.
// Any category not in this map gets the generic faTag fallback.
// Add more entries here as you create new categories.
const CATEGORY_ICONS = {
  "all":               faTableCellsLarge,
  "electronics":       faMobileScreenButton,
  "men's fashion":     faShirt,
  "mens fashion":      faShirt,
  "women's fashion":   faShopify,
  "womens fashion":    faShopify,
  "kids":              faChild,
  "shoes":             faShoePrints,
  "sports & fitness":  faDumbbell,
  "sports":            faDumbbell,
  "fitness":           faDumbbell,
  "home":              faHouseChimney,
  "kitchen":           faUtensils,
  "home and kitchen":    faHouseChimney,
  "home, kitchen":     faHouseChimney,
  "hot deals":         faFire,
  "fashion":           faTshirt,
};

function getCategoryIcon(name) {
  if (!name) return faTag;
  return CATEGORY_ICONS[name.toLowerCase()] ?? faTag;
}

function CategoryBar() {
  const [categories,  setCategories]  = useState([]);
  const navigate                      = useNavigate();
  const [searchParams]                = useSearchParams();

  const activeCategory = searchParams.get("category") || "all";

  useEffect(() => {
    API.get("products/")
      .then(res => {
        const all    = res.data.map(p => p.category).filter(Boolean);
        const unique = ["All", ...new Set(all)];
        setCategories(unique);
      })
      .catch(err => console.log(err));
  }, []);

  const handleClick = (cat) => {
    if (cat.toLowerCase() === "all") {
      navigate("/products");
    } else {
      navigate(`/products?category=${encodeURIComponent(cat)}`);
    }
  };

  if (categories.length === 0) return null;

  return (
    <nav className="category-bar" aria-label="Product categories" id="category-bar">
      <div className="category-bar-inner">
        {categories.map(cat => {
          const isActive = cat.toLowerCase() === activeCategory.toLowerCase();
          return (
            <button
              key={cat}
              className={`category-pill ${isActive ? "category-pill--active" : ""}`}
              onClick={() => handleClick(cat)}
            >
              <FontAwesomeIcon icon={getCategoryIcon(cat)} className="category-pill-icon" />
              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default CategoryBar;