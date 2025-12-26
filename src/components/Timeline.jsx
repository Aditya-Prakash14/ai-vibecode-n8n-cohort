import { timeline } from "../constants";
import Heading from "./Heading";
import Section from "./Section";

const Timeline = () => {
  return (
    <Section id="timeline">
      <div className="container">
        <Heading
          tag="Program Timeline"
          title="Your Journey to AI Mastery"
        />

        <div className="relative">
          {/* Vertical line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-n-1/0 via-n-1/50 to-n-1/0" />

          {/* Timeline items */}
          <div className="space-y-12 md:space-y-24">
            {timeline.map((item, index) => (
              <div
                key={item.id}
                className={`relative flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`w-full md:w-5/12 ${
                  index % 2 === 0 ? "md:text-right md:pr-12" : "md:text-left md:pl-12"
                }`}>
                  <div className="p-6 bg-n-7 rounded-xl border border-n-6 hover:border-n-5 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="h5 text-n-1">{item.title}</h4>
                      <span className="text-xs font-code font-bold text-n-3 uppercase">
                        {item.date}
                      </span>
                    </div>
                    <p className="body-2 text-n-3 mb-4">{item.description}</p>
                    <div className="space-y-2">
                      {item.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-color-1 mt-2 flex-shrink-0" />
                          <p className="text-sm text-n-4">{highlight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Center dot */}
                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-n-8 border-4 border-color-1 z-10">
                  <div className="m-auto w-3 h-3 rounded-full bg-color-1" />
                </div>

                {/* Spacer for alternating layout */}
                <div className="hidden md:block w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Timeline;
