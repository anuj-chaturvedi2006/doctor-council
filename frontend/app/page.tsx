"use client";

import React from "react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-blue-950 text-white py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Welcome to Doctor Council
          </h1>

          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Discover the best educational opportunities and
            build a successful future with us.
          </p>

          <button className="bg-white text-blue-950 px-8 py-3 rounded-lg font-semibold hover:bg-blue-100 transition">
            Explore Courses
          </button>

        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-5">
              About Our Council
            </h2>

            <p className="text-gray-600 leading-8">
              We provide quality educational guidance and
              counselling to help students choose the right
              academic path for their future.
            </p>
          </div>

          <div className="bg-blue-100 rounded-2xl p-12 text-center">
            <h3 className="text-5xl font-bold text-blue-950">
              100+
            </h3>
            <p className="text-gray-700 mt-3">
              Educational Opportunities
            </p>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">

          <h2 className="text-3xl font-bold text-center mb-10">
            Why Choose Us?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              "Expert Counselling",
              "Quality Education",
              "Career Guidance",
            ].map((item, index) => (
              <div
                key={index}
                className="p-8 rounded-xl shadow-md border border-gray-100 text-center hover:shadow-xl transition"
              >
                <h3 className="text-xl font-bold text-blue-950 mb-3">
                  {item}
                </h3>

                <p className="text-gray-600">
                  Get the right guidance and support for
                  your educational journey.
                </p>
              </div>
            ))}

          </div>
        </div>
      </section>

    </main>
  );
}