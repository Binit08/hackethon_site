'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Spotlight } from '@/components/ui/spotlight';
import { LampContainer } from '@/components/ui/lamp';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Sparkles } from '@/components/ui/sparkles';
import { MovingBorder } from '@/components/ui/moving-border';
import {
  ArrowRight,
  Calendar,
  Trophy,
  Users,
  Code,
  Sparkles as SparklesIcon,
  Award,
  Target,
  Zap,
  Brain,
  Cpu,
  Rocket,
  Terminal,
} from 'lucide-react';
import { useRef } from 'react';
import { Floating3DElements } from '@/components/3d-elements';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const y1 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -200]), {
    stiffness: 100,
    damping: 30,
  });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -400]), {
    stiffness: 100,
    damping: 30,
  });
  const y3 = useSpring(useTransform(scrollYProgress, [0, 1], [0, -600]), {
    stiffness: 100,
    damping: 30,
  });
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  return (
    <div ref={containerRef} className="relative overflow-hidden" style={{ perspective: '2000px' }}>
      {/* 3D Floating Elements Background */}
      <Floating3DElements />
      
      {/* Floating Orbs Background with Pink Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            x: [0, 120, 0],
            y: [0, -120, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-300/40 to-rose-300/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -120, 0],
            y: [0, 120, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/50 to-purple-200/50 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-rose-200/40 to-pink-300/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 60, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-fuchsia-200/30 to-pink-200/30 rounded-full blur-3xl"
        />
      </div>

      {/* Animated Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -1000],
              x: [(i % 3 - 1) * 100, (i % 3 - 1) * -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'linear',
            }}
            className="absolute w-2 h-2 bg-pink-400/40 rounded-full"
            style={{
              left: `${(i * 5) % 100}%`,
              top: '100%',
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundBeams />
        <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="rgba(59, 130, 246, 0.5)" />
        
        {/* Parallax Background Images */}
        <motion.div
          style={{ y: y3, opacity }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50" />
          <div className="absolute top-10 right-10 w-64 h-64 opacity-20">
            <Image
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80"
              alt="Coding background"
              fill
              className="object-cover rounded-2xl"
              sizes="256px"
            />
          </div>
        </motion.div>

        <motion.div
          style={{ y: y2 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute bottom-20 left-10 w-72 h-72 opacity-15">
            <Image
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80"
              alt="Team collaboration"
              fill
              className="object-cover rounded-2xl"
              sizes="288px"
            />
          </div>
        </motion.div>

        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute top-1/2 left-1/4 w-48 h-48 opacity-10">
            <Image
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80"
              alt="Technology"
              fill
              className="object-cover rounded-2xl"
              sizes="192px"
            />
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ scale }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1],
                rotateY: [0, 180, 360],
                rotateX: [0, 15, 0]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                rotateY: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
                rotateX: { duration: 5, repeat: Infinity, ease: 'easeInOut' }
              }}
              className="relative transform-3d"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-xl opacity-50" />
              <SparklesIcon className="relative w-20 h-20 text-blue-600" />
            </motion.div>
          </motion.div>

          <TextGenerateEffect 
            words="Tech Hackathon 2026"
            className="text-6xl md:text-8xl font-black mb-6"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-700 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Build the future. Connect with innovators. Win amazing prizes.
            Join us for <span className="font-bold text-blue-600">48 hours</span> of creativity and code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            <Link href="/auth/register">
              <motion.div
                whileHover={{ scale: 1.05, y: -5, rotateX: 5, rotateY: 5, z: 50 }}
                whileTap={{ scale: 0.95 }}
                className="transform-3d"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Button
                  size="lg"
                  className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 hover:from-blue-700 hover:via-cyan-700 hover:to-sky-700 text-white px-10 py-7 text-lg font-bold group overflow-hidden shadow-2xl shadow-blue-500/50"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-sky-500 to-blue-500"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    style={{ opacity: 0.3 }}
                  />
                  <span className="relative flex items-center gap-2">
                    Register Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </motion.div>
            </Link>
            <Link href="/dashboard">
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="border-3 border-pink-400 text-pink-700 hover:bg-pink-50 px-10 py-7 text-lg font-bold shadow-lg hover:shadow-pink-300/50 transition-all"
                >
                  View Dashboard
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Floating Icons with Enhanced Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ 
                y: [0, -30, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-20 left-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400/30 blur-xl rounded-full" />
                <Code className="relative w-16 h-16 text-blue-500 opacity-60" />
              </div>
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, 30, 0],
                rotate: [0, -15, 15, 0],
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute bottom-20 right-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-400/30 blur-xl rounded-full" />
                <Cpu className="relative w-16 h-16 text-cyan-500 opacity-60" />
              </div>
            </motion.div>
            <motion.div
              animate={{ 
                y: [0, -25, 0],
                x: [0, 15, -15, 0],
              }}
              transition={{ 
                duration: 4.5, 
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-40 right-20"
            >
              <Rocket className="w-10 h-10 text-blue-400 opacity-50" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 15, 0] }}
              transition={{ duration: 4.5, repeat: Infinity }}
              className="absolute bottom-40 left-20"
            >
              <Terminal className="w-10 h-10 text-purple-400 opacity-50" />
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-purple-600 rounded-full flex justify-center pt-2"
          >
            <div className="w-1 h-2 bg-purple-600 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 bg-gradient-to-br from-blue-50/50 via-cyan-50/50 to-sky-50/50 overflow-hidden">
        <Sparkles />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <Brain className="w-16 h-16 text-blue-600 mx-auto" />
            </motion.div>
            <h2 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent">
              About The Hackathon
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Fostering Innovation and Collaborative Problem-Solving
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative h-[500px] rounded-2xl overflow-hidden group">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-6 bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 opacity-20 group-hover:opacity-30 blur-3xl"
                />
                <Image
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
                  alt="Team collaboration"
                  fill
                  className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/30 to-transparent rounded-2xl" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-blue-200">
                <h3 className="text-3xl font-bold mb-4 text-slate-900">
                  🏛️ Hosted by NIT Silchar
                </h3>
                <p className="text-slate-700 leading-relaxed mb-6">
                  An Institute of National Importance, NIT Silchar stands at the forefront of technical education and research. With a legacy of excellence and top national rankings (NIRF Engg.: 40), it&apos;s the perfect launchpad for the next generation of innovators.
                </p>
                
                <div className="space-y-4">
                  {[
                    { icon: Brain, title: "Encourage Innovation", desc: "Drive creative AI/ML-driven solutions for complex problems" },
                    { icon: Users, title: "Foster Collaboration", desc: "Build a national community of coders, thinkers, and creators" },
                    { icon: Target, title: "Identify Talent", desc: "Discover and recognize the brightest tech talent in the country" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20, rotateY: -90 }}
                      whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: 'spring' }}
                      whileHover={{ x: 5, scale: 1.02, rotateY: 5, z: 50 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 shadow-md"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                      >
                        <item.icon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      </motion.div>
                      <div>
                        <span className="font-bold text-slate-900">{item.title}:</span>
                        <span className="text-slate-700"> {item.desc}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { icon: Trophy, value: "₹1.2L", label: "Prize Pool", gradient: "from-yellow-400 to-orange-500" },
              { icon: Users, value: "1000+", label: "Participants", gradient: "from-pink-500 to-rose-500" },
              { icon: Calendar, value: "48hrs", label: "Finale Duration", gradient: "from-purple-500 to-fuchsia-500" },
              { icon: Award, value: "Top 30", label: "Finalists", gradient: "from-rose-500 to-pink-500" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20, rotateX: -45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -10, scale: 1.05, rotateY: 10, rotateX: 10, z: 50 }}
                className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl text-center border border-pink-100 overflow-hidden group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                  className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
                <div className={`text-4xl font-black mb-1 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 font-semibold">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative py-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent"
          >
            Event Timeline
          </motion.h2>

          <div className="space-y-8">
            {[
              {
                icon: Calendar,
                title: 'Round 1: Online Screening',
                date: 'January 2026 (Second Week)',
                description: 'MCQs, aptitude, and coding questions. Top 75% or 50%+ marks qualify for Round 2',
                color: 'pink',
              },
              {
                icon: Code,
                title: 'Round 2: Online Challenge',
                date: 'February 2026 (First Week)',
                description: 'Intermediate AI/ML problems. Top performing teams advance to the finale',
                color: 'rose',
              },
              {
                icon: Trophy,
                title: 'Round 3: Offline Finale',
                date: 'February 2026 (Last Week)',
                description: '48-hour hackathon at NIT Silchar campus with real-time problem solving',
                color: 'fuchsia',
              },
              {
                icon: Award,
                title: 'Awards & Recognition',
                date: 'End of Round 3',
                description: 'Winners announced with certificates and prize distribution',
                color: 'pink',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50, rotateY: -45 }}
                whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, type: 'spring' }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, rotateY: 3, z: 30 }}
                className="relative flex items-start gap-6 group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className={`w-16 h-16 rounded-full bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 flex items-center justify-center shadow-lg`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  {index < 3 && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      whileInView={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                      className={`absolute top-16 left-1/2 -translate-x-1/2 w-1 h-16 bg-gradient-to-b from-${item.color}-400 to-${item.color}-200`}
                    />
                  )}
                </div>

                <div className="flex-1 bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg group-hover:shadow-xl transition-shadow">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-pink-600 font-semibold mb-2">{item.date}</p>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="relative py-24 bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80"
            alt="Tech background"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 bg-clip-text text-transparent"
          >
            Prize Pool: ₹1.2 Lakh
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                place: '1st Prize',
                prize: '₹50,000',
                icon: Trophy,
                color: 'from-yellow-400 to-yellow-600',
                bg: 'from-yellow-50 to-pink-50',
                benefits: ['Cash Prize', 'Certificate of Achievement', 'Recognition Badge'],
              },
              {
                place: '2nd Prize',
                prize: '₹40,000',
                icon: Award,
                color: 'from-cyan-400 to-blue-600',
                bg: 'from-cyan-50 to-blue-50',
                benefits: ['Cash Prize', 'Certificate of Achievement', 'Special Mention'],
              },
              {
                place: '3rd Prize',
                prize: '₹30,000',
                icon: Award,
                color: 'from-sky-400 to-cyan-600',
                bg: 'from-sky-50 to-cyan-50',
                benefits: ['Cash Prize', 'Certificate of Achievement', 'Appreciation Award'],
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -45, rotateY: -45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2, type: 'spring', stiffness: 80 }}
                viewport={{ once: true }}
                whileHover={{ y: -20, scale: 1.08, rotateY: 10, rotateX: 5, z: 100 }}
                className={`relative bg-gradient-to-br ${item.bg} rounded-2xl p-8 shadow-xl overflow-hidden group`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="absolute -top-10 -right-10 opacity-10"
                >
                  <item.icon className="w-48 h-48" />
                </motion.div>

                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}
                  >
                    <item.icon className="w-10 h-10 text-white" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    {item.place}
                  </h3>
                  <p className={`text-4xl font-bold text-center mb-6 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.prize}
                  </p>

                  <ul className="space-y-3">
                    {item.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Section */}
      <section className="relative py-24 bg-gradient-to-br from-cyan-50 via-blue-50 to-sky-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-pink-600 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent"
          >
            Registration Details
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-12 mb-12">
            <motion.div
              initial={{ opacity: 0, x: -30, rotateY: -25 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              viewport={{ once: true }}
              whileHover={{ rotateY: 5, scale: 1.02, z: 50 }}
              className="glass-pink rounded-2xl p-8 shadow-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center shadow-lg"
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">₹2,000</h3>
                  <p className="text-gray-600">Per Team</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Team Size:</strong> 1-3 members</p>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Deadline:</strong> 30th December 2025</p>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700"><strong>Demo Payment:</strong> ₹1 to verify account</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl border border-blue-200">
                <h4 className="font-bold text-gray-800 mb-3">What&apos;s Included:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Free accommodation at NIT Silchar
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Gala dinner and refreshments
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Certificates and recognition
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Mentorship from industry experts
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    Access to all three rounds
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30, rotateY: 25 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, type: 'spring' }}
              viewport={{ once: true }}
              whileHover={{ rotateY: -5, scale: 1.02, z: 50 }}
              className="glass-pink rounded-2xl p-8 shadow-xl"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💳
                </motion.div>
                Payment Methods
              </h3>

              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-gray-800 mb-2">UPI Payment</h4>
                  <p className="text-gray-700 font-mono text-sm">hackathon@nits.sbi</p>
                  <p className="text-gray-600 text-sm mt-1">Scan QR code on registration page</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-cyan-100 to-sky-100 rounded-xl border border-cyan-200">
                  <h4 className="font-bold text-gray-800 mb-2">Bank Transfer</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Account:</strong> 40404040404040</p>
                    <p><strong>IFSC:</strong> SBIN0007061</p>
                    <p><strong>Bank:</strong> State Bank of India</p>
                    <p><strong>Branch:</strong> NIT Silchar Campus</p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-sky-100 to-blue-100 rounded-xl border border-sky-200">
                  <h4 className="font-bold text-gray-800 mb-2">⚠️ Important</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Upload payment proof after registration</li>
                    <li>• Registration confirmed after verification</li>
                    <li>• No refunds after deadline</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500 text-white text-xl font-bold rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Register Your Team Now
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
                <motion.div
                  animate={{ x: ['0%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
              </motion.button>
            </Link>
            <p className="mt-4 text-gray-600">Registration closes on 30th December 2025</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-blue-600 via-cyan-600 to-sky-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1920&q=80"
            alt="Tech circuit background"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Animated Tech Icons */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-20 left-20 opacity-20"
        >
          <Code className="w-24 h-24 text-white" />
        </motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-20 right-20 opacity-20"
        >
          <Cpu className="w-24 h-24 text-white" />
        </motion.div>
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-40 right-1/4 opacity-20"
        >
          <Rocket className="w-16 h-16 text-white" />
        </motion.div>

        <div className="relative max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-6"
            >
              <Sparkles className="w-16 h-16 text-white" />
            </motion.div>

            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Ready to Innovate at NIT Silchar?
            </h2>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join 1000+ participants, compete for ₹1.2L prizes, and showcase your skills
              at one of India&apos;s premier technical institutes!
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-12 py-8 text-xl font-bold group shadow-2xl"
                >
                  Register Now - ₹2000/Team
                  <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-8 text-white/80 text-sm"
            >
              Deadline: 30th December 2025 • Limited spots available
            </motion.p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
