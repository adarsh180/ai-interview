'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Camera, Lock, Star, Users, Trophy, Zap, Brain, Shield, Target, Code, FileText, TrendingUp, Award, Clock, Globe, Sparkles, ChevronRight, Play, BarChart3, MessageSquare, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import AIBot from '@/components/AIBot';

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getSlideClass = (index: number) => {
    if (index === currentSlide) return 'active';
    if (index === (currentSlide - 1 + totalSlides) % totalSlides) return 'prev';
    if (index === (currentSlide + 1) % totalSlides) return 'next';
    return 'far';
  };

  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 smoky-bg"></div>
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl floating"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl floating"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-3/4 left-1/2 w-64 h-64 bg-teal-400/3 rounded-full blur-3xl floating"
          style={{ animationDelay: '4s' }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 backdrop-blur-sm bg-navy-950/30 border-b border-teal-400/10">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 p-0.5 logo-glow flex items-center justify-center transition-all duration-300 group-hover:scale-110">
              <div className="w-11 h-11 rounded-full bg-navy-950 flex items-center justify-center">
                <img src="/images/logo.png" alt="Talvio" className="w-7 h-7 object-contain" />
              </div>
            </div>
            <span className="text-2xl font-bold text-white group-hover:text-glow transition-all duration-300">Talvio</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/signin"
              className="text-gray-300 hover:text-white font-medium transition-all duration-300 hover:text-glow relative group"
            >
              Sign In
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/signup"
              className="btn-glow inline-block group relative overflow-hidden"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>
        </nav>
      </header>

      {/* Enhanced Hero Banner Slideshow Section */}
      <section className="relative z-10 py-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 via-navy-800/80 to-navy-900/80 backdrop-blur-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 via-cyan-400/15 to-teal-400/10"></div>

        {/* Smoky Glow Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl floating animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl floating-reverse animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl floating" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Advanced 3D Carousel Banner */}
        <div className="relative h-[700px] w-full px-1 overflow-hidden">
          <div className="carousel-3d-container relative w-full h-full flex items-center justify-center perspective-1000">
            <div className="carousel-track relative w-full h-full">
              {[
                '/images/banner-1.png',
                '/images/banner-2.png',
                '/images/banner-3.png',
                '/images/banner-4.png',
                '/images/banner-5.png'
              ].map((src, index) => (
                <div key={index} className={`carousel-slide ${getSlideClass(index)}`}>
                  <img src={src} alt={`Banner ${index + 1}`} className="w-full h-[600px] object-cover rounded-2xl filter drop-shadow-2xl banner-glow-enhanced" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 via-transparent to-transparent rounded-2xl"></div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="carousel-nav carousel-prev absolute left-8 top-1/2 transform -translate-y-1/2 z-20 w-16 h-16 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 backdrop-blur-md rounded-full border border-teal-400/30 flex items-center justify-center hover:from-teal-400/40 hover:to-cyan-400/40 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 text-teal-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="carousel-nav carousel-next absolute right-8 top-1/2 transform -translate-y-1/2 z-20 w-16 h-16 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 backdrop-blur-md rounded-full border border-teal-400/30 flex items-center justify-center hover:from-teal-400/40 hover:to-cyan-400/40 transition-all duration-300 group"
            >
              <svg className="w-6 h-6 text-teal-400 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Progress Indicators */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4 z-20">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`carousel-indicator w-12 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    index === currentSlide
                      ? 'bg-gradient-to-r from-teal-400 to-cyan-400 active'
                      : 'bg-white/20 hover:bg-white/40'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Hero Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left">
              <div className="mb-8">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 border border-teal-400/20 rounded-full px-4 py-2 mb-6">
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  <span className="text-sm text-teal-400 font-medium">AI-Powered Career Platform</span>
                </div>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 text-glow leading-tight">
                Where Talent <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-gradient-x bg-300%">
                  Meets Vision
                </span>
              </h1>

              <p className="text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                Transform your career journey with cutting-edge AI technology. Get personalized insights, practice with intelligent systems, and unlock your true potential.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/signup"
                  className="btn-glow inline-flex items-center justify-center space-x-3 text-lg px-8 py-4 group relative overflow-hidden"
                >
                  <Zap className="h-6 w-6 animate-pulse" />
                  <span className="relative z-10">Start Free Trial</span>
                  <ArrowRight className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <button className="inline-flex items-center justify-center space-x-3 text-lg px-8 py-4 border border-teal-400/30 rounded-lg text-white hover:bg-teal-400/10 transition-all duration-300 group">
                  <Play className="h-6 w-6 text-teal-400" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-8 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-teal-400" />
                  <span>50K+ Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-cyan-400" />
                  <span>95% Success Rate</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="card-glow p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400/20 to-cyan-400/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-8 w-8 text-teal-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">98%</h3>
                  <p className="text-gray-400">Interview Success</p>
                </div>

                <div className="card-glow p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400/20 to-teal-400/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">24/7</h3>
                  <p className="text-gray-400">AI Support</p>
                </div>

                <div className="card-glow p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-teal-400/20 to-cyan-400/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Globe className="h-8 w-8 text-teal-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">150+</h3>
                  <p className="text-gray-400">Countries</p>
                </div>

                <div className="card-glow p-6 text-center group hover:scale-105 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400/20 to-teal-400/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-8 w-8 text-cyan-400" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">500K+</h3>
                  <p className="text-gray-400">Resumes Analyzed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="card-glow p-16 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/5 via-cyan-400/10 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10">
              <div className="mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 p-1 mx-auto flex items-center justify-center mb-6 logo-glow">
                  <div className="w-18 h-18 rounded-full bg-navy-950 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-teal-400 animate-spin-slow" />
                  </div>
                </div>
              </div>

              <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 text-glow leading-tight">
                Ready to Transform Your
                <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent animate-gradient-x bg-300%">
                  Career Journey?
                </span>
              </h2>

              <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                Join over 50,000 professionals who have accelerated their careers with Talvio's AI-powered platform.
                Start your free trial today and experience the future of career preparation.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <Link
                  href="/signup"
                  className="btn-glow text-2xl px-16 py-6 inline-flex items-center space-x-4 group relative overflow-hidden"
                >
                  <Zap className="h-8 w-8 animate-pulse" />
                  <span className="relative z-10">Start Free Trial</span>
                  <ArrowRight className="h-8 w-8 transition-transform duration-300 group-hover:translate-x-2" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>

                <Link
                  href="/signin"
                  className="text-xl text-gray-300 hover:text-white font-medium transition-all duration-300 hover:text-glow relative group px-8 py-6 border border-teal-400/30 rounded-lg hover:border-teal-400/50"
                >
                  Already have an account?
                  <span className="absolute -bottom-1 left-8 w-0 h-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-300 group-hover:w-[calc(100%-4rem)]"></span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                <div className="group">
                  <div className="text-3xl font-bold text-teal-400 mb-2 group-hover:scale-110 transition-transform duration-300">Free</div>
                  <div className="text-gray-400">14-Day Trial</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold text-cyan-400 mb-2 group-hover:scale-110 transition-transform duration-300">No</div>
                  <div className="text-gray-400">Credit Card</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold text-teal-400 mb-2 group-hover:scale-110 transition-transform duration-300">Instant</div>
                  <div className="text-gray-400">Setup</div>
                </div>
                <div className="group">
                  <div className="text-3xl font-bold text-cyan-400 mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-gray-400">AI Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-20 border-t border-teal-400/20 bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="max-w-7xl mx-auto">
          <div className="h-px bg-gradient-to-r from-transparent via-teal-400/50 via-cyan-400/50 to-transparent mb-16 animate-pulse"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6 group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 p-0.5 flex items-center justify-center logo-glow group-hover:scale-110 transition-transform duration-300">
                  <div className="w-11 h-11 rounded-full bg-navy-950 flex items-center justify-center">
                    <img src="/images/logo.png" alt="Talvio" className="w-7 h-7 object-contain" />
                  </div>
                </div>
                <span className="text-2xl font-bold text-white group-hover:text-glow transition-all duration-300">Talvio</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                Empowering careers through AI-driven insights, personalized learning, and cutting-edge technology.
                Where talent meets vision for the future of work.
              </p>
              <div className="flex space-x-4">
                <a href="https://twitter.com" className="w-12 h-12 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-full flex items-center justify-center hover:from-blue-400/40 hover:to-blue-600/40 transition-all duration-300 group">
                  <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-700/20 rounded-full flex items-center justify-center hover:from-blue-500/40 hover:to-blue-700/40 transition-all duration-300 group">
                  <svg className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://github.com" className="w-12 h-12 bg-gradient-to-r from-gray-400/20 to-gray-600/20 rounded-full flex items-center justify-center hover:from-gray-400/40 hover:to-gray-600/40 transition-all duration-300 group">
                  <svg className="w-5 h-5 text-gray-400 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="mailto:contact@talvio.com" className="w-12 h-12 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 rounded-full flex items-center justify-center hover:from-teal-400/40 hover:to-cyan-400/40 transition-all duration-300 group">
                  <svg className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 text-lg flex items-center">
                <div className="w-2 h-2 bg-teal-400 rounded-full mr-3"></div>
                Platform
              </h4>
              <div className="space-y-4">
                <a href="#" className="block text-gray-400 hover:text-teal-400 transition-colors duration-300">Resume Analysis</a>
                <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors duration-300">Interview Practice</a>
                <a href="#" className="block text-gray-400 hover:text-teal-400 transition-colors duration-300">Coding Challenges</a>
                <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors duration-300">AI Mentorship</a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 text-lg flex items-center">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                Company
              </h4>
              <div className="space-y-4">
                <a href="#" className="block text-gray-400 hover:text-teal-400 transition-colors duration-300">About Us</a>
                <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors duration-300">Careers</a>
                <a href="#" className="block text-gray-400 hover:text-teal-400 transition-colors duration-300">Press</a>
                <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors duration-300">Partners</a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6 text-lg flex items-center">
                <div className="w-2 h-2 bg-teal-400 rounded-full mr-3"></div>
                Support
              </h4>
              <div className="space-y-4">
                <a href="#" className="block text-gray-400 hover:text-teal-400 transition-colors duration-300">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors duration-300">Contact Us</a>
                <a href="#" className="block text-gray-400 hover:text-teal-400 transition-colors duration-300">API Docs</a>
                <a href="#" className="block text-gray-400 hover:text-cyan-400 transition-colors duration-300">Status</a>
              </div>
            </div>
          </div>

          <div className="border-t border-teal-400/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2025 Talvio. All rights reserved. Powered by AI innovation.
              </div>
              <div className="flex items-center space-x-8 text-sm">
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors duration-300">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-300">Cookie Policy</a>
                <div className="flex items-center space-x-2">
                  <div className="text-gray-400">Made with</div>
                  <div className="w-4 h-4 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full animate-pulse"></div>
                  <div className="text-gray-400">for the future</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Bot */}
      <AIBot />
    </div>
  );
}