
"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Target,
  Eye,
  HeartHandshake,
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Expert Counselling",
    description:
      "Get proper guidance and support from experienced counselling professionals.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Guidance",
    description:
      "Make informed decisions with reliable information and transparent guidance.",
  },
  {
    icon: BookOpen,
    title: "Wide Course Options",
    description:
      "Explore different medical courses, colleges and educational opportunities.",
  },
  {
    icon: HeartHandshake,
    title: "Student First Approach",
    description:
      "We focus on understanding every student's goals and helping them move forward.",
  },
];

export default function About() {
  return (
    <main className="min-h-screen bg-white text-slate-800">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-blue-950 px-6 py-24 text-white">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-cyan-200">
            <GraduationCap size={18} />
            Welcome to Doctor Council
          </span>

          <h1 className="mb-6 text-4xl font-bold md:text-6xl">
            About <span className="text-cyan-400">Doctor Council</span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-8 text-blue-100">
            Your trusted partner in medical education and career guidance.
            We help students explore opportunities, understand their options
            and take confident steps towards their future.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/course"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-7 py-3.5 font-semibold text-white transition hover:bg-cyan-600"
            >
              Explore Courses <ArrowRight size={18} />
            </Link>

            <Link
  href="/college"
  className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-7 py-3.5 font-semibold text-white transition hover:bg-white hover:text-blue-950"
>
  Explore Colleges <ArrowRight size={18} />
</Link>

            <Link
              href="/contact"
              className="rounded-lg border border-white/40 px-7 py-3.5 font-semibold text-white transition hover:bg-white hover:text-blue-950"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-14 md:grid-cols-2">

          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-blue-950 to-blue-800 p-10 text-white shadow-xl md:p-14">
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400 text-blue-950">
                <Stethoscope size={34} />
              </div>

              <h3 className="mb-5 text-3xl font-bold">
                Building Better Futures Through Education
              </h3>

              <p className="leading-8 text-blue-100">
                Every student deserves the right guidance and an opportunity
                to build a successful career. We aim to make the educational
                journey more informed, transparent and accessible.
              </p>

              <div className="mt-8 flex items-center gap-3 text-cyan-300">
                <CheckCircle2 size={20} />
                <span className="font-medium">Your Future, Our Guidance</span>
              </div>
            </div>
          </div>

          <div>
            <span className="font-semibold uppercase tracking-widest text-cyan-600">
              Who We Are
            </span>

            <h2 className="mt-4 text-3xl font-bold text-blue-950 md:text-4xl">
              Helping Students Make the Right Career Decisions
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Doctor Council is an educational counselling platform
              dedicated to helping students explore medical education
              opportunities and make informed academic decisions.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              We understand that choosing the right course and college
              is an important step in every student's life. Our aim is
              to simplify this journey through guidance, information
              and student-focused support.
            </p>

            <ul className="mt-7 space-y-4">
              {[
                "Guidance for medical education opportunities",
                "Information about courses and colleges",
                "Support throughout the counselling journey",
                "Student-focused educational assistance",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 shrink-0 text-cyan-600" size={20} />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* Mission and Vision */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="font-semibold uppercase tracking-widest text-cyan-600">
              Our Purpose
            </span>
            <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
              Mission & Vision
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
              Our purpose is to make educational guidance more accessible
              and help students move towards a brighter future.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-blue-100 bg-white p-9 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-blue-950">
                <Target size={30} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-blue-950">
                Our Mission
              </h3>
              <p className="leading-8 text-slate-600">
                To provide students with reliable educational information,
                proper counselling and continuous support so they can make
                confident decisions about their academic and professional
                future.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-100 bg-white p-9 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                <Eye size={30} />
              </div>
              <h3 className="mb-4 text-2xl font-bold text-blue-950">
                Our Vision
              </h3>
              <p className="leading-8 text-slate-600">
                To become a trusted educational counselling platform where
                every student can discover suitable opportunities and take
                meaningful steps towards achieving their career goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <span className="font-semibold uppercase tracking-widest text-cyan-600">
              Why Doctor Council
            </span>
            <h2 className="mt-3 text-3xl font-bold text-blue-950 md:text-4xl">
              Why Choose Us?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
              We are committed to making your educational journey
              easier with the right information and guidance.
            </p>
          </div>

          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                    <Icon size={28} />
                  </div>

                  <h3 className="mb-3 text-xl font-bold text-blue-950">
                    {feature.title}
                  </h3>

                  <p className="leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-950 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-400 text-blue-950">
            <Award size={34} />
          </div>

          <h2 className="text-3xl font-bold md:text-4xl">
            Let Us Help You Shape Your Future
          </h2>

          <p className="mt-5 leading-8 text-blue-100">
            Explore courses, discover colleges and take the next step
            towards your educational goals with Doctor Council.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/course"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-7 py-3.5 font-semibold text-white transition hover:bg-cyan-600"
            >
              Explore Courses <ArrowRight size={18} />
            </Link>

            <Link
              href="/contact"
              className="rounded-lg border border-white/40 px-7 py-3.5 font-semibold transition hover:bg-white hover:text-blue-950"
            >
              Get Guidance
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
