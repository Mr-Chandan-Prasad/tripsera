import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from 'lucide-react';
import { useLocalStorageQuery } from '../../hooks/useLocalStorage';

const Footer: React.FC = () => {
  const { data: settings } = useLocalStorageQuery('siteSettings', [{
    company_name: 'Tripsera',
    contact_number: '+91 8296724981',
    contact_email: 'Tripsera.info@gmail.com',
    company_address: 'Kesarhatti, Karnataka, India',
  }]);
  
  const siteSettings = settings[0] || {
    company_name: 'Tripsera',
    contact_number: '+91 8296724981',
    contact_email: 'Tripsera.info@gmail.com',
    company_address: 'Kesarhatti, Karnataka, India',
  };

  return (
    <footer className="bg-gradient-to-r from-purple-900 to-blue-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{siteSettings.company_name}</h3>
            <p className="text-gray-300 mb-4">
              "We don’t just take you places - at Tripsera, we design journeys that spark your soul, feed your curiosity, and stay with you forever."
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-orange-400 hover:text-yellow-300 transition-colors duration-300">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-orange-400 hover:text-yellow-300 transition-colors duration-300">
                <Twitter className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/mr_chandan_prasad_indian"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-yellow-300 transition-colors duration-300"
              >
                <Instagram className="w-6 h-6" />
              </a>
              <a 
                href="https://www.linkedin.com/in/mr-chandan-prasad1947"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:text-yellow-300 transition-colors duration-300"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-orange-400 transition-colors duration-300">Start Your Journey</Link></li>
              <li><Link to="/destinations" className="text-gray-300 hover:text-orange-400 transition-colors duration-300">Where to Next?</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-orange-400 transition-colors duration-300">Travel Your Way</Link></li>
              <li><Link to="/gallery" className="text-gray-300 hover:text-orange-400 transition-colors duration-300">Moments & Memories</Link></li>
              <li><Link to="/bookings" className="text-gray-300 hover:text-orange-400 transition-colors duration-300">Plan & Reserve</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors duration-300">Let’s Connect</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-orange-400" />
                <span className="text-gray-300 text-sm">{siteSettings.company_address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-orange-400" />
                <a 
                  href={`tel:${siteSettings.contact_number}`}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
                >
                  {siteSettings.contact_number}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-orange-400" />
                <a 
                  href={`mailto:${siteSettings.contact_email}`}
                  className="text-gray-300 hover:text-orange-400 transition-colors duration-300 text-sm"
                >
                  {siteSettings.contact_email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-purple-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 {siteSettings.company_name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;