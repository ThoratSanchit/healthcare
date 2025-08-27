import React from 'react';

const About = () => {
  return (
    <div className="bg-white">
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">About Healthcare Booking</h1>
        <p className="text-gray-700 leading-7">
          We simplify healthcare by connecting patients with trusted doctors through an easy online appointment
          platform. Manage schedules, medical records, and consultations securely with role-based access for
          patients, doctors, and administrators.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
            <p className="text-gray-600 text-sm">JWT auth, encrypted data, and role-based access.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Reliable</h3>
            <p className="text-gray-600 text-sm">Modern stack with Node, React, and MongoDB.</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-2">Scalable</h3>
            <p className="text-gray-600 text-sm">Designed for future features like telemedicine.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;


