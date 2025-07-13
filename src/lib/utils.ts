import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return "Good morning";
  } else if (hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
}

export function getRandomMathQuote(): string {
  const quotes = [
    "Pure mathematics is, in its way, the poetry of logical ideas. - Albert Einstein",
    "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding. - William Paul Thurston",
    "Mathematics is the music of reason. - James Joseph Sylvester",
    "Mathematics reveals its secrets only to those who approach it with pure love. - Archimedes",
    "The essence of mathematics is not to make simple things complicated, but to make complicated things simple. - S. Gudder",
    "Mathematics is the most beautiful and most powerful creation of the human spirit. - Stefan Banach",
    "Mathematics is the language in which God has written the universe. - Galileo Galilei",
    "In mathematics, the art of proposing a question must be held of higher value than solving it. - Georg Cantor",
    "Mathematics is the queen of sciences and arithmetic is the queen of mathematics. - Carl Friedrich Gauss",
    "The study of mathematics, like the Nile, begins in minuteness but ends in magnificence. - Charles Caleb Colton"
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function getRandomEncouragement(): string {
  const encouragements = [
    "Ready to solve some equations today?",
    "What mathematical challenges will you tackle next?",
    "Your computational companion is ready when you are!",
    "Let's explore the beauty of mathematics together!",
    "Numbers are our friends, let's work with them today!",
    "Struggling with a problem? Break it down step by step.",
    "Remember: every expert was once a beginner.",
    "Math is about the journey, not just the answer.",
    "You're becoming more proficient with every calculation!"
  ];
  
  return encouragements[Math.floor(Math.random() * encouragements.length)];
}