import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  title,
  className = ''
}) => {
  return (
    <div className="quiz-container">
      {/* Animated Background */}
      <div className="quiz-bg-particles"></div>
      
      <div className={`max-w-4xl mx-auto p-6 relative z-10 ${className}`}>
        {title && (
          <div className="quiz-header card-glass mb-6">
            <div className="flex justify-center items-center">
              <div className="quiz-info text-center">
                <h1 className="text-3xl font-bold text-brand mb-2 animate-fade-in">
                  {title}
                </h1>
              </div>
            </div>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
};

export default PageContainer;