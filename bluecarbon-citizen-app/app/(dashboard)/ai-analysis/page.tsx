// File: app/(dashboard)/ai-analysis/page.tsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from "next/image";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Slider,
  Spinner,
  Chip,
  Divider,
  Progress,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Link
} from '@heroui/react';
import {
  Upload,
  Camera,
  Download,
  AlertCircle,
  CheckCircle,
  Brain,
  Zap,
  Eye,
  Settings,
  History,
  Info,
  RefreshCw,
  FileImage,
  Sparkles,
  Activity,
  Leaf
} from 'lucide-react';
import { flaskAPI } from '@/lib/api/flask-client';

// Enhanced type definitions
interface PredictionResult {
  success: boolean;
  detection_count: number;
  labels: string[];
  unique_classes: string[];
  annotated_image_url?: string;
  raw_predictions: any[];
  confidence_threshold: number;
  timestamp: string;
  processing_time?: number;
  model_version?: string;
  error?: string;
}

interface AnalysisSettings {
  confidence: number;
  model: string;
  returnAnnotated: boolean;
  enhanceImage: boolean;
}

interface AnalysisHistory {
  id: string;
  filename: string;
  timestamp: string;
  detections: number;
  confidence: number;
  status: 'success' | 'failed' | 'processing';
}

const AIAnalysisPage: React.FC = () => {
  // Core state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [results, setResults] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Enhanced settings
  const [settings, setSettings] = useState<AnalysisSettings>({
    confidence: 50,
    model: 'yolov8',
    returnAnnotated: true,
    enhanceImage: false
  });

  // History and modals
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([
    {
      id: '1',
      filename: 'mangrove_coastline.jpg',
      timestamp: '2 hours ago',
      detections: 15,
      confidence: 87,
      status: 'success'
    },
    {
      id: '2',
      filename: 'seagrass_bed.png',
      timestamp: '1 day ago',
      detections: 8,
      confidence: 92,
      status: 'success'
    },
    {
      id: '3',
      filename: 'coral_reef.jpg',
      timestamp: '2 days ago',
      detections: 23,
      confidence: 78,
      status: 'success'
    }
  ]);

  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onClose: onHistoryClose
  } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const ALLOWED_TYPES: string[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp'];
  const MAX_FILE_SIZE: number = 16 * 1024 * 1024; // 16MB

  const models = [
    { key: 'yolov8', label: 'YOLOv8 (Recommended)', description: 'Best for general detection' },
    { key: 'yolov8s', label: 'YOLOv8 Small', description: 'Faster processing' },
    { key: 'yolov8m', label: 'YOLOv8 Medium', description: 'Balanced accuracy/speed' },
    { key: 'custom', label: 'Marine Custom', description: 'Specialized for marine life' }
  ];

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileValidation(files[0]);
    }
  }, []);

  const handleFileValidation = (file: File): void => {
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileValidation(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const result = await flaskAPI.uploadImage(formData);
      console.log("AI Result:", result);

      // TODO: set state to display prediction result
      // setAnalysisResult(result);
      setResults(result);
      if (result.annotated_image_url) {
        setResultImage(`/api/flask-proxy${result.annotated_image_url}`);
      }


      
    } catch (err) {
      console.error("Upload failed", err);
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

  // const downloadResult = (): void => {
  //   if (resultImage && selectedFile) {
  //     const link = document.createElement('a');
  //     link.href = resultImage;
  //     link.download = `segmented_${selectedFile.name}`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   }
  // };

  return (
    <div className="min-h-full p-6 space-y-6 bg-gradient-to-br from-content1 to-content2/30">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 shadow-lg bg-gradient-to-br from-primary to-primary/80 rounded-2xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="mb-1 text-3xl font-bold text-gray-800">AI Analysis</h1>
            <p className="text-gray-600">Advanced image segmentation for marine ecosystems</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="flat"
            color="secondary"
            startContent={<History className="w-4 h-4" />}
            onPress={onHistoryOpen}
          >
            History
          </Button>
          <Button
            variant="flat"
            color="primary"
            startContent={<Settings className="w-4 h-4" />}
          >
            Settings
          </Button>
        </div>
      </div>

      {/* Main Analysis Interface */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Upload Section */}
        <div className="xl:col-span-2">
          <Card className="shadow-lg bg-content1">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-800">Upload & Analyze</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Model Selection */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  label="AI Model"
                  placeholder="Select model"
                  selectedKeys={[settings.model]}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setSettings(prev => ({ ...prev, model: selected }));
                  }}
                  disabledKeys={models.filter(model => model.key !== "yolov8").map(m => m.key)} // Disable non-recommended models
                  variant="flat"
                  startContent={<Sparkles className="w-4 h-4 text-primary" />}
                  classNames={{
                    trigger: "bg-content2/50"
                  }}
                >
                  {models.map((model) => (
                    <SelectItem key={model.key} description={model.description}>
                      {model.label}
                    </SelectItem>
                  ))}
                </Select>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Confidence Threshold
                    </label>
                    <Chip size="sm" variant="flat" color="primary">
                      {settings.confidence}%
                    </Chip>
                  </div>
                  <Slider
                    size="lg"
                    step={5}
                    minValue={10}
                    maxValue={95}
                    value={settings.confidence}
                    onChange={(value) => {
                      const confidenceValue = Array.isArray(value) ? value[0] : value;
                      setSettings(prev => ({ ...prev, confidence: confidenceValue }));
                    }}
                    className="w-full"
                    color="primary"
                    showTooltip={true}
                    classNames={{
                      track: "bg-content3",
                      filler: "bg-gradient-to-r from-primary to-secondary"
                    }}
                  />
                </div>
              </div>

              {/* File Drop Zone */}
              <div
                className={`
                  relative border-2 border-dashed rounded-2xl transition-all duration-300 overflow-hidden
                  ${dragActive ? 'border-primary bg-primary/5 scale-[1.02]' :
                    selectedFile ? 'border-success bg-success/5' :
                      'border-gray-300 hover:border-primary hover:bg-primary/5'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                />

                {previewUrl ? (
                  // Image Preview
                  <div className="relative group">
                    <div className="relative w-full h-64 overflow-hidden rounded-xl">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-contain bg-black/10"
                      />
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center gap-3 transition-opacity opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-sm rounded-xl">
                      <Button
                        color="danger"
                        variant="solid"
                        size="sm"
                        onPress={handleReset}
                        startContent={<RefreshCw className="w-4 h-4" />}
                      >
                        Change
                      </Button>
                    </div>

                    {/* File Info Overlay */}
                    <div className="absolute z-20 bottom-4 left-4 right-4">
                      <Card className="shadow-lg bg-black/70 backdrop-blur-md rounded-xl">
                        <CardBody className="p-3">
                          <div className="flex items-center justify-between text-sm text-white">
                            <span className="truncate">{selectedFile?.name}</span>
                            <span>{((selectedFile?.size || 0) / 1024 / 1024).toFixed(1)} MB</span>
                          </div>
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                ) : (
                  // Upload Zone
                  <label
                    htmlFor="file-input"
                    className="flex flex-col items-center justify-center h-64 p-8 text-center transition-all duration-300 border-2 border-gray-300 border-dashed cursor-pointer rounded-xl hover:border-primary hover:bg-primary/5"
                  >
                    <div
                      className={`
        p-5 rounded-2xl mb-4 transition-all duration-300 shadow-md
        ${dragActive ? "bg-primary text-white scale-110" : "bg-gray-100 text-primary"}
      `}
                    >
                      <FileImage className="w-12 h-12" />
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-gray-800">
                      {dragActive ? "Drop your image here" : "Upload Marine Image"}
                    </h3>
                    <p className="mb-4 text-gray-600">
                      Drag & drop or click to select an image for AI analysis
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>• JPEG, PNG, GIF, BMP</span>
                      <span>• Max 16MB</span>
                      <span>• Marine ecosystems optimized</span>
                    </div>
                  </label>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  color="primary"
                  size="lg"
                  className="flex-1 font-medium shadow-lg bg-gradient-to-r from-primary to-secondary"
                  onPress={handleUpload}
                  disabled={!selectedFile || isProcessing}
                  isLoading={isProcessing}
                  startContent={
                    <Brain className="w-5 h-5" />
                  }
                >
                  {isProcessing ? 'Analyzing...' : 'Start AI Analysis'}
                </Button>

                <Button
                  variant="flat"
                  size="lg"
                  onPress={handleReset}
                  disabled={isProcessing}
                  className="flex-1"
                  startContent={<RefreshCw className="w-4 h-4" />}
                >
                  Reset
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          {/* Model Info */}
          <Card className="shadow-lg bg-gradient-to-br from-content1 to-content2">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold text-gray-800">Model Status</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Model</span>
                <Chip size="sm" color="primary" variant="solid">
                  {models.find(m => m.key === settings.model)?.label}
                </Chip>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Model Health</span>
                <Chip size="sm" color="success" variant="flat">
                  Optimal
                </Chip>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Processing</span>
                <span className="text-sm font-medium">2.3s</span>
              </div>

              <Divider />

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>GPU Usage</span>
                  <span>67%</span>
                </div>
                <Progress value={67} size="sm" color="warning" />
              </div>
            </CardBody>
          </Card>

          {/* Quick Stats */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-success" />
                <h3 className="text-lg font-semibold text-gray-800">Today's Stats</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 text-center rounded-lg bg-content2">
                  <div className="text-xl font-bold text-primary">12</div>
                  <div className="text-xs text-gray-600">Analyses</div>
                </div>
                <div className="p-3 text-center rounded-lg bg-content2">
                  <div className="text-xl font-bold text-secondary">187</div>
                  <div className="text-xs text-gray-600">Detections</div>
                </div>
              </div>

              <div className="p-3 text-center rounded-lg bg-gradient-to-r from-success/10 to-primary/10">
                <div className="text-lg font-bold text-success">96.2%</div>
                <div className="text-xs text-gray-600">Avg Confidence</div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Processing Status */}
      {isProcessing && (
        <Card className="shadow-lg border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Spinner size="lg" color="primary" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-gray-800">AI Analysis in Progress</h3>
                <p className="mb-3 text-sm text-gray-600">
                  Processing your image with {models.find(m => m.key === settings.model)?.label} model...
                </p>
                <Progress
                  size="md"
                  isIndeterminate
                  color="primary"
                  className="w-full"
                  classNames={{
                    track: "bg-content3",
                    indicator: "bg-gradient-to-r from-primary to-secondary"
                  }}
                />
              </div>
              <div className="text-right">
                <Chip size="sm" color="primary" variant="flat">
                  {settings.confidence}% confidence
                </Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="shadow-lg border-danger/20 bg-danger/5">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="flex-shrink-0 w-5 h-5 text-danger" />
              <div className="flex-1">
                <h4 className="mb-1 font-medium text-danger">Analysis Failed</h4>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Results Summary */}
          <Card className="border shadow-lg bg-gradient-to-r from-success/10 to-primary/10 border-success/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <h3 className="text-xl font-semibold text-gray-800">Analysis Complete</h3>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
                <div className="p-4 text-center shadow-sm bg-content1 rounded-xl">
                  <div className="mb-1 text-2xl font-bold text-primary">
                    {results.detection_count}
                  </div>
                  <div className="text-sm text-gray-600">Total Detections</div>
                </div>

                <div className="p-4 text-center shadow-sm bg-content1 rounded-xl">
                  <div className="mb-1 text-2xl font-bold text-secondary">
                    {results.unique_classes?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Unique Classes</div>
                </div>

                <div className="p-4 text-center shadow-sm bg-content1 rounded-xl">
                  <div className="mb-1 text-2xl font-bold text-warning">
                    {settings.confidence}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence Used</div>
                </div>

                <div className="p-4 text-center shadow-sm bg-content1 rounded-xl">
                  <div className="mb-1 text-2xl font-bold text-success">
                    {results.processing_time || '2.1'}s
                  </div>
                  <div className="text-sm text-gray-600">Processing Time</div>
                </div>
              </div>

              {/* Detected Classes */}
              {results.unique_classes && results.unique_classes.length > 0 && (
                <div>
                  <h4 className="mb-3 font-medium text-gray-700">Detected Marine Life & Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {results.unique_classes.map((className: string, index: number) => (
                      <Chip
                        key={index}
                        color="primary"
                        variant="flat"
                        size="lg"
                        startContent={<Leaf className="w-3 h-3" />}
                      >
                        {className}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Image Comparison */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between w-full">
                <h3 className="text-xl font-semibold text-gray-800">Analysis Results</h3>
                <Button
                  // showAnchorIcon
                  target='_blank'
                  as={Link}
                  color="secondary"
                  variant="flat"
                  href={resultImage || '#'}
                  startContent={<Download className="w-4 h-4" />}
                >
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <Tabs aria-label="Image comparison" color="primary" variant="underlined" size="lg">
                <Tab key="comparison" title="Side by Side">
                  <div className="grid grid-cols-1 gap-6 mt-4 lg:grid-cols-2">
                    {/* Original Image */}
                    {previewUrl && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Camera className="w-4 h-4 text-gray-600" />
                          <h4 className="font-medium text-gray-700">Original Image</h4>
                        </div>
                        <Card className="shadow-md">
                          <CardBody className="p-0 ">
                            <Image
                              src={previewUrl}
                              width={600}
                              height={400}
                              alt="Original uploaded image"
                              className="w-full h-auto rounded-lg"
                            />
                          </CardBody>
                        </Card>
                      </div>
                    )}

                    {/* Segmented Result */}
                    {resultImage && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <h4 className="font-medium text-gray-700">AI Segmentation</h4>
                          <Chip size="sm" color="success" variant="flat">
                            Enhanced
                          </Chip>
                        </div>
                        <Card className="shadow-md">
                          <CardBody className="p-0">
                            <Image
                              src={resultImage}
                              alt="AI segmented result"
                              width={600}
                              height={400}
                              className="w-full h-auto rounded-lg"
                            />
                          </CardBody>
                        </Card>
                      </div>
                    )}
                  </div>
                </Tab>

                <Tab key="overlay" title="Overlay View">
                  <div className="mt-4">
                    <p className="py-8 text-center text-gray-600">
                      Interactive overlay view coming soon...
                    </p>
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>
      )}

      {/* History Modal */}
      <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <span>Analysis History</span>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-3">
              {analysisHistory.map((item) => (
                <Card key={item.id} className="bg-content2">
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="mb-1 font-medium text-gray-800">{item.filename}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{item.timestamp}</span>
                          <span>{item.detections} detections</span>
                          <span>{item.confidence}% confidence</span>
                        </div>
                      </div>
                      <Chip
                        size="sm"
                        color={item.status === 'success' ? 'success' : 'danger'}
                        variant="flat"
                      >
                        {item.status}
                      </Chip>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" variant="flat" onPress={onHistoryClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AIAnalysisPage;