const OrderSummary = ({ subtotal, deliveryFee, tax, discount, total }) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
      <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">
        Price Details
      </h4>

      <div className="space-y-2.5 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-gray-900">
            Rs. {Number(subtotal ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span className="font-medium text-gray-900">
            {deliveryFee > 0 ? `Rs. ${Number(deliveryFee).toLocaleString()}` : "Free"}
          </span>
        </div>
        <div className="flex justify-between">
          <span>GST / Sales Tax (5%)</span>
          <span className="font-medium text-gray-900">
            Rs. {Number(tax ?? 0).toLocaleString()}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-Rs. {Number(discount).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
        <span className="text-base font-bold text-gray-900">Total Amount</span>
        <span className="text-xl font-extrabold text-pink-600">
          Rs. {Number(total ?? 0).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;
