"use client";

import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  GraduationCap,
  Stethoscope,
  BookOpen,
  Users,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  User,
  FileText,
  Send,
  Sparkles,
} from "lucide-react";

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    subject: "",
    enquiryType: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
  e: React.ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  });
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "https://doctor-council.onrender.com/contact",
        formData
      );

      if (res.data.status) {
        toast.success(res.data.message);

        setFormData({
          name: "",
          email: "",
          contact: "",
          subject: "",
          enquiryType: "",
          message: "",
        });
      } else {
        toast.error(res.data.message);
      }
    } catch (err: unknown) {
  const message =
    axios.isAxiosError(err)
      ? err.response?.data?.message || "Something went wrong"
      : err instanceof Error
        ? err.message
        : "Something went wrong";

  toast.error(message);
} finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-slate-700";

  return (
    <section className="relative overflow-hidden bg-[#f4f7fc] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      {/* Background Decoration */}
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-700 shadow-sm">
            <Sparkles size={14} />
            We Are Here To Help
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Let's Start Your{" "}
            <span className="text-blue-700">Medical Journey</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Get expert guidance for your medical admission.
            Share your requirements and let our counselling team
            help you choose the right career path.
          </p>
        </div>

        {/* Main Card */}
        <div className="grid overflow-hidden rounded-3xl bg-white shadow-[0_25px_80px_-25px_rgba(15,23,42,0.20)] lg:grid-cols-5">
          
          {/* Left Information Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#102b50] via-[#153d70] to-[#1d4f91] p-7 text-white sm:p-10 lg:col-span-2 lg:p-11">
            {/* Decorative Circles */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-blue-400/10 blur-2xl" />

            <div className="relative z-10">
              {/* Brand */}
              <div className="mb-12 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-800 shadow-lg">
                  <GraduationCap size={27} />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold tracking-wide">
                    DOCTOR COUNCIL
                  </h2>
                  <p className="text-[10px] font-medium uppercase tracking-[2px] text-blue-200">
                    Your Career Partner
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                <Stethoscope size={14} />
                Medical Admission Guidance
              </span>

              <h2 className="mt-6 text-3xl font-extrabold leading-tight sm:text-4xl">
                Your Medical Career Starts Here!
              </h2>

              <p className="mt-5 text-sm leading-7 text-blue-100/80">
                Choosing the right medical college is an important
                decision. Our expert counselling team is here to
                guide you at every step of your admission journey.
              </p>

              {/* Benefits */}
              <div className="mt-9 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                    <BookOpen size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Expert Admission Guidance
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-blue-100/70">
                      Get guidance to choose the right course and college.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                    <Users size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Personal Counselling
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-blue-100/70">
                      Get assistance according to your preferences.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-200">
                    <ShieldCheck size={21} />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Trusted Support
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-blue-100/70">
                      Support throughout your admission process.
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="mt-11 border-t border-white/15 pt-7">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-200">
                  Need Assistance?
                </p>

                <div className="flex items-center gap-3 text-sm text-blue-50">
                  <Phone size={17} />
                  <span>Talk to our counselling team</span>
                </div>

                <div className="mt-3 flex items-center gap-3 text-sm text-blue-50">
                  <Mail size={17} />
                  <span>Get admission-related support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Section */}
          <div className="p-6 sm:p-10 lg:col-span-3 lg:p-12">
            <div className="mb-8">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <MessageSquare size={24} />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Admission Inquiry Form
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill in your details below and our team will get
                in touch with you shortly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name and Email */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Full Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Email Address <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Contact and Subject */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Contact Number <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      name="contact"
                      placeholder="10 digit mobile number"
                      value={formData.contact}
                      onChange={handleChange}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Subject <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      name="subject"
                      placeholder="Enter inquiry subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Enquiry Type */}
              <div>
                <label className={labelClass}>
                  Enquiry Type <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <BookOpen
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="enquiryType"
                    value={formData.enquiryType}
                    onChange={handleChange}
                    required
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Select Enquiry Type</option>
                    <option value="Admission">Admission</option>
                    <option value="Course">Course Related</option>
                    <option value="Fees">Fees Related</option>
                    <option value="General">General Enquiry</option>
                    <option value="Other">Other</option>
                  </select>

                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                    ▼
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className={labelClass}>
                  Your Message <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <MessageSquare
                    size={17}
                    className="absolute left-4 top-4 text-slate-400"
                  />

                  <textarea
                    name="message"
                    placeholder="Tell us about your admission requirements..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    required
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#174b8a] to-[#2468bd] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#123d72] hover:to-[#1b57a0] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting Your Inquiry...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Submit Your Inquiry
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              {/* Privacy Note */}
              <div className="flex items-center justify-center gap-2 pt-1 text-center">
                <CheckCircle2 size={15} className="shrink-0 text-green-600" />
                <p className="text-xs text-slate-500">
                  Your information is safe and secure with us.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
} 