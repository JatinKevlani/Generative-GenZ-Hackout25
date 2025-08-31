// File: src/app/page.tsx
'use client';

import React from 'react';
import {
  Card,
  CardBody,
  Button,
  Image,
  Progress,
  Chip,
  Avatar,
  Spacer
} from '@heroui/react';
import {
  Leaf,
  Camera,
  Cpu,
  Wifi,
  Users,
  Award,
  TrendingUp,
  Shield,
  Activity,
  ChevronRight,
  Upload,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

const LandingPage = () => {
  const stats = [
    { label: 'Mangroves Monitored', value: '2,847', icon: Leaf, color: 'success' },
    { label: 'AI Analyses', value: '15,203', icon: Cpu, color: 'primary' },
    { label: 'Active Sensors', value: '24', icon: Wifi, color: 'secondary' },
    { label: 'Community Members', value: '1,156', icon: Users, color: 'warning' }
  ];

  const features = [
    {
      title: 'Citizen Science Hub',
      description: 'Upload mangrove photos and contribute to conservation data with gamified rewards.',
      icon: Camera,
      color: 'bg-primary',
      href: '/dashboard/citizen-reports',
      demo: 'Upload & Earn Points'
    },
    {
      title: 'AI-Powered Analysis',
      description: 'Advanced computer vision to analyze mangrove health and detect environmental changes.',
      icon: Cpu,
      color: 'bg-secondary',
      href: '/dashboard/ai-analysis',
      demo: 'Analyze Images'
    },
    {
      title: 'IoT Monitoring Network',
      description: 'Real-time sensor data tracking water quality, salinity, and environmental conditions.',
      icon: Activity,
      color: 'bg-warning',
      href: '/dashboard/iot-monitoring',
      demo: 'Live Sensor Data'
    },
    {
      title: 'Community Engagement',
      description: 'Leaderboards, achievements, and collaborative conservation efforts.',
      icon: Users,
      color: 'bg-success',
      href: '/dashboard/community',
      demo: 'Join Community'
    }
  ];

  const recentActivity = [
    {
      user: 'Sarah Chen',
      action: 'uploaded mangrove photos from Mumbai coastline',
      time: '2 minutes ago',
      points: '+25 points',
      avatar: '/api/placeholder/32/32'
    },
    {
      user: 'AI System',
      action: 'analyzed 15 new images - 12 healthy, 3 degraded',
      time: '5 minutes ago',
      points: 'Auto-verified',
      avatar: null,
      isSystem: true
    },
    {
      user: 'Sensor Node #07',
      action: 'reported pH level change in Goa mangrove site',
      time: '8 minutes ago',
      points: 'Alert sent',
      avatar: null,
      isSystem: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-content1 via-primary-50 to-secondary-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-content1/80 backdrop-blur-md border-divider">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                <Leaf className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">BlueCarbon</h1>
                <p className="text-xs text-content3-foreground">Conservation Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                as={Link}
                href="/login"
                variant="bordered"
                size="sm"
              >
                Login
              </Button>
              <Button
                as={Link}
                href="/dashboard"
                color="primary"
                size="sm"
                endContent={<ChevronRight className="w-4 h-4" />}
              >
                Dashboard
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-primary/10 border-primary/20">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Protecting Blue Carbon Ecosystems</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold sm:text-6xl text-foreground">
              <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
                Community-Powered
              </span>
              <br />
              Mangrove Conservation
            </h1>
            
            <p className="max-w-3xl mx-auto mb-8 text-xl text-content2-foreground">
              Harness the power of citizen science, AI analysis, and IoT monitoring to protect 
              and restore critical mangrove ecosystems. Join thousands making a real impact.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                as={Link}
                href="/dashboard/citizen-reports/upload"
                color="primary"
                size="lg"
                className="font-semibold"
                startContent={<Upload className="w-5 h-5" />}
              >
                Start Contributing
              </Button>
              <Button
                as={Link}
                href="/dashboard"
                variant="bordered"
                size="lg"
                className="font-semibold"
                startContent={<BarChart3 className="w-5 h-5" />}
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-content1/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm bg-content1">
                <CardBody className="p-6 text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-content3-foreground">{stat.label}</div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl text-foreground">
              Integrated Conservation Platform
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-content2-foreground">
              Everything you need to monitor, analyze, and protect mangrove ecosystems 
              in one unified platform.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="transition-all duration-300 border-0 shadow-lg cursor-pointer bg-content1 hover:shadow-xl group"
                isPressable
                as={Link}
                href={feature.href}
              >
                <CardBody className="p-8">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center text-white flex-shrink-0`}>
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-semibold transition-colors text-foreground group-hover:text-primary">
                        {feature.title}
                      </h3>
                      <p className="mb-4 text-content2-foreground">
                        {feature.description}
                      </p>
                      <Chip 
                        color="primary" 
                        variant="flat" 
                        size="sm"
                        endContent={<ChevronRight className="w-3 h-3" />}
                      >
                        {feature.demo}
                      </Chip>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Activity Feed */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-content1/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <h2 className="text-2xl font-bold text-foreground">Live Platform Activity</h2>
            </div>
            <p className="text-content2-foreground">
              Real-time updates from our conservation community
            </p>
          </div>

          <Card className="border-0 shadow-lg bg-content1">
            <CardBody className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg bg-content2/50 border-content3/50">
                    <Avatar
                      src={activity.avatar || undefined}
                      name={activity.user}
                      size="sm"
                      className={activity.isSystem ? "bg-content3" : "bg-primary"}
                      fallback={
                        activity.isSystem ? (
                          <Cpu className="w-4 h-4 text-content3-foreground" />
                        ) : (
                          <Users className="w-4 h-4 text-primary-foreground" />
                        )
                      }
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{activity.user}</span>
                        <span className="text-sm text-content3-foreground">{activity.action}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-content3-foreground">{activity.time}</span>
                        <Chip 
                          size="sm" 
                          variant="flat" 
                          color={activity.isSystem ? "default" : "success"}
                        >
                          {activity.points}
                        </Chip>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-primary to-secondary">
            <CardBody className="p-12">
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
                Ready to Make an Impact?
              </h2>
              <p className="max-w-2xl mx-auto mb-8 text-xl text-primary-foreground/90">
                Join our community of conservation heroes and start protecting mangrove ecosystems today.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  as={Link}
                  href="/signup"
                  color="secondary"
                  size="lg"
                  className="font-semibold bg-white text-primary hover:bg-gray-50"
                  startContent={<Users className="w-5 h-5" />}
                >
                  Join Community
                </Button>
                <Button
                  as={Link}
                  href="/dashboard"
                  variant="bordered"
                  size="lg"
                  className="font-semibold text-white border-white hover:bg-white/10"
                  startContent={<TrendingUp className="w-5 h-5" />}
                >
                  Explore Platform
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-12 border-t bg-content1 border-divider">
        <div className="mx-auto text-center max-w-7xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-lg font-semibold text-foreground">BlueCarbon Platform</span>
          </div>
          <p className="text-content3-foreground">
            Empowering communities to protect blue carbon ecosystems through technology and collaboration.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;