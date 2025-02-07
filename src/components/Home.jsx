import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">MyBrand</h1>
          <ul className="flex space-x-6">
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">Home</a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">About</a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">Servicesasdasdas</a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">Contact</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center flex-grow text-center p-10">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800">
          Welcome to <span className="text-blue-600">MyBrand</span>
        </h1>
        <p className="text-lg text-gray-600 mt-4 max-w-xl">
          We provide top-notch solutions to help you grow your business. Get started today!
        </p>
        <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
          Get Started
        </button>
      </header>

      {/* Footer */}
      <footer className="bg-white shadow-md text-center p-4 mt-10">
        <p className="text-gray-500">&copy; 2025 MyBrand. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
