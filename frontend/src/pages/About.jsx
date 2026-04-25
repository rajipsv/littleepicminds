import React from 'react';
import { Heart, Shield, Star, Award, Code, GraduationCap } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-indigo-900 mb-6">Our Story</h1>
          <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
            Making the timeless wisdom of the Bhagavad Gita a friendly guide for every child.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-slate-100 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative inline-block mb-8">
                <div className="w-48 h-48 bg-orange-100 rounded-[3rem] overflow-hidden rotate-3 flex items-center justify-center">
                   <span className="text-6xl font-black text-orange-500">R</span>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-indigo-900 text-white p-4 rounded-2xl shadow-lg">
                   <Award size={24} />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Rajeswari</h2>
              <p className="text-indigo-600 font-bold mb-6">Founder & Software Veteran</p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-slate-600 font-medium">
                  <Code size={20} className="text-indigo-500" />
                  <span>20+ Years in Software Industry</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600 font-medium">
                  <Heart size={20} className="text-rose-500" />
                  <span>Parent & Passionate Educator</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600 font-medium">
                  <GraduationCap size={20} className="text-orange-500" />
                  <span>Gita Storyteller</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-slate-600 leading-relaxed font-medium">
              <p>
                "I love sharing the timeless wisdom of the Bhagavad Gita with children in a simple and joyful way. As a parent and educator, I believe that values like kindness, courage, honesty, and doing our best should be taught from a young age."
              </p>
              <p>
                "The Bhagavad Gita has always inspired me in my daily life. I wanted children to understand its beautiful teachings without difficulty, fear, or confusion. So I began rewriting each sloka as small, relatable stories with fun activities and simple explanations."
              </p>
              <p>
                "What started as teaching my own children slowly became storybooks that help many young minds learn life lessons in an easy and meaningful way. My goal is to make the Bhagavad Gita a friendly guide for every child — helping them grow with confidence and positivity."
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Build Values</h3>
            <p className="text-slate-500 text-sm">Instilling kindness, honesty, and courage through relatable narratives.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Stay Strong</h3>
            <p className="text-slate-500 text-sm">Helping children navigate life's ups and downs with resilience.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Modern AI</h3>
            <p className="text-slate-500 text-sm">20+ years of tech expertise powering personalized learning.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
