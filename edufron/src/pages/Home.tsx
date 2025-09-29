import React from 'react';
    import Header from '../components/Header.jsx';
    import Hero from '../components/Hero.jsx';
    import Footer from '../components/Footer.jsx';

    const Home = () => {
      return (
        <div className="min-h-screen">
          <Header />
          <Hero />
          <Footer />
        </div>
      );
    };

    export default Home;