
"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Stethoscope,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  Phone,
  Menu,
  ShieldCheck,
  Target,
  HeartHandshake,
  ChevronRight,
} from "lucide-react";

const courses = [
  {
    title: "MBBS",
    subtitle: "Bachelor of Medicine",
    icon: Stethoscope,
    duration: "5.5 Years",
  },
  {
    title: "BDS",
    subtitle: "Dental Surgery",
    icon: HeartHandshake,
    duration: "5 Years",
  },
  {
    title: "BAMS",
    subtitle: "Ayurvedic Medicine",
    icon: BookOpen,
    duration: "5.5 Years",
  },
  {
    title: "Nursing",
    subtitle: "Healthcare & Nursing",
    icon: GraduationCap,
    duration: "4 Years",
  },
];

const features = [
  {
    icon: Users,
    title: "Expert Counsellors",
    description:
      "Get personalized guidance from experienced education counsellors.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Guidance",
    description:
      "Make informed admission decisions with transparent guidance.",
  },
  {
    icon: Target,
    title: "Right Career Path",
    description:
      "Discover courses and colleges that match your career goals.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-800">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-blue-950 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-sm text-teal-300 mb-7">
              <Award size={16} />
              Your Trusted Medical Counselling Partner
            </span>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-7">
              Your Dream of Becoming a
              <span className="text-teal-400"> Doctor </span>
              Starts Here.
            </h1>

            <p className="text-blue-100 text-lg leading-8 max-w-xl mb-9">
              Explore medical courses, discover the right colleges
              and get expert counselling to make your admission
              journey easier.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
               
                href="/college"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white px-7 py-4 rounded-xl font-bold transition"
              >
                Explore Colleges <ArrowRight size={19} />
              </Link>

              <Link
                href="#contact"
                className="inline-flex items-center gap-2 border border-white/40 hover:bg-white/10 px-7 py-4 rounded-xl font-bold transition"
              >
                Talk to Counsellor
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 mt-12 text-sm text-blue-100">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-teal-400" size={18} />
                Expert Guidance
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="text-teal-400" size={18} />
                Admission Support
              </span>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="bg-white/10 border border-white/20 rounded-3xl p-5 backdrop-blur-sm">
              <div className="bg-slate-100 rounded-2xl p-8 md:p-12 text-center">

                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope size={48} className="text-teal-700" />
                </div>

                <h2 className="text-3xl font-extrabold text-blue-950 mb-3">
                  Shape Your Future
                </h2>

                <p className="text-slate-600 mb-8">
                  The right guidance makes all the difference.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <GraduationCap className="text-teal-600 mx-auto mb-2" size={28} />
                    <p className="font-bold text-blue-950">Medical</p>
                    <p className="text-xs text-slate-500">Courses</p>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <Award className="text-teal-600 mx-auto mb-2" size={28} />
                    <p className="font-bold text-blue-950">College</p>
                    <p className="text-xs text-slate-500">Selection</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Statistics */}
      <section className="relative -mt-1 bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">

          {[
            ["100+", "Courses"],
            ["500+", "Colleges"],
            ["Expert", "Counsellors"],
            ["24/7", "Support"],
          ].map(([number, label]) => (
            <div key={label} className="text-center">
              <h3 className="text-3xl md:text-4xl font-extrabold text-blue-950">
                {number}
              </h3>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                {label}
              </p>
            </div>
          ))}

        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-slate-50 py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          <div className="bg-blue-950 rounded-3xl p-10 md:p-14 text-white">
            <div className="bg-teal-500/20 rounded-2xl w-16 h-16 flex items-center justify-center mb-8">
              <GraduationCap size={36} className="text-teal-400" />
            </div>

            <h3 className="text-3xl font-bold mb-5">
              Building Brighter Medical Careers
            </h3>

            <p className="text-blue-100 leading-8">
              Every student deserves the right opportunity.
              We help students understand their options and
              move forward with confidence.
            </p>
          </div>

          <div>
            <span className="text-teal-600 font-bold text-sm tracking-widest uppercase">
              About Doctor Council
            </span>

            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mt-4 mb-6 leading-tight">
              Guiding Your Journey Towards a Successful Medical Career
            </h2>

            <p className="text-slate-600 leading-8 mb-8">
              Doctor Council is dedicated to helping students
              navigate medical education and admission opportunities.
              From choosing the right course to exploring colleges,
              we provide guidance throughout the journey.
            </p>

            <div className="space-y-4">
              {[
                "Personalized admission guidance",
                "Course and college information",
                "Dedicated counselling support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="text-teal-600" size={21} />
                  <span className="font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-teal-600 font-bold text-sm tracking-widest uppercase">
              Explore Opportunities
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mt-4 mb-5">
              Explore Popular Medical Courses
            </h2>
            <p className="text-slate-500 leading-7">
              Discover educational pathways that can help you
              build a rewarding career in healthcare.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">

            {courses.map((course) => {
              const Icon = course.icon;

              return (
                <div
                  key={course.title}
                  className="group bg-white border border-slate-200 rounded-2xl p-7 hover:border-teal-400 hover:shadow-xl hover:-translate-y-2 transition duration-300"
                >
                  <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-teal-500 transition">
                    <Icon size={29} className="text-teal-700 group-hover:text-white transition" />
                  </div>

                  <h3 className="text-2xl font-extrabold text-blue-950 mb-2">
                    {course.title}
                  </h3>

                  <p className="text-slate-500 text-sm mb-5">
                    {course.subtitle}
                  </p>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Duration: {course.duration}
                    </span>
                    <ChevronRight size={19} className="text-teal-600" />
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="features" className="bg-blue-950 py-24 px-6 text-white">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <span className="text-teal-400 text-sm font-bold tracking-widest uppercase">
              Why Doctor Council
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-4">
              Why Choose Us?
            </h2>
            <p className="text-blue-200 mt-4">
              We are here to make your educational journey easier.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="bg-white/5 border border-white/10 rounded-2xl p-9 hover:bg-white/10 transition"
                >
                  <div className="w-14 h-14 rounded-xl bg-teal-500/20 flex items-center justify-center mb-7">
                    <Icon size={29} className="text-teal-400" />
                  </div>

                  <h3 className="text-xl font-bold mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-blue-200 leading-7">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section id="contact" className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-teal-600 rounded-3xl p-10 md:p-16 text-center text-white">

          <h2 className="text-3xl md:text-4xl font-extrabold mb-5">
            Ready to Start Your Medical Journey?
          </h2>

          <p className="text-teal-50 max-w-2xl mx-auto leading-8 mb-9">
            Connect with our counselling team and take your
            first step towards the future you deserve.
          </p>

          <Link
            href="/student-login"
            className="inline-flex items-center gap-3 bg-white text-blue-950 px-8 py-4 rounded-xl font-bold hover:bg-slate-100 transition"
          >
            Get Started <ArrowRight size={20} />
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-14 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="grid md:grid-cols-3 gap-12 pb-10">

            <div>
              <div className="flex items-center gap-3 mb-5">
                <GraduationCap size={32} className="text-teal-400" />
                <h3 className="text-xl font-extrabold">Doctor Council</h3>
              </div>
              <p className="text-slate-400 leading-7">
                Your trusted partner for medical education,
                admission guidance and career counselling.
              </p>
            </div>

            <div>
  <h3 className="text-white font-semibold mb-5">Quick Links</h3>

  <ul className="space-y-3">
    <li>
      <Link href="/home" className="text-slate-400 hover:text-white">
        Home
      </Link>
    </li>

    <li>
      <Link href="/about" className="text-slate-400 hover:text-white">
        About Us
      </Link>
    </li>

    <li>
      <Link href="/course" className="text-slate-400 hover:text-white">
        Courses
      </Link>
    </li>

    <li>
      <Link href="/college" className="text-slate-400 hover:text-white">
        Colleges
      </Link>
    </li>

    <li>
      <Link href="/contact" className="text-slate-400 hover:text-white">
        Contact Us
      </Link>
    </li>

    <li>
      <Link href="/plan" className="text-slate-400 hover:text-white">
        Plans
      </Link>
    </li>
  </ul>
</div>

            <div>
              <h3 className="font-bold text-lg mb-5">Contact Us</h3>
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone size={18} className="text-teal-400" />
                <span>Contact our counselling team</span>
              </div>
            </div>

          </div>

          <div className="border-t border-white/10 pt-7 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Doctor Council. All rights reserved.
          </div>

        </div>
      </footer>

    </main>
  );
}
