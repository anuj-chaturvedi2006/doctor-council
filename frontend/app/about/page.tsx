"use client";

import React from "react";

export default function About() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* About Hero */}
      <section className="bg-blue-950 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-5">
          About Us
        </h1>

        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          Learn more about our mission, vision and commitment
          towards educational excellence.
        </p>
      </section>

      {/* About Content */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Who We Are
            </h2>

            <p className="text-gray-600 leading-8 mb-5">
              Doctor Council is committed to providing students
              with the right educational guidance and counselling.
            </p>

            <p className="text-gray-600 leading-8">
              Our goal is to help students make informed decisions
              about their education and career opportunities.
            </p>
          </div>

          <div className="bg-blue-100 rounded-2xl p-12">
            <h3 className="text-2xl font-bold text-blue-950 mb-4">
              Our Mission
            </h3>

            <p className="text-gray-700 leading-8">
              To guide students towards the right educational
              opportunities through reliable information,
              counselling and support.
            </p>
          </div>

        </div>
      </section>

      {/* Vision */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-5">
            Our Vision
          </h2>

          <p className="text-gray-600 leading-8">
            To become a trusted platform for students seeking
            quality education, career guidance and professional
            counselling.
          </p>
        </div>
      </section>
    </main>
  );
}