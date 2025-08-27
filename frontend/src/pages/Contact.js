import React from 'react';

const Contact = () => {
  return (
    <div className="bg-white">
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-700 leading-7 mb-8">
          Have questions or feedback? Send us a message and we’ll get back to you.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 card">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <input className="input-field" placeholder="Your name" />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="input-field" placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label className="form-label">Subject</label>
                <input className="input-field" placeholder="How can we help?" />
              </div>
              <div>
                <label className="form-label">Message</label>
                <textarea className="input-field" rows="5" placeholder="Write your message..." />
              </div>
              <div className="flex justify-end">
                <button type="button" className="btn-primary">Send Message</button>
              </div>
            </form>
          </div>
          <div className="space-y-4">
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600 text-sm">support@healthcare-booking.com</p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Sales</h3>
              <p className="text-gray-600 text-sm">sales@healthcare-booking.com</p>
            </div>
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <p className="text-gray-600 text-sm">123 Health St, Wellness City</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;


