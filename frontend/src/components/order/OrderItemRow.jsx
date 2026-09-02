const OrderItemRow = ({ item }) => {
  const { name, image, price, quantity, subtotal } = item;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 gap-4">
      <div className="flex items-center gap-3">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-14 h-14 rounded-xl object-cover border border-gray-100 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-300 text-xs shrink-0">
            No Img
          </div>
        )}
        <div>
          <h5 className="font-semibold text-gray-900 text-sm leading-snug">{name}</h5>
          <p className="text-xs text-gray-500 mt-1">
            Rs. {price.toLocaleString()} × {quantity}
          </p>
        </div>
      </div>

      <div className="text-sm font-bold text-gray-900 shrink-0">
        Rs. {subtotal.toLocaleString()}
      </div>
    </div>
  );
};

export default OrderItemRow;
