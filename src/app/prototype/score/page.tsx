"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn, BRAND_COLORS } from '@/lib/utils';

interface ReviewItem {
  qid: string;
  text: string;
  yourAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface ResultsData {
  score: number;
  total: number;
  review: ReviewItem[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function fetchResults() {
      const email = localStorage.getItem('wtn_user_email');
      if (!email) {
        router.push('/prototype');
        return;
      }
      setUserEmail(email);

      try {
        const res = await fetch(`/api/quiz/results?email=${email}`);
        if (!res.ok) {
          throw new Error('Failed to fetch results.');
        }
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        setError('Error loading results. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [router]);

  const handleExit = () => {
      localStorage.removeItem('wtn_user_email');
      localStorage.removeItem('wtn_school_id');
      localStorage.removeItem('wtn_school_name');
      router.push('/prototype');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent relative z-10">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
        <span className="ml-3 text-lg font-medium text-white">Processing Results...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative z-10">
        <div className="bg-white p-8 rounded-[20px] shadow-xl max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4 bg-[#F38133] hover:bg-[#d9722b]">
                Try Again
            </Button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-transparent font-[Agenda,sans-serif] relative flex flex-col md:flex-row overflow-hidden">
      {/* --- PAGE BACKGROUND --- */}
      <div 
        className="fixed inset-0 z-[-2] bg-[url('/images/score-bg.png')] bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />

      {/* --- FIXED LOGO --- */}
      <div className="fixed top-12 left-12 w-48 md:w-64 z-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/login-logo.png" alt="WTN Logo" className="w-full h-auto drop-shadow-md" />
      </div>

      {/* --- FIXED RETURN HOME BUTTON --- */}
      <div className="fixed top-56 left-12 z-50">
            <button 
                onClick={handleExit}
                className="group flex items-center gap-3 px-6 py-3 rounded-full border-2 transition-all hover:bg-white/10 active:scale-95 bg-transparent"
                style={{ 
                    borderColor: BRAND_COLORS.DARK_GREY,
                    color: BRAND_COLORS.DARK_GREY,
                    fontFamily: 'var(--font-parkinsans), sans-serif'
                }}
            >
                <span className="text-xl font-bold">←</span>
                <span className="text-sm font-bold uppercase tracking-widest">Return Home</span>
            </button>
      </div>

      {/* --- LEFT SECTION: Branding/Logo --- */}
      <div className="flex-1 flex flex-col items-start justify-center p-8 md:p-12 relative z-10 pointer-events-none">
        {/* Empty placeholder to maintain layout balance */}
      </div>

      {/* --- RIGHT SECTION: The Paper Results --- */}
      <div className="flex-1 relative min-h-screen bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.2)] z-20">
        
        {/* Paper Edge Decoration (Vertical) */}
        <div 
            className="absolute top-0 left-0 bottom-0 w-8 z-30 pointer-events-none -translate-x-full"
            style={{ 
                backgroundImage: "url('/images/score-paper-edge.png')",
                backgroundRepeat: 'repeat-y',
                backgroundSize: '100% auto'
            }}
        />

        {/* Scrollable Content Area */}
        <div className="h-full overflow-y-auto custom-scrollbar">
            <div className="px-6 md:px-12 py-16 flex flex-col items-center">
                
                {/* Score Header Section - Split Layout */}
                <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-8 mb-16">
                    <div className="flex-1 text-center lg:text-left">
                        <h1 
                            className="text-5xl md:text-6xl font-bold tracking-tighter mb-4"
                            style={{ 
                                fontFamily: 'var(--font-parkinsans), sans-serif',
                                color: BRAND_COLORS.DARK_GREY 
                            }}
                        >
                            Your Score
                        </h1>
                        <div className="space-y-3">
                            <p 
                                className="text-sm"
                                style={{ 
                                    fontFamily: 'Agenda, sans-serif',
                                    color: BRAND_COLORS.DARK_GREY 
                                }}
                            >
                                A copy of these results has been emailed to:
                            </p>
                            <div 
                                className="inline-block px-4 py-2 rounded-xl font-bold"
                                style={{ 
                                    fontFamily: 'Agenda, sans-serif',
                                    backgroundColor: BRAND_COLORS.LIGHT_BROWN,
                                    color: BRAND_COLORS.BLUE
                                }}
                            >
                                {userEmail}
                            </div>
                        </div>
                    </div>

                    {/* Score Circle */}
                    <div className="relative flex items-center justify-center">
                        {(() => {
                            const percentage = Math.round((data.score / data.total) * 100);
                            let color = BRAND_COLORS.PINK;
                            if (percentage > 70) color = BRAND_COLORS.GREEN;
                            else if (percentage >= 30) color = BRAND_COLORS.YELLOW;

                            const size = 180;
                            const strokeWidth = 10;
                            const radius = (size - strokeWidth) / 2;
                            const circumference = radius * 2 * Math.PI;
                            const offset = circumference - (percentage / 100) * circumference;

                            return (
                                <div className="relative" style={{ width: size, height: size }}>
                                    <svg className="transform -rotate-90 w-full h-full">
                                        <circle
                                            cx={size / 2}
                                            cy={size / 2}
                                            r={radius}
                                            stroke="#f3f4f6"
                                            strokeWidth={strokeWidth}
                                            fill="transparent"
                                        />
                                        <circle
                                            cx={size / 2}
                                            cy={size / 2}
                                            r={radius}
                                            stroke={color}
                                            strokeWidth={strokeWidth}
                                            fill="transparent"
                                            strokeDasharray={circumference}
                                            style={{ strokeDashoffset: offset, transition: 'stroke-dashoffset 1s ease-out' }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                        <span 
                                            className="text-5xl font-bold leading-none"
                                            style={{ 
                                                fontFamily: 'var(--font-parkinsans), sans-serif',
                                                color: color 
                                            }}
                                        >
                                            {percentage}%
                                        </span>
                                        <div 
                                            className="mt-1 text-sm font-bold"
                                            style={{ 
                                                fontFamily: 'Agenda, sans-serif',
                                                color: BRAND_COLORS.DARK_GREY + '99' 
                                            }}
                                        >
                                            {data.score} out of {data.total}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>

                {/* Review List - 3 Column Layout */}
                <div className="w-full">
                    <div className="space-y-0 border-t border-gray-100">
                        {data.review.map((item, idx) => (
                            <div 
                                key={item.qid} 
                                className="flex items-stretch border-b border-gray-100 py-6 group hover:bg-gray-50/50 transition-colors"
                            >
                                {/* Column 1: Number */}
                                <div className="w-12 md:w-16 flex-shrink-0 flex items-start justify-center pt-1">
                                    <span 
                                        className="text-[20px] font-bold"
                                        style={{ 
                                            fontFamily: 'var(--font-parkinsans), sans-serif',
                                            color: BRAND_COLORS.DARK_GREY
                                        }}
                                    >
                                        {String(idx + 1).padStart(2, '0')}.
                                    </span>
                                </div>
                                
                                {/* Column 2: Question & Answers */}
                                <div className="flex-1 px-4 space-y-2">
                                    <p 
                                        className="text-base md:text-lg leading-tight"
                                        style={{ 
                                            fontFamily: 'Agenda, sans-serif',
                                            color: BRAND_COLORS.DARK_GREY
                                        }}
                                    >
                                        {item.text}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-xs md:text-sm font-bold" style={{ fontFamily: 'Agenda, sans-serif' }}>
                                            <span style={{ color: BRAND_COLORS.DARK_GREY }} className="mr-2">Answered:</span> 
                                            <span style={{ color: item.isCorrect ? BRAND_COLORS.GREEN : BRAND_COLORS.PINK }}>
                                                {item.yourAnswer}
                                            </span>
                                        </p>
                                        {!item.isCorrect && (
                                            <p className="text-xs md:text-sm font-bold" style={{ fontFamily: 'Agenda, sans-serif' }}>
                                                <span style={{ color: BRAND_COLORS.DARK_GREY }} className="mr-2">Correct answer:</span> 
                                                <span style={{ color: BRAND_COLORS.GREEN }}>{item.correctAnswer}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Column 3: Tick/Cross Asset */}
                                <div className="w-16 md:w-20 flex-shrink-0 flex items-start justify-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img 
                                        src={item.isCorrect ? "/images/score-tick.png" : "/images/score-cross.png"} 
                                        alt={item.isCorrect ? "Correct" : "Incorrect"}
                                        className="w-10 h-10 md:w-12 md:h-12 object-contain"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="h-20" /> {/* Extra spacing at bottom of paper */}
            </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #242F6B20;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #242F6B40;
        }
      `}</style>
    </div>
  );
}