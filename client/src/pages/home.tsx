import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Clock, CheckCircle, ArrowRight, ChevronRight, BookOpen, ShieldCheck, Users, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import logo from "./../Assets/logocctc.png";
import campusBg from "./../assets/bgcctc.jpg";
import Nav from "./../components/nav";

const features = [
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Easy Requests",
    description: "Submit documents in just a few clicks through our intuitive platform",
    color: "from-blue-400 to-blue-600",
    bg: "bg-blue-400/10"
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Real-time Tracking",
    description: "Monitor your request status with live updates and notifications",
    color: "from-purple-400 to-purple-600",
    bg: "bg-purple-400/10"
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: "Fast Processing",
    description: "Priority queue system delivers documents in record time",
    color: "from-green-400 to-green-600",
    bg: "bg-green-400/10"
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Document Library",
    description: "Access frequently requested forms and templates anytime",
    color: "from-amber-400 to-amber-600",
    bg: "bg-amber-400/10"
  }
];

const testimonials = [
  {
    quote: "QuickServe saved me hours of waiting in line. Got my documents in just 2 days!",
    name: "Maria Santos",
    role: "BS Computer Science",
    rating: 5
  },
  {
    quote: "The real-time tracking feature is a game changer. No more uncertainty about my requests.",
    name: "John Dela Cruz",
    role: "BS Business Admin",
    rating: 5
  },
  {
    quote: "Most efficient system I've used at any school. CCTC is leading the way!",
    name: "Andrea Reyes",
    role: "BS Education",
    rating: 5
  }
];

export default function Home() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Glass Navbar */}
      <header className="backdrop-blur-lg bg-white/20 shadow-sm sticky top-0 z-50">
        <Nav />
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-4">
        <div className="absolute inset-0 z-0">
          <img 
            src={campusBg} 
            alt="CCTC Campus" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-blue-900/30" />
          
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-blue-500/5"
              initial={{
                x: Math.random() * 100,
                y: Math.random() * 100,
                width: Math.random() * 400 + 100,
                height: Math.random() * 400 + 100,
              }}
              animate={{
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100],
                transition: {
                  duration: Math.random() * 40 + 20,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear"
                }
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-block mb-8"
            >
              <img src={logo} alt="CCTC Logo" className="h-20 mx-auto" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome, Consolatricians!
            </h1>
            
            <p className="text-xl text-blue-800/90 mb-10 max-w-2xl mx-auto">
              Experience the future of document management with QuickServe
            </p>
            
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link href="/request">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg px-8 py-6 text-lg"
                >
                  Request Document Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-6" ref={containerRef}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-900">Why Choose QuickServe?</h2>
          <p className="text-lg text-blue-800/80 max-w-3xl mx-auto">
            Our platform is designed to make document requests effortless and efficient
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className={`${feature.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-6`}>
                    <div className={feature.color.replace('from-', 'text-').replace(' to-', '')}>
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-blue-900">{feature.title}</h3>
                  <p className="text-blue-800/80 mb-6">{feature.description}</p>
                  <Link 
                    href="/features" 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Learn more <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Animated Feature Showcase */}
      <section className="py-20 bg-blue-900/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <h2 className="text-3xl font-bold mb-6 text-blue-900">Powerful Features</h2>
                
                <div className="space-y-4 mb-8">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      className={cn(
                        "p-6 rounded-xl cursor-pointer transition-all border",
                        currentFeature === index ? 
                          "bg-white shadow-md border-blue-200" : 
                          "hover:bg-white/50 border-transparent"
                      )}
                      onClick={() => setCurrentFeature(index)}
                      whileHover={{ x: 5 }}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`${feature.bg} p-3 rounded-lg ${feature.color.replace('from-', 'text-').replace(' to-', '')}`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900">{feature.title}</h3>
                          {currentFeature === index && (
                            <motion.p 
                              className="text-blue-800/80 mt-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              {feature.description}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Link href="/features">
                  <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                    Explore all features <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="lg:w-1/2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100"
                  >
                    <div className={`${features[currentFeature].bg} w-20 h-20 rounded-xl flex items-center justify-center mb-6 mx-auto`}>
                      <div className={features[currentFeature].color.replace('from-', 'text-').replace(' to-', '')}>
                        {features[currentFeature].icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-center mb-4 text-blue-900">
                      {features[currentFeature].title}
                    </h3>
                    <p className="text-blue-800/80 text-center mb-6">
                      {features[currentFeature].description}
                    </p>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 aspect-video flex items-center justify-center">
                      <div className="text-7xl font-bold text-blue-500/20">
                        {currentFeature + 1}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Campus Showcase */}
      <section className="py-20 container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="relative rounded-2xl overflow-hidden shadow-2xl"
        >
          <img
            src={campusBg}
            alt="CCTC Campus"
            className="w-full h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Our Beautiful Campus</h2>
            <p className="text-lg mb-6 max-w-2xl">
              Consolatrix College of Toledo City provides the perfect environment for academic excellence and personal growth.
            </p>
            <Link href="/about">
              <Button variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                Explore Campus <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-blue-900/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-900">What Students Say</h2>
            <p className="text-lg text-blue-800/80 max-w-3xl mx-auto">
              Hear from our community about their experience with QuickServe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-md bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <blockquote className="text-lg italic mb-6 text-blue-900">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="font-semibold text-blue-900">{testimonial.name}</div>
                    <div className="text-blue-800/80 text-sm">{testimonial.role}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Help?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Our support team is ready to assist you with any questions
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <Mail className="h-10 w-10 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p>support@cctc.edu.ph</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <MapPin className="h-10 w-10 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Visit Us</h3>
                <p>Main Administration Building</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
                <Phone className="h-10 w-10 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p>(032) 555-1234</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-blue-900">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-blue-800/80 max-w-2xl mx-auto">
              Join thousands of Consolatricians who are already benefiting from QuickServe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/request">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg px-8 py-6 text-lg"
                >
                  Request Document Now
                </Button>
              </Link>
              <Link href="/demo">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
                >
                  Watch Demo
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}