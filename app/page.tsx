'use client';

import Link from 'next/link';
import { Leaf, BarChart3, Target, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BarChart3,
    title: 'Understand',
    description: 'Visualize your carbon footprint with clear, interactive charts and real-world comparisons.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Target,
    title: 'Track',
    description: 'Log daily activities across transportation, food, energy, shopping, and waste.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  {
    icon: Sparkles,
    title: 'Reduce',
    description: 'Get AI-powered personalized recommendations to shrink your footprint.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
];

const stagger = {
  animate: {
    transition: { staggerChildren: 0.1 },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-6 h-6 text-emerald-500" aria-hidden="true" />
            <span className="font-display text-lg font-black text-slate-800 tracking-tight">
              CarbonSense
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <motion.section
          initial="initial"
          animate="animate"
          variants={stagger}
          className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 border border-emerald-200 rounded-full text-emerald-700 text-sm font-semibold mb-8">
            <Leaf className="w-4 h-4" aria-hidden="true" />
            Join 10,000+ people reducing their footprint
          </motion.div>

          <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-display font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Understand, Track, and{' '}
            <span className="text-emerald-500">Reduce</span>{' '}
            Your Carbon Footprint
          </motion.h1>

          <motion.p variants={fadeInUp} className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Simple daily actions, personalized AI insights, and real-time tracking
            to help you make a difference — one kilogram of CO₂ at a time.
          </motion.p>

          <motion.div variants={fadeInUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-md hover:shadow-lg"
            >
              Calculate Your Footprint
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-4 rounded-xl text-lg border border-slate-200 transition-all"
            >
              Explore Dashboard
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  variants={fadeInUp}
                  className="glass-panel rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform duration-300"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mx-auto mb-6`}
                  >
                    <Icon className={`w-8 h-8 ${feature.color}`} aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-xl font-black text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-emerald-50/50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-5xl font-display font-black text-slate-900 mb-6">
                Ready to make a difference?
              </h2>
              <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                Join thousands of people who are tracking and reducing their carbon footprint.
                Start your journey today.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-md"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 border-t border-slate-200 bg-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Leaf className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span className="font-display font-bold text-sm">CarbonSense</span>
          </div>
          <p className="text-sm text-slate-400">
            Helping individuals understand, track, and reduce their carbon footprint.
          </p>
        </div>
      </footer>
    </div>
  );
}
