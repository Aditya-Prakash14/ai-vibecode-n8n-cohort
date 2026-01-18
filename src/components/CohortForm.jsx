import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Section from "./Section";
import Button from "./Button";
import { supabase } from "../lib/supabase";
import { useStudentCounts } from "../hooks/useStudentCounts";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone validation regex (Indian format)
const PHONE_REGEX = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

const CohortForm = () => {
  const navigate = useNavigate();
  const { counts, isLoading: countsLoading } = useStudentCounts();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    goal: "",
    background: "",
    commitment: "",
    pricingTier: "",
  });

  const totalSteps = 9;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Check if user is already registered
  const checkExistingRegistration = async (email, phone) => {
    try {
      setIsLoading(true);
      setRegistrationError("");
      
      // Sanitize inputs
      const sanitizedEmail = email.toLowerCase().trim();
      const sanitizedPhone = phone.replace(/[\s\-]/g, '').trim();
      
      // Check by email
      const { data: emailData, error: emailError } = await supabase
        .from('cohort_registrations')
        .select('id, email, payment_status')
        .eq('email', sanitizedEmail)
        .eq('payment_status', 'completed')
        .single();

      if (emailData) {
        setIsAlreadyRegistered(true);
        setRegistrationError("You are already registered for this cohort with this email!");
        return true;
      }

      // Check by phone
      const { data: phoneData, error: phoneError } = await supabase
        .from('cohort_registrations')
        .select('id, phone, payment_status')
        .eq('phone', sanitizedPhone)
        .eq('payment_status', 'completed')
        .single();

      if (phoneData) {
        setIsAlreadyRegistered(true);
        setRegistrationError("You are already registered for this cohort with this phone number!");
        return true;
      }

      return false;
    } catch (err) {
      console.error("Error checking registration:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Validate inputs
  const validateEmail = (email) => EMAIL_REGEX.test(email);
  const validatePhone = (phone) => PHONE_REGEX.test(phone.replace(/[\s\-]/g, ''));
  const sanitizeInput = (input) => input.trim().replace(/<[^>]*>/g, ''); // Remove HTML tags

  const handleNext = async () => {
    // Validate before proceeding
    if (step === 2 && !validateEmail(formData.email)) {
      setRegistrationError("Please enter a valid email address");
      return;
    }
    if (step === 3 && !validatePhone(formData.phone)) {
      setRegistrationError("Please enter a valid phone number");
      return;
    }
    
    // Check if already registered after phone step
    if (step === 3) {
      const isRegistered = await checkExistingRegistration(formData.email, formData.phone);
      if (isRegistered) return;
    }
    
    setRegistrationError("");
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    setRegistrationError("");
    setIsAlreadyRegistered(false);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePayment = async () => {
    // Final security check before payment
    const isRegistered = await checkExistingRegistration(formData.email, formData.phone);
    if (isRegistered) {
      alert("You are already registered for this cohort!");
      return;
    }

    // Get pricing details based on selected tier
    const pricingDetails = {
      basic: { amount: 79900, price: 799, name: "Basic Plan" },
      premium: { amount: 119900, price: 1199, name: "Premium Plan" },
      plus: { amount: 149900, price: 1499, name: "Plus Plan" }
    };
    
    const selectedPlan = pricingDetails[formData.pricingTier];

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: selectedPlan.amount, // Amount in paise
      currency: "INR",
      name: "REvamp AI Cohort",
      description: `${selectedPlan.name} - Agentic AI & Vibe Coding Cohort`,
      image: "/logo.png", // Add your logo path
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#AC6AFF",
      },
      handler: async function (response) {
        // Payment successful - Save to Supabase
        const transactionTime = new Date().toLocaleString('en-IN', {
          dateStyle: 'full',
          timeStyle: 'medium',
          timeZone: 'Asia/Kolkata'
        });

        try {
          // Sanitize all inputs before saving
          const sanitizedData = {
            full_name: sanitizeInput(formData.fullName),
            email: formData.email.toLowerCase().trim(),
            phone: formData.phone.replace(/[\s\-]/g, '').trim(),
            experience: sanitizeInput(formData.experience),
            goal: sanitizeInput(formData.goal),
            background: sanitizeInput(formData.background),
            commitment: sanitizeInput(formData.commitment),
            pricing_tier: formData.pricingTier,
            payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id || null,
            razorpay_signature: response.razorpay_signature || null,
            payment_status: 'completed',
            amount: selectedPlan.price,
            transaction_time: new Date().toISOString(),
          };

          const { data, error } = await supabase
            .from('cohort_registrations')
            .insert([sanitizedData])
            .select();

          if (error) {
            console.error("Supabase error:", error);
            if (error.code === '23505') {
              // Duplicate entry error
              setIsAlreadyRegistered(true);
              return;
            }
          } else {
            console.log("Data saved to Supabase:", data);
          }

          // Store transaction details for display
          setTransactionDetails({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || 'N/A',
            amount: `₹${selectedPlan.price}`,
            plan: selectedPlan.name,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            date: transactionTime,
            status: 'Success'
          });
          setPaymentSuccess(true);

        } catch (err) {
          console.error("Error saving to Supabase:", err);
          // Still show success since payment went through
          setTransactionDetails({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || 'N/A',
            amount: `₹${selectedPlan.price}`,
            plan: selectedPlan.name,
            plan: selectedPlan.name,
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            date: transactionTime,
            status: 'Success'
          });
          setPaymentSuccess(true);
        }
      },
      modal: {
        ondismiss: function () {
          console.log("Payment cancelled");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const handleSubmit = () => {
    console.log("Form Data:", formData);
    // Here you would typically send the data to your backend
    alert("Thank you for joining! We'll contact you soon.");
    navigate("/");
  };

  const updateField = (field, value) => {
    setRegistrationError("");
    setFormData({ ...formData, [field]: sanitizeInput(value) });
  };

  // Render payment success with transaction details
  if (paymentSuccess && transactionDetails) {
    return (
      <Section className="pt-[12rem] -mt-[5.25rem]" crosses crossesOffset="lg:translate-y-[5.25rem]">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="p-8 bg-white border-2 border-green-400 rounded-2xl shadow-lg" id="transaction-receipt">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">✓</span>
                </div>
                <h2 className="h2 text-n-8 mb-2">Payment Successful!</h2>
                <p className="body-1 text-green-600 font-semibold">Welcome to REvamp AI Cohort</p>
              </div>

              {/* Transaction Details */}
              <div className="bg-n-2 rounded-xl p-6 mb-6">
                <h3 className="h5 text-n-8 mb-4 text-center">📋 Transaction Receipt</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-n-3">
                    <span className="text-n-6 font-medium">Payment ID</span>
                    <span className="text-n-8 font-code font-bold">{transactionDetails.paymentId}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-n-3">
                    <span className="text-n-6 font-medium">Plan</span>
                    <span className="text-n-8 font-semibold">{transactionDetails.plan}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-n-3">
                    <span className="text-n-6 font-medium">Amount Paid</span>
                    <span className="text-n-8 font-bold text-xl">{transactionDetails.amount}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-n-3">
                    <span className="text-n-6 font-medium">Name</span>
                    <span className="text-n-8">{transactionDetails.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-n-3">
                    <span className="text-n-6 font-medium">Email</span>
                    <span className="text-n-8">{transactionDetails.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-n-3">
                    <span className="text-n-6 font-medium">Phone</span>
                    <span className="text-n-8">{transactionDetails.phone}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-n-3">
                    <span className="text-n-6 font-medium">Date & Time</span>
                    <span className="text-n-8 text-sm">{transactionDetails.date}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-n-6 font-medium">Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {transactionDetails.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Screenshot Warning */}
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📸</span>
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-1">Important: Take a Screenshot Now!</h4>
                    <p className="text-yellow-700 text-sm">
                      Please take a screenshot of this receipt and save it for your records. 
                      This is your proof of payment and registration.
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-color-1/10 rounded-xl p-4 mb-6">
                <h4 className="font-bold text-n-8 mb-3">🚀 What's Next?</h4>
                <ul className="space-y-2 text-n-6 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-color-1">✓</span>
                    <span>You'll receive a confirmation email shortly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-color-1">✓</span>
                    <span>We'll add you to the WhatsApp group within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-color-1">✓</span>
                    <span>Cohort details and schedule will be shared in the group</span>
                  </li>
                </ul>
              </div>

              {/* Contact Info */}
              <p className="text-center text-n-5 text-sm mb-6">
                For any queries, contact us at <span className="font-semibold text-color-1">support@revamp.ai</span>
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => window.print()} white>
                  🖨️ Print Receipt
                </Button>
                <Button onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  // Render already registered message
  if (isAlreadyRegistered) {
    return (
      <Section className="pt-[12rem] -mt-[5.25rem]" crosses crossesOffset="lg:translate-y-[5.25rem]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-8 bg-white border-2 border-color-1 rounded-2xl shadow-lg">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="h2 mb-4 text-n-8">You're Already Part of the Cohort!</h2>
              <p className="body-1 text-n-6 mb-8">
                Great news! You have already registered for the REvamp AI Cohort. 
                We're excited to have you on board!
              </p>
              <p className="body-2 text-n-5 mb-8">
                If you haven't received access to the WhatsApp group yet, please contact us at support@revamp.ai
              </p>
              <Button onClick={() => navigate("/")} white>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6 text-n-1">Welcome to REvamp! 👋</h2>
            <p className="body-1 text-n-3 mb-8">
              Let's start with your name
            </p>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="e.g., Rahul Sharma"
              className="w-full px-6 py-4 bg-n-7 border border-n-6 rounded-xl text-n-1 placeholder:text-n-4 focus:border-color-1 focus:outline-none text-lg"
              autoFocus
            />
          </div>
        );

      case 2:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">Great to meet you, {formData.fullName}! ✉️</h2>
            <p className="body-1 text-n-3 mb-8">
              What's your email address?
            </p>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="e.g., rahul.sharma@gmail.com"
              className="w-full px-6 py-4 bg-n-7 border border-n-6 rounded-xl text-n-1 placeholder:text-n-4 focus:border-color-1 focus:outline-none text-lg"
              autoFocus
            />
          </div>
        );

      case 3:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">Almost there! 📱</h2>
            <p className="body-1 text-n-3 mb-8">
              What's your WhatsApp number?
            </p>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-6 py-4 bg-n-7 border border-n-6 rounded-xl text-n-1 placeholder:text-n-4 focus:border-color-1 focus:outline-none text-lg"
              autoFocus
            />
          </div>
        );

      case 4:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">Tell us about your experience 💻</h2>
            <p className="body-1 text-n-3 mb-8">
              What's your coding background?
            </p>
            <div className="space-y-4">
              {[
                { value: "beginner", label: "Beginner - Just starting out" },
                { value: "intermediate", label: "Intermediate - Some projects done" },
                { value: "advanced", label: "Advanced - Professional developer" },
                { value: "expert", label: "Expert - Senior/Lead developer" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateField("experience", option.value);
                    setTimeout(handleNext, 300);
                  }}
                  className={`w-full px-6 py-5 bg-n-7 border-2 rounded-xl text-left transition-all hover:border-color-1 hover:bg-n-6 ${
                    formData.experience === option.value
                      ? "border-color-1 bg-n-6"
                      : "border-n-6"
                  }`}
                >
                  <span className="text-lg text-n-1">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">What's your goal? 🎯</h2>
            <p className="body-1 text-n-3 mb-8">
              Why do you want to join this cohort?
            </p>
            <div className="space-y-4">
              {[
                { value: "career", label: "Career change to AI/Tech" },
                { value: "upskill", label: "Upskill current role" },
                { value: "startup", label: "Build my own AI startup" },
                { value: "freelance", label: "Freelance AI consulting" },
                { value: "other", label: "Something else" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateField("goal", option.value);
                    setTimeout(handleNext, 300);
                  }}
                  className={`w-full px-6 py-5 bg-n-7 border-2 rounded-xl text-left transition-all hover:border-color-1 hover:bg-n-6 ${
                    formData.goal === option.value
                      ? "border-color-1 bg-n-6"
                      : "border-n-6"
                  }`}
                >
                  <span className="text-lg text-n-1">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">Your tech background 🛠️</h2>
            <p className="body-1 text-n-3 mb-8">
              Have you worked with any of these?
            </p>
            <div className="space-y-4">
              {[
                { value: "react", label: "React / Frontend frameworks" },
                { value: "python", label: "Python / Backend development" },
                { value: "ai", label: "AI/ML (LangChain, OpenAI, etc.)" },
                { value: "automation", label: "Automation tools (n8n, Zapier)" },
                { value: "none", label: "None of the above" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateField("background", option.value);
                    setTimeout(handleNext, 300);
                  }}
                  className={`w-full px-6 py-5 bg-n-7 border-2 rounded-xl text-left transition-all hover:border-color-1 hover:bg-n-6 ${
                    formData.background === option.value
                      ? "border-color-1 bg-n-6"
                      : "border-n-6"
                  }`}
                >
                  <span className="text-lg text-n-1">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">Final question! ⏰</h2>
            <p className="body-1 text-n-3 mb-8">
              Can you commit to weekend sessions for one month?
            </p>
            <div className="space-y-4">
              {[
                { value: "yes", label: "✓ Yes, I'm fully committed!" },
                { value: "mostly", label: "✓ Yes, but might miss 1-2 sessions" },
                { value: "maybe", label: "? Not sure yet" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateField("commitment", option.value);
                  }}
                  className={`w-full px-6 py-5 bg-n-7 border-2 rounded-xl text-left transition-all hover:border-color-1 hover:bg-n-6 ${
                    formData.commitment === option.value
                      ? "border-color-1 bg-n-6"
                      : "border-n-6"
                  }`}
                >
                  <span className="text-lg text-n-1">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 8:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">Choose Your Plan 💎</h2>
            <p className="body-1 text-n-3 mb-8">
              Select the plan that best fits your goals
            </p>
            <div className="space-y-4">
              {/* Basic Plan */}
              <button
                onClick={() => {
                  updateField("pricingTier", "basic");
                }}
                className={`w-full p-6 bg-n-7 border-2 rounded-xl text-left transition-all hover:border-color-1 hover:bg-n-6 relative ${
                  formData.pricingTier === "basic"
                    ? "border-color-1 bg-n-6"
                    : "border-n-6"
                }`}
              >
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full font-bold text-xs shadow-lg">
                  20% OFF
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xl font-bold text-n-1 mb-1">Basic</h4>
                    <p className="text-sm text-n-4">Essential AI Development Skills</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-n-4 line-through">₹1000</p>
                    <p className="text-2xl font-bold text-n-1">₹799</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-n-3">
                  <li>✓ Vibe Coding 101</li>
                  <li>✓ Gen AI in Web Apps</li>
                  <li>✓ 3 Industry-Accepted Projects</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-n-6">
                  <p className="text-xs text-color-1 text-center">
                    {countsLoading ? "Loading..." : `🔥 ${counts.basic || 0} students joined already`}
                  </p>
                </div>
              </button>

              {/* Premium Plan */}
              <button
                onClick={() => {
                  updateField("pricingTier", "premium");
                }}
                className={`w-full p-6 bg-n-7 border-2 rounded-xl text-left transition-all hover:border-color-1 hover:bg-n-6 relative ${
                  formData.pricingTier === "premium"
                    ? "border-color-1 bg-n-6"
                    : "border-n-6"
                }`}
              >
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full font-bold text-xs shadow-lg">
                  20% OFF
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xl font-bold text-n-1 mb-1">Premium</h4>
                    <p className="text-sm text-n-4">Full-Stack AI Mastery</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-n-4 line-through">₹1500</p>
                    <p className="text-2xl font-bold text-n-1">₹1199</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-n-3">
                  <li>✓ 5 Full-Stack AI Projects</li>
                  <li>✓ LangChain & LangGraph</li>
                  <li>✓ Agentic AI Systems</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-n-6">
                  <p className="text-xs text-color-1 text-center">
                    {countsLoading ? "Loading..." : `🔥 ${counts.premium || 0} students joined already`}
                  </p>
                </div>
              </button>

              {/* Plus Plan */}
              <button
                onClick={() => {
                  updateField("pricingTier", "plus");
                }}
                className={`w-full p-6 bg-n-7 border-2 rounded-xl text-left transition-all hover:border-color-1 hover:bg-n-6 relative ${
                  formData.pricingTier === "plus"
                    ? "border-color-1 bg-n-6"
                    : "border-n-6"
                }`}
              >
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-3 py-1 rounded-full font-bold text-xs shadow-lg">
                  20% OFF
                </div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xl font-bold text-n-1 mb-1">Plus ⭐</h4>
                    <p className="text-sm text-n-4">Everything Included</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-n-4 line-through">₹1800</p>
                    <p className="text-2xl font-bold text-n-1">₹1499</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-n-3">
                  <li>✓ 10+ AI Projects</li>
                  <li>✓ Live Weekend Sessions</li>
                  <li>✓ Complete Tech Stack</li>
                  <li>✓ Kaggle Portfolio Capstone</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-n-6">
                  <p className="text-xs text-color-1 text-center">
                    {countsLoading ? "Loading..." : `🔥 ${counts.plus || 0} students joined already`}
                  </p>
                </div>
              </button>
            </div>
          </div>
        );

      case 9:
        const planDetails = {
          basic: { name: "Basic", price: 799, originalPrice: 1000, features: ["Vibe Coding 101", "Gen AI in Web Apps", "3 Industry Projects", "Lifetime recordings access"] },
          premium: { name: "Premium", price: 1199, originalPrice: 1500, features: ["5 Full-Stack AI Projects", "LangChain & LangGraph mastery", "Agentic AI systems", "VPS setup guidance", "Lifetime access"] },
          plus: { name: "Plus", price: 1499, originalPrice: 1800, features: ["8 live Vibe Coding sessions", "10+ AI projects", "Full tech stack mastery", "Kaggle capstone project", "Lifetime access + VPS setup"] }
        };
        const selectedPlanDetails = planDetails[formData.pricingTier] || planDetails.plus;
        
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">Secure Your Spot! 🎉</h2>
            <p className="body-1 text-n-3 mb-8">
              Complete your registration with a one-time payment
            </p>
            
            <div className="p-8 bg-n-7 border-2 border-n-6 rounded-2xl mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="h4 mb-2">{selectedPlanDetails.name} Plan</h4>
                  <p className="text-sm text-n-3">Pay once, use forever</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-n-4 line-through">₹{selectedPlanDetails.originalPrice}</p>
                  <p className="text-3xl font-bold text-n-1">₹{selectedPlanDetails.price}</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                {selectedPlanDetails.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-color-1 mt-2 flex-shrink-0" />
                    <p className="text-sm text-n-3">{feature}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-n-6">
                <div className="flex items-center gap-3 text-sm text-n-3">
                  <span>🔒</span>
                  <span>Secured by Razorpay | All payment methods accepted</span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-n-4 mb-6">
              <p>✓ 100% Secure Payment</p>
              <p>✓ Instant Access After Payment</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    if (isLoading) return false;
    switch (step) {
      case 1:
        return formData.fullName.trim() !== "" && formData.fullName.trim().length >= 2;
      case 2:
        return validateEmail(formData.email);
      case 3:
        return validatePhone(formData.phone);
      case 4:
        return formData.experience !== "";
      case 5:
        return formData.goal !== "";
      case 6:
        return formData.background !== "";
      case 7:
        return formData.commitment !== "";
      case 8:
        return formData.pricingTier !== "";
      default:
        return false;
    }
  };

  return (
    <Section className="pt-[12rem] -mt-[5.25rem]" crosses crossesOffset="lg:translate-y-[5.25rem]">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-n-6">
                Question {step} of {totalSteps}
              </span>
              <button
                onClick={() => navigate("/")}
                className="text-sm text-n-6 hover:text-n-8 transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="h-1 bg-n-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-color-1 to-color-2 transition-all duration-500"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Error message */}
          {registrationError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm font-medium">{registrationError}</p>
            </div>
          )}

          {/* Form content */}
          <div className="min-h-[400px]">{renderStep()}</div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handlePrev}
              disabled={step === 1 || isLoading}
              className={`px-6 py-3 rounded-xl font-code text-sm transition-colors ${
                step === 1 || isLoading
                  ? "text-n-5 cursor-not-allowed"
                  : "text-n-8 hover:text-color-1"
              }`}
            >
              ← Back
            </button>

            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed() || isLoading}>
                {isLoading ? "Checking..." : "Continue →"}
              </Button>
            ) : (
              <Button onClick={handlePayment} disabled={!canProceed() || isLoading}>
                {isLoading ? "Please wait..." : "Proceed to Payment →"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CohortForm;
