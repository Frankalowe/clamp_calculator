import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  rootFont: number;
  minWidth: number;
  maxWidth: number;
  minFont: number;
  maxFont: number;
}

const ClampGenerator = () => {
  const [formData, setFormData] = useState<FormData>({
    rootFont: 16,
    minWidth: 380,
    maxWidth: 1600,
    minFont: 16,
    maxFont: 80,
  });
  
  const [result, setResult] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof FormData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
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
    
    if (minFont >= maxFont) {
      setResult("⚠️ Maximum font size must be greater than minimum font size.");
      setHasError(true);
      return;
    }
    
    // Calculate clamp values
    const remMin = minFont / rootFont;
    const remMax = maxFont / rootFont;
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
      toast({
        title: "Copied!",
        description: "Clamp value copied to clipboard",
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = result;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Copied!",
        description: "Clamp value copied to clipboard",
      });
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
      id: 'rootFont',
      label: '📏 Root HTML Font Size (px):',
      tooltip: 'Base font size of your HTML element',
      value: formData.rootFont,
      min: 1,
      max: 100,
    },
    {
      id: 'minWidth',
      label: '📱 Min Viewport Width (px):',
      tooltip: 'Minimum viewport width for scaling',
      value: formData.minWidth,
      min: 100,
      max: 2000,
    },
    {
      id: 'maxWidth',
      label: '🖥️ Max Viewport Width (px):',
      tooltip: 'Maximum viewport width for scaling',
      value: formData.maxWidth,
      min: 500,
      max: 5000,
    },
    {
      id: 'minFont',
      label: '🔤 Min Font Size (px):',
      tooltip: 'Smallest font size at minimum viewport',
      value: formData.minFont,
      min: 8,
      max: 200,
    },
    {
      id: 'maxFont',
      label: '🔠 Max Font Size (px):',
      tooltip: 'Largest font size at maximum viewport',
      value: formData.maxFont,
      min: 10,
      max: 300,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-primary p-5">
      <div className="max-w-4xl mx-auto bg-glass backdrop-blur-xl rounded-3xl p-10 shadow-glass border border-glass">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-button bg-clip-text text-transparent">
            Clamp() Generator
          </h1>
          <p className="text-lg text-muted-foreground">
            Create responsive typography with CSS clamp() function
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {inputFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label 
                htmlFor={field.id}
                className="text-sm font-semibold text-foreground flex items-center gap-2 cursor-help"
                title={field.tooltip}
              >
                {field.label}
              </Label>
              <Input
                id={field.id}
                type="number"
                value={field.value}
                min={field.min}
                max={field.max}
                onChange={(e) => handleInputChange(field.id as keyof FormData, e.target.value)}
                onKeyPress={handleKeyPress}
                className="transition-all duration-300 hover:border-primary focus:shadow-focus focus:-translate-y-0.5"
              />
            </div>
          ))}
        </div>

        <Button
          onClick={generateClamp}
          className="w-full py-4 px-8 bg-gradient-button hover:shadow-hover hover:-translate-y-1 transition-all duration-300 text-lg font-semibold tracking-wider uppercase relative overflow-hidden group"
        >
          <span className="relative z-10">Generate Clamp() Value</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        </Button>

        <div className="mt-8">
          <Label className="text-lg font-semibold text-foreground mb-4 block">
            Generated CSS:
          </Label>
          <div 
            className={`relative p-6 rounded-xl border-2 min-h-[80px] flex items-center font-mono text-lg transition-all duration-300 ${
              hasError 
                ? 'bg-gradient-error border-error text-error' 
                : result 
                  ? 'bg-gradient-success border-success text-success group hover:scale-[1.01]' 
                  : 'bg-muted border-border text-muted-foreground'
            }`}
          >
            <span className="break-all pr-16">
              {result || "Your clamp() result will appear here. Fill in the values above and click generate!"}
            </span>
            {result && !hasError && (
              <Button
                onClick={copyToClipboard}
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-success hover:bg-success/90 text-white border-none"
              >
                Copy
              </Button>
            )}
          </div>
        </div>

        <div className="mt-10 p-6 bg-glass-info rounded-xl border-l-4 border-info">
          <h3 className="text-lg font-semibold text-info mb-3">How it works:</h3>
          <p className="text-foreground/80 leading-relaxed">
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