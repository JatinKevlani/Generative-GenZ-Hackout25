'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Slider,
  Image,
  Spinner,
  Chip,
  Divider,
  Progress
} from '@heroui/react';
import { Upload, Camera, Download, AlertCircle, CheckCircle } from 'lucide-react';

// Type definitions
interface PredictionResult {
  success: boolean;
  detection_count: number;
  labels: string[];
  unique_classes: string[];
  annotated_image_url?: string;
  raw_predictions: any[];
  confidence_threshold: number;
  timestamp: string;
  error?: string;
}

interface ComponentState {
  selectedFile: File | null;
  previewUrl: string | null;
  resultImage: string | null;
  confidence: number;
  isProcessing: boolean;
  results: PredictionResult | null;
  error: string | null;
}

const ImageSegmentationPage: React.FC = () => {
  // State with proper typing
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(50);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const ALLOWED_TYPES: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
  const MAX_FILE_SIZE: number = 16 * 1024 * 1024; // 16MB
  const API_BASE_URL: string = process.env.NODE_ENV === 'production'
    ? 'https://your-api-domain.com'
    : 'http://localhost:5000';

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, BMP)');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 16MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResults(null);
    setResultImage(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async (): Promise<void> => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Check if API is reachable first
      const healthCheck = await fetch(`${API_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!healthCheck.ok) {
        throw new Error('API server is not reachable. Please ensure Flask API is running on port 5000.');
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confidence', confidence.toString());
      formData.append('return_annotated', 'true');

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: PredictionResult = await response.json();

      if (result.success) {
        setResults(result);
        if (result.annotated_image_url) {
          setResultImage(`${API_BASE_URL}${result.annotated_image_url}`);
        }
      } else {
        throw new Error(result.error || 'Processing failed');
      }

    } catch (err) {
      let errorMessage = 'Unknown error occurred';

      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = 'Cannot connect to API server. Please ensure Flask API is running on http://localhost:5000';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(`Upload failed: ${errorMessage}`);
      console.error('Upload error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = (): void => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultImage(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadResult = (): void => {
    if (resultImage && selectedFile) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `segmented_${selectedFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleConfidenceChange = (value: number | number[]): void => {
    const confidenceValue = Array.isArray(value) ? value[0] : value;
    setConfidence(confidenceValue);
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">
            Image Segmentation AI
          </h1>
          <p className="text-gray-600">
            Upload an image to detect and segment objects with AI
          </p>
        </div>

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Upload Image</h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* File Input */}
            <div className="flex flex-col items-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className={`w-full max-w-md h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all
                  ${selectedFile ? 'border-success bg-success/5' : 'border-gray-300 hover:border-primary bg-gray-50 hover:bg-gray-100'}
                  flex flex-col items-center justify-center gap-2`}
              >
                <Camera className="w-8 h-8 text-gray-400" />
                <span className="text-center text-gray-600">
                  {selectedFile ? selectedFile.name : 'Click to select image'}
                </span>
                <span className="text-sm text-gray-400">
                  Supports JPEG, PNG, GIF, BMP (Max 16MB)
                </span>
              </label>
            </div>

            {/* Confidence Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Confidence Threshold
                </label>
                <Chip size="sm" variant="flat" color="primary">
                  {confidence}%
                </Chip>
              </div>
              <Slider
                size="md"
                step={5}
                minValue={10}
                maxValue={95}
                value={confidence}
                onChange={handleConfidenceChange}
                className="w-full"
                color="primary"
                showTooltip={true}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                color="primary"
                size="lg"
                className="flex-1 py-4"   
                onPress={handleUpload}
                disabled={!selectedFile || isProcessing}
                isLoading={isProcessing}
                startContent={
                  isProcessing ? <Spinner size="sm" color="white" /> : <Upload className="w-4 h-4" />
                }
              >
                {isProcessing ? 'Processing...' : 'Analyze Image'}
              </Button>

              <Button
                variant="flat"
                size="lg"
                isLoading={isProcessing}
                onPress={handleReset}
                disabled={isProcessing}
                className="flex-1 py-4"   
              >
                Reset
              </Button>
            </div>

          </CardBody>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-danger">
            <CardBody>
              <div className="flex items-center gap-2 text-danger">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Spinner size="sm" color="primary" />
                  <span className="text-gray-700">Processing your image...</span>
                </div>
                <Progress
                  size="sm"
                  isIndeterminate
                  aria-label="Processing..."
                  className="w-full"
                  color="primary"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Results Section */}
        {results && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Original Image */}
            {previewUrl && (
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Original Image</h3>
                </CardHeader>
                <CardBody>
                  <Image
                    src={previewUrl}
                    alt="Original uploaded image"
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </CardBody>
              </Card>
            )}

            {/* Segmented Result */}
            {resultImage && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <h3 className="text-lg font-semibold">Segmented Result</h3>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={downloadResult}
                    startContent={<Download className="w-4 h-4" />}
                  >
                    Download
                  </Button>
                </CardHeader>
                <CardBody>
                  <Image
                    src={resultImage}
                    alt="Segmented image result"
                    className="w-full h-auto rounded-lg"
                    loading="lazy"
                  />
                </CardBody>
              </Card>
            )}
          </div>
        )}

        {/* Results Summary */}
        {results && (
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold">Detection Results</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {results.detection_count}
                  </div>
                  <div className="text-sm text-gray-600">Total Detections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {results.unique_classes?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Unique Classes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">
                    {confidence}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence Used</div>
                </div>
              </div>

              {results.unique_classes && results.unique_classes.length > 0 && (
                <>
                  <Divider className="my-4" />
                  <div>
                    <h4 className="mb-3 font-medium text-gray-700">Detected Classes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {results.unique_classes.map((className: string, index: number) => (
                        <Chip
                          key={index}
                          color="primary"
                          variant="flat"
                          size="md"
                        >
                          {className}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImageSegmentationPage;