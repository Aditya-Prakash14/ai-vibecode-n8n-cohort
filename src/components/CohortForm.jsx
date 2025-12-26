import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Section from "./Section";
import Button from "./Button";

const CohortForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    goal: "",
    background: "",
    commitment: "",
  });

  const totalSteps = 8;

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

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePayment = () => {
    const options = {
      key: "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
      amount: 89900, // Amount in paise (₹899 = 89900 paise)
      currency: "INR",
      name: "REvamp AI Cohort",
      description: "One Month Agentic AI & Vibe Coding Cohort",
      image: "/logo.png", // Add your logo path
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#AC6AFF",
      },
      handler: function (response) {
        // Payment successful
        console.log("Payment successful:", response);
        console.log("Form Data:", formData);
        // Here you would typically send the data to your backend
        alert(
          `Payment Successful! Payment ID: ${response.razorpay_payment_id}\n\nWelcome to REvamp! We'll add you to the WhatsApp group shortly.`
        );
        navigate("/");
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
    setFormData({ ...formData, [field]: value });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fadeIn">
            <h2 className="h2 mb-6">Welcome to REvamp! 👋</h2>
            <p className="body-1 text-n-3 mb-8">
              Let's start with your name
            </p>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="Enter your full name"
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
              placeholder="your.email@example.com"
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
              placeholder="+1 234 567 8900"
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
            <h2 className="h2 mb-6">Secure Your Spot! 🎉</h2>
            <p className="body-1 text-n-3 mb-8">
              Complete your registration with a one-time payment
            </p>
            
            <div className="p-8 bg-n-7 border-2 border-n-6 rounded-2xl mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="h4 mb-2">One Month Cohort</h4>
                  <p className="text-sm text-n-3">Weekend Program | Live + Recordings</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-n-1">₹899</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-color-1 mt-2 flex-shrink-0" />
                  <p className="text-sm text-n-3">8 live Vibe Coding sessions (Saturdays & Sundays)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-color-1 mt-2 flex-shrink-0" />
                  <p className="text-sm text-n-3">Build 10+ AI projects with LangChain, n8n & Agentic AI</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-color-1 mt-2 flex-shrink-0" />
                  <p className="text-sm text-n-3">Lifetime access to recordings and materials</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-color-1 mt-2 flex-shrink-0" />
                  <p className="text-sm text-n-3">WhatsApp community + Kaggle portfolio capstone</p>
                </div>
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
    switch (step) {
      case 1:
        return formData.fullName.trim() !== "";
      case 2:
        return formData.email.trim() !== "" && formData.email.includes("@");
      case 3:
        return formData.phone.trim() !== "";
      case 4:
        return formData.experience !== "";
      case 5:
        return formData.goal !== "";
      case 6:
        return formData.background !== "";
      case 7:
        return formData.commitment !== "";
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
              <span className="text-sm text-n-3">
                Question {step} of {totalSteps}
              </span>
              <button
                onClick={() => navigate("/")}
                className="text-sm text-n-3 hover:text-n-1 transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <div className="h-1 bg-n-6 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-color-1 to-color-2 transition-all duration-500"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Form content */}
          <div className="min-h-[400px]">{renderStep()}</div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center mt-12">
            <button
              onClick={handlePrev}
              disabled={step === 1}
              className={`px-6 py-3 rounded-xl font-code text-sm transition-colors ${
                step === 1
                  ? "text-n-4 cursor-not-allowed"
                  : "text-n-1 hover:text-color-1"
              }`}
            >
              ← Back
            </button>

            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue →
              </Button>
            ) : (
              <Button onClick={handlePayment} disabled={!canProceed()}>
                Proceed to Payment →
              </Button>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default CohortForm;
