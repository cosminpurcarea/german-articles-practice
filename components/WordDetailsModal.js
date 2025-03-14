import React from 'react';

export default function WordDetailsModal({ word, onClose }) {
  if (!word) return null;

  // Default example sentences based on the word
  const defaultExamples = [
    {
      german: `${word.article} ${word.word} ist sehr wichtig.`,
      english: `The ${word.translation.toLowerCase()} is very important.`
    },
    {
      german: `Ich sehe ${word.article.toLowerCase()} ${word.word}.`,
      english: `I see the ${word.translation.toLowerCase()}.`
    }
  ];

  // Use provided examples if they exist, otherwise use defaults
  const examples = word.examples || defaultExamples;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-[32rem] shadow-xl rounded-lg bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {word.word}
            </h3>
            <p className="text-sm text-gray-500 mt-1">German Noun</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 rounded-full hover:bg-gray-100"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information Card */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-800">Article</p>
                <p className="mt-1 text-2xl font-semibold text-blue-900">{word.article}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Translation</p>
                <p className="mt-1 text-2xl font-semibold text-blue-900">{word.translation}</p>
              </div>
            </div>
          </div>

          {/* Rule Section - only show if rule exists */}
          {word.rule && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Rule</h4>
              <p className="text-gray-600">{word.rule}</p>
            </div>
          )}

          {/* Examples Section - always show with either custom or default examples */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Example Sentences</h4>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <p className="text-blue-600 font-medium">{example.german}</p>
                  <p className="text-gray-600 text-sm mt-1">{example.english}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notes Section - only show if notes exist */}
          {word.notes && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Additional Notes</h4>
              <p className="text-gray-600">{word.notes}</p>
            </div>
          )}

          {/* Close Button */}
          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 