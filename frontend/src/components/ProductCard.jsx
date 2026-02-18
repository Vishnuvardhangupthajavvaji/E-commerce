function ProductCard({ product, addToCart }) {
    // console.log("PRODUCT CARD : ",product, product.product_picture)
  return (
    <div className="col-md-4 mb-4">
      <div className="card shadow-sm h-100">

        <img
          src={product.product_picture}
          className="card-img-top"
          alt={product.product_name}
          style={{ height: "220px", objectFit: "cover" }}
        />

        <div className="card-body text-center">
          <h5>{product.product_name}</h5>
          <p>₹ {product.price}</p>

          {addToCart && (
            <button
              className="btn btn-primary w-100"
              onClick={() => addToCart(product.id)}
            >
              Add to Cart
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductCard;
