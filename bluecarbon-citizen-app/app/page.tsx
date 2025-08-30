"use client";
import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Avatar,
  Badge,
  Progress,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  Spacer,
  Divider,
  Switch,
  Tabs,
  Tab
} from '@heroui/react';
import { Camera, MapPin, Upload, Award, Leaf, User, Home, Plus, TrendingUp } from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

const MangroveApp = () => {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Mock user ID - in real app, this would come from authentication
  const mockUserId = "k170zj8s8qg5v9k8q9a0m9f7vn71sr8t" as any; // Replace with actual user ID from auth

  // Convex queries and mutations
  const user = useQuery(api.users.getByEmail, { email: "rahul.sharma@example.com" });
  const recentUploads = useQuery(api.uploads.getRecent, user && user._id ? { userId: user._id, limit: 5 } : "skip");
  const createUpload = useMutation(api.uploads.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  // Use actual data or fallback to loading state
  const credits = user?.totalCredits || 0;
  const totalUploads = user?.totalUploads || 0;
  const monthlyUploads = user?.monthlyUploads || 0;
  const accuracyRate = user?.accuracyRate || 0;
  const communityRank = user?.communityRank || 0;

  const handleImageUpload = async () => {
    if (!user || !locationName.trim() || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress bar
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Step 1: get signed URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: upload file to Convex storage
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      if (!res.ok) throw new Error("File upload failed");
      const { storageId } = await res.json();

      // Step 3: save reference in Convex DB
      await createUpload({
        userId: user._id || "" as any,
        locationName,
        description: description || undefined,
        latitude: 19.0760,
        longitude: 72.8777,
        imageStorageId: storageId, // use returned storageId here
      });

      // Done
      setTimeout(() => {
        setIsUploading(false);
        setLocationName("");
        setDescription("");
        setSelectedFile(null);
        onOpen();
      }, 2000);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      clearInterval(interval);
    }
  };


  // Loading state
  if (user === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-8 h-8 mx-auto mb-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // User not found state
  if (user === null) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardBody className="p-8 text-center">
            <h2 className="mb-4 text-xl font-bold">User Not Found</h2>
            <p className="mb-4 text-content2-foreground">
              Please run the sample data mutation first to create a user account.
            </p>
            <Button color="primary">
              Create Sample Data
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Home Screen
  const HomeScreen = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6 bg-primary-50 dark:bg-primary-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatar || "/api/placeholder/40/40"}
              className="w-10 h-10"
            />
            <div>
              <p className="text-sm text-foreground">Welcome back,</p>
              <p className="font-semibold text-foreground">{user.name}</p>
            </div>
          </div>
          <Badge
            content={credits}
            color="success"
            variant="flat"
            className="text-xs"
          >
            <Chip
              startContent={<Award className="w-4 h-4" />}
              variant="flat"
              color="success"
            >
              Credits
            </Chip>
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-3">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-content1">
            <CardBody className="p-4">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-success" />
                <div>
                  <p className="text-xs text-content3-foreground">Total Uploads</p>
                  <p className="text-xl font-bold text-foreground">{totalUploads}</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-content1">
            <CardBody className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-content3-foreground">This Month</p>
                  <p className="text-xl font-bold text-foreground">{monthlyUploads}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <Spacer y={6} />

      {/* Quick Upload Button */}
      <div className="px-4">
        <Button
          onPress={() => setCurrentScreen('upload')}
          color="primary"
          size="lg"
          className="w-full text-lg font-semibold h-14"
          startContent={<Plus className="w-6 h-6" />}
        >
          Upload New Mangrove Photo
        </Button>
      </div>

      <Spacer y={6} />

      {/* Recent Uploads */}
      <div className="px-4">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Recent Uploads</h3>
        <div className="space-y-3">
          {recentUploads && recentUploads.length > 0 ? (
            recentUploads.map((upload) => (
              <ImageCard key={upload._id} upload={upload} />
            ))
          ) : (
            <Card className="shadow-sm bg-content1 rounded-xl">
              <CardBody className="p-10 space-y-3 text-center">
                <Camera className="w-12 h-12 mx-auto text-content3" />
                <p className="font-medium text-content2-foreground">No uploads yet</p>
                <p className="text-sm text-content3-foreground">
                  Start by uploading your first mangrove photo!
                </p>
                <Button
                  as="a"
                  href="/upload"
                  color="primary"
                  variant="solid"
                  className="mt-3 rounded-lg"
                >
                  Upload Now
                </Button>
              </CardBody>
            </Card>
          )}
        </div>

      </div>

      <Spacer y={8} />
    </div>
  );

  // Upload Screen
  const UploadScreen = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-6 bg-primary-50 dark:bg-primary-900/20">
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="flat"
            onPress={() => setCurrentScreen('home')}
            className="bg-content1"
          >
            ←
          </Button>
          <h1 className="text-xl font-bold text-foreground">Upload Mangrove</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Image Upload Area */}
        <Card className="bg-content1">
          <CardBody className="p-6">
            <div className="flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-content3 rounded-lg">
              {!isUploading ? (
                <>
                  <Camera className="w-12 h-12 mb-4 text-content3" />
                  <p className="mb-4 text-content3-foreground">Take or upload a mangrove photo</p>
                  <div className="flex gap-2">
                    <Button
                      color="primary"
                      variant="flat"
                      startContent={<Camera className="w-4 h-4" />}
                    >
                      Camera
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      id="fileInput"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    <Button
                      color="primary"
                      variant="flat"
                      startContent={<Upload className="w-4 h-4" />}
                      onPress={() => document.getElementById("fileInput")?.click()}
                      isDisabled={!locationName.trim()}
                    >
                      Gallery
                    </Button>
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <p className="mb-4 text-center text-foreground">Uploading photo...</p>
                  <Progress
                    size="sm"
                    value={uploadProgress}
                    color="success"
                    className="max-w-md mx-auto"
                  />
                  <p className="mt-2 text-xs text-center text-content3-foreground">{uploadProgress}% complete</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Location */}
        <Card className="bg-content1">
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-content3" />
              <div className="flex-1">
                <p className="text-sm text-content3-foreground">Current Location</p>
                <p className="font-medium text-foreground">Mumbai, Maharashtra</p>
              </div>
              <Switch size="sm" />
            </div>
          </CardBody>
        </Card>

        {/* Form Fields */}
        <div className="space-y-4">
          <Input
            label="Location Name"
            placeholder="e.g., Mangrove Creek, Mumbai"
            variant="bordered"
            value={locationName}
            onValueChange={setLocationName}
            startContent={<MapPin className="w-4 h-4 text-content3" />}
            isRequired
          />

          <Textarea
            label="Description"
            placeholder="Describe the mangrove condition, wildlife spotted, etc."
            variant="bordered"
            value={description}
            onValueChange={setDescription}
            minRows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          color="success"
          size="lg"
          className="w-full h-12 font-semibold"
          isDisabled={isUploading || !locationName.trim()}
          onPress={handleImageUpload}
        >
          {isUploading ? "Processing..." : "Submit for Review"}
        </Button>
      </div>
    </div>
  );

  // Profile Screen
  const ProfileScreen = () => (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 pt-12 pb-8 bg-gradient-to-r from-primary-50 to-success-50 dark:from-primary-900/20 dark:to-success-900/20">
        <div className="text-center">
          <Avatar
            src={user.avatar || "/api/placeholder/80/80"}
            className="w-20 h-20 mx-auto mb-4"
          />
          <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
          <p className="text-content3-foreground">Environmental Contributor</p>

          <div className="flex justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{credits}</p>
              <p className="text-xs text-content3-foreground">Total Credits</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalUploads}</p>
              <p className="text-xs text-content3-foreground">Uploads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{accuracyRate}%</p>
              <p className="text-xs text-content3-foreground">Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Achievement Badges */}
        <Card className="bg-content1">
          <CardBody className="p-4">
            <h3 className="mb-3 font-semibold text-foreground">Recent Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {user.achievements && user.achievements.length > 0 ? (
                user.achievements.map((achievement, index) => (
                  <Chip key={index} color="success" variant="flat">
                    {achievement}
                  </Chip>
                ))
              ) : (
                <>
                  <Badge content="New!" color="success" size="sm">
                    <Chip color="success" variant="flat">First Upload</Chip>
                  </Badge>
                  <Chip color="primary" variant="flat">Explorer</Chip>
                  <Chip color="warning" variant="flat">Contributor</Chip>
                </>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Stats */}
        <Card className="bg-content1">
          <CardBody className="p-4">
            <h3 className="mb-4 font-semibold text-foreground">Your Impact</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-content2-foreground">Mangroves Documented</span>
                <span className="font-semibold text-foreground">{totalUploads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content2-foreground">Monthly Uploads</span>
                <span className="font-semibold text-foreground">{monthlyUploads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content2-foreground">Community Rank</span>
                <span className="font-semibold text-foreground">#{communityRank || 'Unranked'}</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  const ImageCard = ({ upload }: { upload: any }) => {
    return (
      <Card key={upload._id} className="shadow-sm bg-content1 rounded-xl">
        <CardBody className="p-5">
          <div className="flex items-center gap-4">
            <Image
              src={upload.imageUrl ?? "/placeholder.png"}
              alt={upload.locationName ?? "Uploaded photo"}
              className="object-cover w-16 h-16 border rounded-lg border-content3"
            />
            <div className="flex-1">
              <p className="font-semibold text-foreground">{upload.locationName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Chip
                  size="sm"
                  color={
                    upload.status === "verified"
                      ? "success"
                      : upload.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                  variant="flat"
                >
                  {upload.status}
                </Chip>
                <p className="text-xs text-content3-foreground">
                  {upload.status === "verified"
                    ? `+${upload.creditsEarned} credits`
                    : `${upload.creditsEarned} credits (${upload.status})`}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>);

  }

  return (
    <div className="relative">
      {/* Screen Content */}
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'upload' && <UploadScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}

      {/* Bottom Navigation - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-content1 border-divider md:hidden">
        <div className="flex items-center justify-around py-2">
          <Button
            // isIconOnly
            variant={currentScreen === 'home' ? 'flat' : 'light'}
            color={currentScreen === 'home' ? 'primary' : 'default'}
            onPress={() => setCurrentScreen('home')}
            className="flex flex-col h-auto gap-1 py-2"
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            // isIconOnly
            variant={currentScreen === 'upload' ? 'flat' : 'light'}
            color={currentScreen === 'upload' ? 'primary' : 'default'}
            onPress={() => setCurrentScreen('upload')}
            className="flex flex-col h-auto gap-1 py-2"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs">Upload</span>
          </Button>

          <Button
            // isIconOnly
            variant={currentScreen === 'profile' ? 'flat' : 'light'}
            color={currentScreen === 'profile' ? 'primary' : 'default'}
            onPress={() => setCurrentScreen('profile')}
            className="flex flex-col h-auto gap-1 py-2"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="fixed hidden md:block top-4 left-4">
        <Card className="bg-content1">
          <CardBody className="p-2">
            <div className="flex gap-2">
              <Button
                variant={currentScreen === 'home' ? 'flat' : 'light'}
                color={currentScreen === 'home' ? 'primary' : 'default'}
                onPress={() => setCurrentScreen('home')}
                startContent={<Home className="w-4 h-4" />}
              >
                Home
              </Button>
              <Button
                variant={currentScreen === 'upload' ? 'flat' : 'light'}
                color={currentScreen === 'upload' ? 'primary' : 'default'}
                onPress={() => setCurrentScreen('upload')}
                startContent={<Plus className="w-4 h-4" />}
              >
                Upload
              </Button>
              <Button
                variant={currentScreen === 'profile' ? 'flat' : 'light'}
                color={currentScreen === 'profile' ? 'primary' : 'default'}
                onPress={() => setCurrentScreen('profile')}
                startContent={<User className="w-4 h-4" />}
              >
                Profile
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Success Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm" placement="center">
        <ModalContent>
          <ModalHeader className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/20">
                <Award className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-foreground">Upload Successful!</h3>
            </div>
          </ModalHeader>
          <ModalBody className="text-center">
            <p className="text-content2-foreground">
              Your mangrove photo has been submitted for review. You'll earn credits once it's verified!
            </p>
            <Chip color="success" variant="flat" size="lg">
              +50 Credits Pending
            </Chip>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onClose} className="w-full">
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Add bottom padding for mobile navigation */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
};

export default MangroveApp;