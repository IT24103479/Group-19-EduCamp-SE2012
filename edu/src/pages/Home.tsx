import React from 'react';
    import Header from '../components/Header.tsx';
    import Hero from '../components/Hero.tsx';
    import Footer from '../components/Footer.tsx';

    const Home = () => {
      return (
        <div className="min-h-screen">
          <Header />
          <Hero />
          <Footer />
        </div>
      );
    };

    export default Home;