import React, { useState, useEffect, useRef, useCallback } from 'react';

// Define keyframe animations directly for this demo.
const GlobalAnimations = () => (
  <style>
    {`
    @keyframes fadeInSlideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulseOnce {
      0% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); /* indigo-500 with opacity */
        transform: scale(1);
      }
      50% {
        box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); /* Larger pulse */
        transform: scale(1.02);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
        transform: scale(1);
      }
    }

    .animate-fadeInSlideUp {
      animation: fadeInSlideUp 0.5s ease-out forwards;
    }

    .animate-fadeInDown {
      animation: fadeInDown 0.6s ease-out forwards;
    }

    .animate-fadeInUp {
      animation: fadeInUp 0.6s ease-out forwards;
    }

    .animate-pulse-once {
      animation: pulseOnce 0.8s ease-out;
    }
    `}
  </style>
);

// Simplified Threads Component
const Threads = ({ amplitude, distance, enableMouseInteraction }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: null, y: null });

  const numParticles = 100; // Number of "threads" or particles

  // Function to initialize particles
  const initParticles = useCallback((canvas) => {
    particles.current = [];
    for (let i = 0; i < numParticles; i++) {
      particles.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5, // Small random velocity
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1, // Small visual size
      });
    }
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    ctx.strokeStyle = 'rgba(129, 140, 248, 0.3)'; // indigo-300 with transparency
    ctx.lineWidth = 0.5;

    particles.current.forEach(p1 => {
      // Update particle position
      p1.x += p1.vx;
      p1.y += p1.vy;

      // Bounce off walls
      if (p1.x < 0 || p1.x > canvas.width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > canvas.height) p1.vy *= -1;

      // Mouse interaction (repulsion) - only if enabled
      if (enableMouseInteraction && mouse.current.x !== null) {
        const dx = p1.x - mouse.current.x;
        const dy = p1.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < distance * 100) { // Scale distance for effect
          const angle = Math.atan2(dy, dx);
          const force = amplitude * 0.05 / dist; // Scale amplitude for effect
          p1.vx += Math.cos(angle) * force;
          p1.vy += Math.sin(angle) * force;
        }
      }

      // Draw lines to nearby particles
      particles.current.forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) { // Connect if within 100 pixels
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });
    });

    animationFrameId.current = requestAnimationFrame(animate);
  }, [amplitude, distance, enableMouseInteraction]);

  // Handle canvas resizing
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      initParticles(canvas); // Re-initialize particles on resize
    }
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initial setup
    resizeCanvas();

    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    if (enableMouseInteraction) {
      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
      };
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', () => {
        mouse.current.x = null;
        mouse.current.y = null;
      });
    } else {
      // Ensure mouse position is reset if interaction is disabled
      mouse.current.x = null;
      mouse.current.y = null;
    }

    // Start animation
    animationFrameId.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
      if (enableMouseInteraction) { // Only remove if listeners were added
        canvas.removeEventListener('mousemove', () => {}); // Dummy remove, actual handler is local
        canvas.removeEventListener('mouseleave', () => {}); // Dummy remove
      }
    };
  }, [animate, resizeCanvas, enableMouseInteraction]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" // z-0 puts it behind content
      style={{
        background: 'linear-gradient(to bottom right, #e0e7ff, #c7d2fe)', // Light indigo gradient background
      }}
    ></canvas>
  );
};


// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBook, setSelectedBook] = useState(null);
  const [pageTransitioning, setPageTransitioning] = useState(false);

  // Function to navigate to the book details page with animation
  const navigateToBookDetails = (book) => {
    setPageTransitioning(true);
    setTimeout(() => {
      setSelectedBook(book);
      setCurrentPage('bookDetails');
      setPageTransitioning(false);
    }, 300); // Duration of fade-out
  };

  // Function to navigate back to the home page with animation
  const navigateToHome = () => {
    setPageTransitioning(true);
    setTimeout(() => {
      setCurrentPage('home');
      setSelectedBook(null);
      setPageTransitioning(false);
    }, 300); // Duration of fade-out
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 font-sans antialiased flex flex-col">
      <GlobalAnimations /> {/* Include global keyframe animations */}
      <Header onHomeClick={navigateToHome} />
      <main className={`flex-grow container mx-auto px-4 py-8 transition-opacity duration-300 ${pageTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {currentPage === 'home' && <HomePage navigateToBookDetails={navigateToBookDetails} />}
        {currentPage === 'bookDetails' && selectedBook && (
          <BookDetailsPage book={selectedBook} navigateToHome={navigateToHome} />
        )}
      </main>
    </div>
  );
};

// Header Component
const Header = ({ onHomeClick }) => (
  <header className="bg-gradient-to-r from-indigo-600 to-purple-700 shadow-lg py-4 px-6 flex items-center justify-between rounded-b-xl">
    <div className="flex items-center space-x-4">
      <h1 className="text-3xl font-extrabold text-white cursor-pointer" onClick={onHomeClick}>EduTech</h1>
      <nav className="hidden md:flex space-x-4">
        <button
          onClick={onHomeClick}
          className="text-indigo-100 hover:text-white font-medium px-3 py-2 rounded-lg transition duration-200"
        >
          Available Books
        </button>
      </nav>
    </div>
    <div className="flex items-center space-x-4">
      <button className="px-5 py-2 border border-indigo-300 rounded-full text-indigo-100 hover:bg-indigo-700 hover:border-indigo-700 transition duration-200 shadow-sm">
        Log In
      </button>
      <button className="px-5 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition duration-200 shadow-lg">
        Sign Up
      </button>
    </div>
  </header>
);

// Home Page Component
const HomePage = ({ navigateToBookDetails }) => {
  const books = [
    {
      id: 'art-of-electronics',
      title: 'The Art of Electronics',
      description: 'Master the fundamentals and advanced concepts of electronics design.',
      imageUrl: process.env.PUBLIC_URL + '/images/WhatsApp Image 2025-07-05 at 00.05.17_13b7a3b3.jpg',
      isWorking: true,
    },
    {
      id: 'digital-circuit-design',
      title: 'Digital Circuit Design',
      description: 'Learn logic gates, combinational and sequential circuits.',
      icon: (
        <svg className="w-16 h-16 text-cyan-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6zm2 0v12h12V6H6zm11 1h-2v2h2V7zm-4 0H9v2h4V7zm-4 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"></path>
        </svg>
      ),
      isWorking: false,
    },
    {
      id: 'microcontroller-programming',
      title: 'Microcontroller Programming',
      description: 'Hands-on guide to Arduino, ESP32, and embedded C.',
      icon: (
        <svg className="w-16 h-16 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
        </svg>
      ),
      isWorking: false,
    },
    {
      id: 'electromagnetism',
      title: 'Electromagnetism Fundamentals',
      description: 'Understand fields, waves, and Maxwell\'s equations.',
      icon: (
        <svg className="w-16 h-16 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 12h-2V7h-2v5h-2V7h-2v5H9V7H7v5H5V7H3v12h18V7h-2v5zm-2-7h-2V3h2v2zM7 3v2H5V3h2z"></path>
        </svg>
      ),
      isWorking: false,
    },
    {
      id: 'analog-filter-design',
      title: 'Analog Filter Design',
      description: 'Design and analyze passive and active filters.',
      icon: (
        <svg className="w-16 h-16 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20H8V4h2v16zm6-16h-2v16h2V4z"></path>
        </svg>
      ),
      isWorking: false,
    },
    {
      id: 'pcb-design',
      title: 'PCB Layout & Manufacturing',
      description: 'From schematic to fabrication: practical PCB design.',
      icon: (
        <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 19c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM15 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.5 13H11v-2H7.5V3H13v2h2V3h3V11h-3v2h3v8H5V13h2.5z"></path>
        </svg>
      ),
      isWorking: false,
    },
  ];

  return (
    <section className="py-8">
      {/* Hero Section with Animations */}
      <div className="text-center mb-12">
        <h2 className="text-5xl font-extrabold text-gray-900 mb-4 animate-fadeInDown" style={{ animationDelay: '0.1s' }}>
          Explore the World of Electronics
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
          Dive deep into circuits, components, and cutting-edge technologies with our comprehensive book collection.
        </p>
      </div>

      <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
        Available Books
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {books.map((book, index) => (
          <div
            key={book.id}
            className={`group bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center text-center transition-all duration-300 ease-in-out border-2 border-transparent
              ${book.isWorking ? 'hover:shadow-2xl hover:scale-105 hover:border-indigo-400 cursor-pointer' : 'opacity-70 cursor-not-allowed'}
              animate-fadeInSlideUp`}
            style={{ animationDelay: `${0.6 + index * 0.1}s` }} // Staggered animation
            onClick={() => book.isWorking && navigateToBookDetails(book)}
          >
            {/* Conditional rendering for image or SVG icon */}
            <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110">
              {book.imageUrl ? (
                <img
                  src={book.imageUrl}
                  alt={`${book.title} Cover`}
                  className="w-24 h-24 rounded-lg object-cover shadow-md"
                  onError={(e) => {
                    e.target.onerror = null; // Prevents infinite loop
                    // Fallback to a placeholder if the image fails to load
                    e.target.src = "https://placehold.co/96x96/E0E7FF/4F46E5?text=AoE";
                  }}
                />
              ) : (
                book.icon
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{book.title}</h3>
            <p className="text-gray-600 text-sm">{book.description}</p>
            {!book.isWorking && (
              <span className="mt-3 px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs font-medium">Coming Soon</span>
            )}
          </div>
        ))}
      </div>

      {/* Additional Section to "fill" the page */}
      <div className="mt-16 text-center animate-fadeInUp" style={{ animationDelay: '1.5s' }}>
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Why Choose EduTech?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-xl font-semibold text-indigo-700 mb-2">Expert Curated Content</h4>
            <p className="text-gray-600 text-sm">Our books are selected and reviewed by industry experts.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-xl font-semibold text-indigo-700 mb-2">Interactive Learning</h4>
            <p className="text-gray-600 text-sm">Engage with audio lessons and practical examples.</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h4 className="text-xl font-semibold text-indigo-700 mb-2">Progress Tracking</h4>
            <p className="text-gray-600 text-sm">Unlock new content as you master each topic.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

// Book Details Page Component
const BookDetailsPage = ({ book, navigateToHome }) => {
  const [activeTopic, setActiveTopic] = useState(null);
  const [unlockedTopics, setUnlockedTopics] = useState([]);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [lastUnlockedTopic, setLastUnlockedTopic] = useState(null); // State to trigger animation

  // IMPORTANT: This useEffect hook handles stopping the audio when the component unmounts
  // or when a new topic is selected (by activeTopic change).
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [activeTopic]); // Dependency array includes activeTopic to stop previous audio when new one starts

  // --- CHANGE START ---
  // Reverted to audible placeholder audio URLs to ensure the player works.
  // The previous local file paths might not have been working in the deployed environment.
  const artOfElectronicsTopics = [
    { id: 'intro-analog', title: '1. Introduction to Analog Electronics', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'rcl-components', title: '2. Resistors, Capacitors, and Inductors', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'diode-apps', title: '3. Diode Applications and Rectifiers', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 'transistor-amps', title: '4. Transistor Amplifiers (BJT & MOSFET)', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: 'op-amp-circuits', title: '5. Operational Amplifier Circuits', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: 'digital-logic', title: '6. Digital Logic Gates', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
    { id: 'microcontrollers', title: '7. Microcontrollers and Interfacing', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
    { id: 'power-supplies', title: '8. Power Supplies and Regulators', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { id: 'noise-grounding', title: '9. Noise and Grounding Techniques', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
    { id: 'practical-design', title: '10. Practical Design Considerations', audio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
  ];
  // --- CHANGE END ---

  // Initialize unlocked topics (only the first one is unlocked initially)
  useEffect(() => {
    if (book.id === 'art-of-electronics') {
      setUnlockedTopics([artOfElectronicsTopics[0].id]);
    }
  }, [book, artOfElectronicsTopics]); // Added artOfElectronicsTopics to dependency array

  // Effect to update playback speed when state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle audio playback
  const handlePlayAudio = (topic) => {
    // Log the audio URL to the console for debugging
    console.log("Attempting to play audio from:", topic.audio);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveTopic(topic.id);
    audioRef.current = new Audio(topic.audio);
    audioRef.current.playbackRate = playbackSpeed; // Apply current speed
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(error => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
        // You can add a user-facing message here if needed
      });
    

    audioRef.current.onpause = () => {
        setIsPlaying(false);
    }
    
    audioRef.current.onplay = () => {
        setIsPlaying(true);
    }

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      // Unlock the next topic
      const currentIndex = artOfElectronicsTopics.findIndex(t => t.id === topic.id);
      if (currentIndex !== -1 && currentIndex < artOfElectronicsTopics.length - 1) {
        const nextTopicId = artOfElectronicsTopics[currentIndex + 1].id;
        setUnlockedTopics((prev) => {
          if (!prev.includes(nextTopicId)) {
            setLastUnlockedTopic(nextTopicId); // Trigger animation for the newly unlocked topic
            return [...prev, nextTopicId];
          }
          return prev;
        });
      }
    };

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current && audioRef.current.duration) {
        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };
  };

  // Handle 10-second forward jump
  const handleForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
    }
  };

  // Handle 10-second backward jump
  const handleBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
    }
  };
  
  const handlePause = () => {
      if(audioRef.current){
          audioRef.current.pause();
      }
  }
  
  const handlePlay = () => {
      if(audioRef.current){
          audioRef.current.play();
      }
  }

  return (
    <section className="py-8 relative min-h-[calc(100vh-120px)]"> {/* Added relative and min-height for background */}
      {/* Conditional Threads Background */}
      {book.id === 'art-of-electronics' && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
          <Threads
            amplitude={1}
            distance={0.5} // Adjusted distance for visual effect
            enableMouseInteraction={false} // Mouse interaction disabled here
          />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl"> {/* Added z-10 and background for content */}
        {/* Back Button */}
        <button
          onClick={navigateToHome}
          className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition duration-200 flex items-center shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Books
        </button>

        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center animate-fadeInDown">{book.title}</h2>
        <p className="text-gray-600 mb-10 text-center max-w-2xl mx-auto animate-fadeInUp">{book.description}</p>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Section: Book Topics */}
          <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Topics</h3>
            <div className="space-y-4">
              {artOfElectronicsTopics.map((topic, index) => (
                <button
                  key={topic.id}
                  onClick={() => handlePlayAudio(topic)}
                  disabled={!unlockedTopics.includes(topic.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-300 ease-in-out flex items-center justify-between
                    ${unlockedTopics.includes(topic.id)
                      ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 cursor-pointer'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-70'
                    }
                    ${activeTopic === topic.id ? 'border-2 border-indigo-500 shadow-md transform scale-[1.01]' : ''}
                    ${lastUnlockedTopic === topic.id ? 'animate-pulse-once' : ''}
                  `}
                >
                  <span className="font-medium">{topic.title}</span>
                  {unlockedTopics.includes(topic.id) ? (
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Section: Audio Player and Info */}
          <div className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Audio Playback</h3>
            {activeTopic ? (
              <div className="w-full max-w-sm text-center">
                <p className="text-xl font-medium text-indigo-700 mb-4">
                  Now Playing: {artOfElectronicsTopics.find(t => t.id === activeTopic)?.title}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-100 ease-linear"
                    style={{ width: `${audioProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-center items-center space-x-4 mb-4">
                  {/* Backward Button */}
                  <button
                    onClick={handleBackward}
                    className="p-3 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!activeTopic}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"></path>
                    </svg>
                  </button>
                  {/* Pause Button */}
                  <button
                    onClick={handlePause}
                    disabled={!isPlaying}
                    className="p-3 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
                    </svg>
                  </button>
                  {/* Play Button */}
                  <button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="p-3 bg-emerald-500 text-white rounded-full shadow-md hover:bg-emerald-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"></path>
                    </svg>
                  </button>
                  {/* Forward Button */}
                  <button
                    onClick={handleForward}
                    className="p-3 bg-indigo-500 text-white rounded-full shadow-md hover:bg-indigo-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!activeTopic}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"></path>
                    </svg>
                  </button>
                </div>
                {/* Playback Speed */}
                <div className="flex items-center justify-center space-x-2">
                  <label htmlFor="playbackSpeed" className="text-gray-700 font-medium">Speed:</label>
                  <select
                    id="playbackSpeed"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                  >
                    <option value="0.5">0.5x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2.0x</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="mb-2">Select a topic to start listening.</p>
                <svg className="w-24 h-24 mx-auto text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default App;
