import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'; // Added icons
import Button from '../common/Button';

interface WelcomeOverlayProps {
  onClose: () => void;
}

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    {
      title: 'Welcome to WealFlow!',
      description: 'Your personal finance companion. Track income, manage expenses, and gain insights to achieve your financial goals.',
      image: 'https://picsum.photos/seed/welcome/800/400', 
      icon: <CheckCircle size={48} className="text-primary-500 mb-4" />
    },
    {
      title: 'Track Your Transactions Seamlessly',
      description: 'Easily record every penny. Categorize income and expenses to understand your spending patterns.',
      image: 'https://picsum.photos/seed/transactions/800/400',
      icon: <CheckCircle size={48} className="text-primary-500 mb-4" />
    },
    {
      title: 'Visualize Your Financial Health',
      description: 'Interactive charts and insightful statistics help you see where your money goes and identify savings opportunities.',
      image: 'https://picsum.photos/seed/visualize/800/400',
      icon: <CheckCircle size={48} className="text-primary-500 mb-4" />
    },
    {
      title: "You're All Set!",
      description: 'Start managing your finances effectively with WealFlow. Click "Get Started" to dive in.',
      image: 'https://picsum.photos/seed/getstarted/800/400',
      icon: <CheckCircle size={48} className="text-green-500 mb-4" />
    }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose(); // Close on the last step
    }
  };

  const prevStep = () => {
      if(currentStep > 0) {
          setCurrentStep(currentStep - 1);
      }
  }
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 25 }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close welcome message"
          >
            <X size={20} />
          </button>
          
          <div className="h-48 sm:h-64 w-full overflow-hidden">
            <img
              src={steps[currentStep].image}
              alt={steps[currentStep].title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="p-6 text-center flex-grow flex flex-col justify-between">
            <div>
              {steps[currentStep].icon}
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                {steps[currentStep].description}
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex space-x-1.5">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300
                      ${ index === currentStep
                        ? 'bg-primary-500 scale-125'
                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-primary-300 dark:hover:bg-primary-700'
                      }`}
                    aria-label={`Go to step ${index + 1}`}
                  />
                ))}
              </div>
              
              <div className="flex space-x-3">
                {currentStep > 0 && (
                     <Button variant="outline" size="md" onClick={prevStep} icon={<ChevronLeft size={18}/>}>
                        Back
                    </Button>
                )}
                <Button
                  variant="primary"
                  size="md"
                  onClick={nextStep}
                  icon={currentStep < steps.length - 1 ? <ChevronRight size={18} /> : undefined}
                  iconPosition="right"
                >
                  {currentStep < steps.length - 1 ? 'Next' : 'Get Started'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
