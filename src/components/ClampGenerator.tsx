import React, { useState, useEffect } from 'react';

interface FormData {
  rootFont: number;
  minWidth: number;
  maxWidth: number;
  minFont: number;
  maxFont: number;
}

interface UnitData {
  rootFont: 'px';
  minWidth: 'px';
  maxWidth: 'px';
  minFont: 'px' | 'rem';
  maxFont: 'px' | 'rem';
}

const ClampGenerator = () => {
  const [formData, setFormData] = useState<FormData>({
    rootFont: 16,
    minWidth: 380,
    maxWidth: 1600,
    minFont: 16,
    maxFont: 80,
  });
  
  const [units, setUnits] = useState<UnitData>({
    rootFont: 'px',
    minWidth: 'px',
    maxWidth: 'px',
    minFont: 'px',
    maxFont: 'px',
  });
  
  const [result, setResult] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [copyText, setCopyText] = useState<string>('Copy');

  const handleInputChange = (field: keyof FormData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
  };

  const handleUnitChange = (field: keyof UnitData, unit: 'px' | 'rem') => {
    setUnits(prev => ({ ...prev, [field]: unit }));
  };

  const generateClamp = () => {
    const { rootFont, minWidth, maxWidth, minFont, maxFont } = formData;
    
    // Validation
    if (rootFont <= 0) {
      setResult("⚠️ Root font size must be greater than 0.");
      setHasError(true);
      return;
    }
    
    if (minWidth >= maxWidth) {
      setResult("⚠️ Maximum width must be greater than minimum width.");
      setHasError(true);
      return;
    }
    
    // Convert rem values to px for comparison
    const minFontPx = units.minFont === 'rem' ? minFont * rootFont : minFont;
    const maxFontPx = units.maxFont === 'rem' ? maxFont * rootFont : maxFont;
    
    if (minFontPx >= maxFontPx) {
      setResult("⚠️ Maximum font size must be greater than minimum font size.");
      setHasError(true);
      return;
    }
    
    // Calculate clamp values (always convert to rem for output)
    const remMin = minFontPx / rootFont;
    const remMax = maxFontPx / rootFont;
    const slope = (remMax - remMin) / (maxWidth - minWidth) * 100;
    const intercept = remMin - (slope * minWidth / 100);
    
    const clampValue = `clamp(${remMin.toFixed(4)}rem, ${intercept.toFixed(4)}rem + ${slope.toFixed(4)}vw, ${remMax.toFixed(4)}rem)`;
    
    setResult(clampValue);
    setHasError(false);
  };

  const copyToClipboard = async () => {
    if (!result || hasError) return;
    
    try {
      await navigator.clipboard.writeText(result);
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = result;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopyText('Copied!');
      setTimeout(() => setCopyText('Copy'), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generateClamp();
    }
  };

  useEffect(() => {
    generateClamp();
  }, []);

  const inputFields = [
    {
      id: 'rootFont' as keyof FormData,
      label: '📏 Root HTML Font Size',
      tooltip: 'Base font size of your HTML element',
      value: formData.rootFont,
      min: 1,
      max: 100,
      allowRem: false,
    },
    {
      id: 'minWidth' as keyof FormData,
      label: '📱 Min Viewport Width',
      tooltip: 'Minimum viewport width for scaling',
      value: formData.minWidth,
      min: 100,
      max: 2000,
      allowRem: false,
    },
    {
      id: 'maxWidth' as keyof FormData,
      label: '🖥️ Max Viewport Width',
      tooltip: 'Maximum viewport width for scaling',
      value: formData.maxWidth,
      min: 500,
      max: 5000,
      allowRem: false,
    },
    {
      id: 'minFont' as keyof FormData,
      label: '🔤 Min Font Size',
      tooltip: 'Smallest font size at minimum viewport',
      value: formData.minFont,
      min: 8,
      max: 300,
      allowRem: true,
    },
    {
      id: 'maxFont' as keyof FormData,
      label: '🔠 Max Font Size',
      tooltip: 'Largest font size at maximum viewport',
      value: formData.maxFont,
      min: 10,
      max: 400,
      allowRem: true,
    },
  ];

  return (
    <div 
      className="min-h-screen p-5"
      style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      <div 
        className="max-w-4xl mx-auto rounded-3xl p-10 border"
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="text-center mb-10">
          <h1 
            className="text-5xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Clamp Calculator
          </h1>
          <p className="text-lg text-gray-600">
            Create responsive typography with CSS clamp() function
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {inputFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <label 
                htmlFor={field.id}
                className="text-sm font-semibold text-gray-700 flex items-center gap-2 cursor-help"
                title={field.tooltip}
              >
                {field.label} ({units[field.id]}):
              </label>
              <div className="flex gap-2">
                <input
                  id={field.id}
                  type="number"
                  value={field.value}
                  min={field.min}
                  max={field.max}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 p-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-300 hover:border-gray-300"
                  style={{
                    transform: 'translateY(0)',
                    boxShadow: '0 0 0 rgba(102, 126, 234, 0)'
                  }}
                  onFocus={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 5px 15px rgba(102, 126, 234, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 0 0 rgba(102, 126, 234, 0)';
                  }}
                />
                {field.allowRem && (
                  <div className="flex rounded-lg border-2 border-gray-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handleUnitChange(field.id as keyof UnitData, 'px')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        units[field.id] === 'px'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      px
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnitChange(field.id as keyof UnitData, 'rem')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        units[field.id] === 'rem'
                          ? 'bg-purple-500 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      rem
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={generateClamp}
          className="w-full py-4 px-8 text-white border-none rounded-xl text-lg font-semibold tracking-wider uppercase relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
          }}
        >
          Generate Clamp() Value
        </button>

        <div className="mt-8">
          <label className="text-lg font-semibold text-gray-700 mb-4 block">
            Generated CSS:
          </label>
          <div 
            className={`relative p-6 rounded-xl border-2 min-h-[80px] flex items-center font-mono text-lg transition-all duration-300 group ${
              hasError ? 'border-red-500' : result ? 'border-green-500' : 'border-gray-300'
            }`}
            style={{
              background: hasError 
                ? 'linear-gradient(135deg, #ffe8e8, #fff0f0)' 
                : result 
                  ? 'linear-gradient(135deg, #e8f5e8, #f0fff0)' 
                  : '#f8f9fa',
              color: hasError ? '#c53030' : result ? '#2d7738' : '#6b7280'
            }}
          >
            <span className="break-all pr-16">
              {result || "Your clamp() result will appear here. Fill in the values above and click generate!"}
            </span>
            {result && !hasError && (
              <button
                onClick={copyToClipboard}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded border-none"
              >
                {copyText}
              </button>
            )}
          </div>
        </div>

        <div 
          className="mt-10 p-6 rounded-xl border-l-4"
          style={{
            background: 'rgba(52, 152, 219, 0.1)',
            borderLeftColor: '#3498db'
          }}
        >
          <h3 className="text-lg font-semibold text-blue-600 mb-3">How it works:</h3>
          <p className="text-gray-700 leading-relaxed">
            The clamp() function takes three values: minimum, preferred (fluid), and maximum. 
            The preferred value uses viewport width (vw) units to create smooth scaling between your minimum and maximum breakpoints. 
            This ensures your typography is perfectly responsive across all screen sizes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClampGenerator;