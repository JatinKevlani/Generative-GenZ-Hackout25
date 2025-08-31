// File: app/(dashboard)/dashboard/layout.tsx
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Badge,
  Divider,
  Chip
} from '@heroui/react';
import {
  Menu,
  X,
  Home,
  Upload,
  Brain,
  Wifi,
  Users,
  GraduationCap,
  Settings,
  Bell,
  LogOut,
  User,
  Waves,
  Activity,
  Shield,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeSwitch } from '@/components/theme-switch';
import { User as HeroUIUser } from '@heroui/react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  description?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const navigationItems: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="w-5 h-5" />,
      description: 'Overview and statistics'
    },
    {
      key: 'citizen-reports',
      label: 'Citizen Reports',
      href: '/citizen-reports',
      icon: <Upload className="w-5 h-5" />,
      description: 'Upload and manage reports'
    },
    {
      key: 'ai-analysis',
      label: 'AI Analysis',
      href: '/ai-analysis',
      icon: <Brain className="w-5 h-5" />,
      description: 'Image segmentation & analysis'
    },
    {
      key: 'iot-monitoring',
      label: 'IoT Monitoring',
      href: '/iot-monitoring',
      icon: <Wifi className="w-5 h-5" />,
      badge: 3,
      description: 'Real-time sensor data'
    },
    {
      key: 'community',
      label: 'Community',
      href: '/community',
      icon: <Users className="w-5 h-5" />,
      description: 'Leaderboard & achievements'
    },
    {
      key: 'education',
      label: 'Education',
      href: '/education',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Learn about blue carbon'
    }
  ];

  const isActiveRoute = (href: string): boolean => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen bg-content1">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50 w-72 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          bg-content2 border-r border-divider
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-divider">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Blue Carbon</h2>
                <p className="text-xs text-gray-600">Conservation Platform</p>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-divider">
            <Dropdown placement="bottom-start">
              <DropdownTrigger>
                <HeroUIUser
                  avatarProps={{
                    src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
                  }}
                  description="Product Designer"
                  name="Jane Doe"
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu">
                <DropdownItem key="profile" startContent={<User className="w-4 h-4" />}>
                  Profile
                </DropdownItem>
                <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>
                  Settings
                </DropdownItem>
                <DropdownItem key="logout" color="danger" startContent={<LogOut className="w-4 h-4" />}>
                  Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => {
              const isActive = isActiveRoute(item.href);
              return (
                <Link key={item.key} href={item.href}>
                  <div
                    className={`
            group relative flex items-center gap-3 px-3 py-3 rounded-lg 
            transition-all duration-200 cursor-pointer
            ${isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }
          `}
                  >
                    {/* Icon with badge */}
                    <div className="relative flex-shrink-0">
                      {React.cloneElement(item.icon as React.ReactElement, {
                        className: `w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-primary'
                          }`
                      })}
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-gray-900'
                        }`}>
                        {item.label}
                      </div>
                      <div className={`text-xs truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-600'
                        }`}>
                        {item.description}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 w-1 bg-white rounded-r-full top-2 bottom-2" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>


          {/* Status Footer */}
          <div className="p-4 border-t border-divider">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">System Status</span>
                <Chip size="sm" color="success" variant="flat">
                  Online
                </Chip>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>API</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span>Connected</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>IoT Sensors</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                  <span>3 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top Navigation Bar */}
        <header className="flex items-center justify-between p-4 border-b bg-content2 border-divider">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="light"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                {navigationItems.find(item => isActiveRoute(item.href))?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">
                {navigationItems.find(item => isActiveRoute(item.href))?.description || 'Welcome to Blue Carbon Platform'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button isIconOnly variant="light" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge
                    content="3"
                    color="danger"
                    size="sm"
                    placement="top-right"
                    className="absolute -top-1 -right-1"
                  >
                    <div></div>
                  </Badge>
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Notifications">
                <DropdownItem key="alert1">
                  <div className="flex flex-col">
                    <span className="font-medium">IoT Alert</span>
                    <span className="text-xs text-gray-600">Sensor offline in Zone A</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="alert2">
                  <div className="flex flex-col">
                    <span className="font-medium">New Report</span>
                    <span className="text-xs text-gray-600">Citizen uploaded mangrove data</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="alert3">
                  <div className="flex flex-col">
                    <span className="font-medium">Achievement</span>
                    <span className="text-xs text-gray-600">You earned a new badge!</span>
                  </div>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>

            <ThemeSwitch />
            {/* Quick Stats */}
            <div className="items-center hidden gap-4 sm:flex">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-success" />
                <span className="text-sm text-gray-600">12 Active</span>
              </div>
              <Divider orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Waves className="w-4 h-4 text-primary" />
                <span className="text-sm text-gray-600">850 Reports</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-content1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;