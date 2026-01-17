import { companyLogos } from "../constants";

const CompanyLogos = ({ className }) => {
  return (
    <div className={className}>
      <h5 className="tagline mb-6 text-center text-n-1/50">
        Helping people create beautiful content at
      </h5>
      <div className="overflow-hidden relative">
        <div 
          className="flex"
          style={{
            animation: "scroll 15s linear infinite",
          }}
        >
          {/* First set */}
          {companyLogos.map((logo, index) => (
            <div
              className="flex items-center justify-center h-[7rem] px-10 flex-shrink-0"
              key={`first-${index}`}
            >
              <img src={logo} width={100} height={28} alt={`logo-${index}`} className="object-contain" />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {companyLogos.map((logo, index) => (
            <div
              className="flex items-center justify-center h-[7rem] px-10 flex-shrink-0"
              key={`second-${index}`}
            >
              <img src={logo} width={100} height={28} alt={`logo-${index}`} className="object-contain" />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyLogos;
