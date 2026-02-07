import Link from "next/link";
import PartnersSection from "@/components/PartnersSection";
import HeroSlider from "@/components/HeroSlider";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faHandHoldingDollar, faGraduationCap, faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero Slider */}
      <HeroSlider />

      {/* What We Offer - Icon Grid */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Daily verified opportunities across four key pillars of youth empowerment
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                image: "/images/img1.jpg",
                title: "Jobs",
                desc: "Verified job opportunities for young professionals across Africa",
                count: "1,200+",
                color: "from-[#C44536] to-[#8B3A3A]"
              },
              {
                image: "/images/img2.jpg",
                title: "Grants",
                desc: "Funding opportunities for entrepreneurs and startups",
                count: "200+",
                color: "from-[#10B981] to-[#059669]"
              },
              {
                image: "/images/img3.jpg",
                title: "Scholarships",
                desc: "Educational opportunities to advance your career",
                count: "500+",
                color: "from-[#8B3A3A] to-[#C44536]"
              },
              {
                image: "/images/img4.jpg",
                title: "Trainings",
                desc: "Entrepreneurship programs & online skill development",
                count: "850+",
                color: "from-[#F39C12] to-[#C44536]"
              }
            ].map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-60`}></div>
                </div>
                {/* Content */}
                <div className="bg-white p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.desc}</p>
                  <div className="text-sm font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent">
                    {item.count} opportunities
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/jobs" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] btn-lg px-8 border-none">
              View All Opportunities
            </Link>
          </div>
        </div>
      </div>

      {/* What We've Done - Image Collage Section */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image Collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden shadow-lg h-48">
                    <img src="/images/img1.jpg" alt="Youth collaboration" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg h-64">
                    <img src="/images/img2.jpg" alt="Students learning" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="rounded-2xl overflow-hidden shadow-lg h-64">
                    <img src="/images/img3.jpg" alt="Team meeting" className="w-full h-full object-cover" />
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg h-48">
                    <img src="/images/img4.jpg" alt="Workshop" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[#F39C12] rounded-full opacity-10 blur-3xl -z-10"></div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                What have we done with 
                <span className="relative inline-block ml-2">
                  <span className="relative z-10">your help?</span>
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-[#F39C12] -z-0"></span>
                </span>
              </h2>
              
              <p className="text-gray-600 leading-relaxed mb-6">
                Since our inception, YENA has been at the forefront of youth empowerment across Africa. We've connected thousands of young Africans with life-changing opportunities, from scholarships to job placements, grants to training programs.
              </p>

              <p className="text-gray-600 leading-relaxed mb-8">
                Through our daily opportunity drops and comprehensive training programs, we've helped bridge the information gap that often prevents talented youth from accessing opportunities that could transform their lives.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/about" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] px-8 border-none">
                  About us →
                </Link>
                <a 
                  href="https://whatsapp.com/channel/0029Vb5tFTSK0IBb2oi04V2b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn bg-[#10B981] text-white hover:bg-[#059669] px-8 border-none"
                >
                  Join WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Programs Section */}
      <div className="py-24 bg-gray-900 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F39C12] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500 rounded-full opacity-10 blur-3xl"></div>
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Upskill Your Talent In 12 Weeks
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Our comprehensive training programs are designed to equip you with the skills employers are looking for. From digital marketing to web development, we've got you covered.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F39C12] flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Expert-led courses</h3>
                    <p className="text-gray-400">Learn from industry professionals with years of experience</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F39C12] flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Practical, hands-on projects</h3>
                    <p className="text-gray-400">Build real-world projects to showcase your skills</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F39C12] flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Certification upon completion</h3>
                    <p className="text-gray-400">Earn recognized certificates to boost your career</p>
                  </div>
                </div>
              </div>

              <a href="https://kings-learn.vercel.app" target="_blank" rel="noopener noreferrer" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] border-none btn-lg px-8">
                Browse Courses →
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/img5.jpg" alt="Workshop" className="w-full h-64 object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl mt-8">
                <img src="/images/img6 (2).jpg" alt="Collaboration" className="w-full h-64 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Section */}
      <PartnersSection />

      {/* Success Stories - Card Style */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Learn the 
              <span className="relative inline-block mx-2">
                <span className="relative z-10">stories</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-[#F39C12] -z-0"></span>
              </span>
              of those we've already helped
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
              Real stories from real people whose lives have been transformed through YENA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Amara Okonkwo",
                role: "Software Developer",
                country: "Nigeria",
                quote: "YENA helped me land my dream job! The daily opportunities and training programs were exactly what I needed.",
                image: "/images/img7.jpg"
              },
              {
                name: "Kwame Mensah",
                role: "Grant Recipient",
                country: "Ghana",
                quote: "I secured a $10,000 grant for my startup through YENA. The verification process gave me confidence to apply.",
                image: "/images/img8.jpg"
              },
              {
                name: "Zainab Hassan",
                role: "Scholarship Winner",
                country: "Kenya",
                quote: "Thanks to YENA, I'm now studying at my dream university in the UK. Forever grateful for this platform!",
                image: "/images/img1.jpg"
              }
            ].map((story, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group">
                <div className="h-64 overflow-hidden relative">
                  <img src={story.image} alt={story.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {/* Decorative accent */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-[#F39C12] rounded-full opacity-60 blur-2xl"></div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{story.name}</h3>
                    <p className="text-sm text-gray-600">{story.role}</p>
                    <p className="text-xs text-gray-500">{story.country}</p>
                  </div>
                  <p className="text-gray-700 italic leading-relaxed">"{story.quote}"</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/blog" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] px-8 border-none">
              Read More Stories
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section - Clean Design */}
      <div className="py-24 bg-white border-t-8 border-[#F39C12]">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of African youth accessing verified opportunities daily. Your next big break is just one click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/jobs" className="btn bg-[#C44536] text-white hover:bg-[#8B3A3A] btn-lg border-none px-10">
              Explore Opportunities
            </Link>
            <a
              href="https://whatsapp.com/channel/0029Vb5tFTSK0IBb2oi04V2b"
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-[#10B981] text-white hover:bg-[#059669] btn-lg border-none px-10 gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg>
              Join WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
