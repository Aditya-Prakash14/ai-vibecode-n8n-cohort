import { check } from "../assets";
import { pricing } from "../constants";
import Button from "./Button";
import { useStudentCounts } from "../hooks/useStudentCounts";

const PricingList = () => {
  const { counts, isLoading } = useStudentCounts();

  return (
    <div className="flex justify-center gap-[1rem] max-lg:flex-wrap">
      {pricing.map((item) => {
        // Get dynamic count from Supabase, fallback to hardcoded value
        const studentCount = counts[item.title.toLowerCase()] || item.studentsJoined || 0;
        
        return (
          <div
            key={item.id}
            className="w-full max-w-[40rem] h-full px-6 bg-n-8 border border-n-6 rounded-[2rem] py-14 [&>h4]:text-color-1 relative"
          >
            {/* 20% Off Badge */}
            <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              20% OFF
            </div>
            
            <h4 className="h4 mb-4 text-center">{item.title}</h4>

            <p className="body-2 mb-3 text-n-1/50 text-center">
              {item.description}
            </p>

            <div className="flex flex-col items-center justify-center mb-6">
              {item.originalPrice && (
                <div className="flex items-center mb-2">
                  <div className="text-n-4 line-through text-2xl">₹{item.originalPrice}</div>
                </div>
              )}
              {item.price && (
                <div className="flex items-center h-[5.5rem]">
                  <div className="h3">₹</div>
                  <div className="text-[5.5rem] leading-none font-bold">
                    {item.price}
                  </div>
                </div>
              )}
            </div>

            <Button
              className="w-full mb-6"
              href="/join-cohort"
              white={!!item.price}
            >
              {item.price ? "Get started" : "Contact us"}
            </Button>

            <ul>
              {item.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start py-5 border-t border-n-6"
                >
                  <img src={check} width={24} height={24} alt="Check" />
                  <p className="body-2 ml-4">{feature}</p>
                </li>
              ))}
            </ul>

            {/* Students Joined Badge at Bottom */}
            <div className="flex items-center justify-center mt-6 pt-6 border-t border-n-6">
              <div className="bg-color-1/20 border border-color-1 text-color-1 px-4 py-2 rounded-full text-sm font-semibold">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <>🔥 {studentCount} students joined already</>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PricingList;
