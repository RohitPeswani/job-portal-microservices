import CarrerGuide from '@/components/carrerguide'
import Hero from '@/components/hero'
import Navbar from '@/components/navbar'
import ResumeAnalyzer from '@/components/resumeanalyzer'
import React from 'react'

const page = () => {
  return (
   <div>
    <Hero />
    <CarrerGuide />
    <ResumeAnalyzer />
   </div>
  )
}

export default page