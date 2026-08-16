import React from "react";

export default function PaymentButton({ amount = 500 }) {
  const handlePayment = () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK not loaded. Check your index.html");
      return;
    }

    const options = {
      key: "YOUR_RAZORPAY_KEY", // replace later
      amount: amount * 100, // ₹ to paise
      currency: "INR",
      name: "SAWARI",
      description: "Ride Payment",
      handler: function (response) {
        alert("Payment Successful!");
        localStorage.setItem("last_payment", JSON.stringify(response));
      },
      theme: {
        color: "#6366f1",
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button onClick={handlePayment} className="btn-primary-pro">
      Pay ₹{amount}
    </button>
  );
}