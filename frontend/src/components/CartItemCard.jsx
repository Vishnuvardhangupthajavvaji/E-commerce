function CartItemCard({ item, updateQty, removeItem }) {
  return (
    <div className="row border p-3 mb-3 align-items-center">

      <div className="col-md-2">
        <img src={item.product.product_picture} width="80"/>
      </div>

      <div className="col-md-3">
        {item.product.product_name}
      </div>

      <div className="col-md-2">
        ₹ {item.product.price}
      </div>

      <div className="col-md-2 d-flex align-items-center">

        <button
          className="btn btn-sm btn-secondary me-2"
          onClick={() => updateQty(item.id, item.quantity - 1)}
        >
          -
        </button>

        {item.quantity}

        <button
          className="btn btn-sm btn-secondary ms-2"
          onClick={() => updateQty(item.id, item.quantity + 1)}
        >
          +
        </button>

      </div>

      <div className="col-md-2">
        ₹ {item.total_price}
      </div>

      <div className="col-md-1">
        <button className="btn btn-danger btn-sm" onClick={() => removeItem(item.id)}>
          Remove
        </button>
      </div>

    </div>
  );
}

export default CartItemCard;
