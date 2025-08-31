"use client";

import { Avatar } from "@heroui/react";
import { Home, FileText, Brain, Wifi, Users, BookOpen } from "lucide-react";
import { Chip } from "@heroui/chip";
export default function Sidebar() {
  return (
    <aside className="flex flex-col w-64 h-screen border-r bg-content1/80 backdrop-blur-md border-divider">
      {/* User Profile */}
      <div className="flex items-center gap-3 p-4 border-b">
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">John Doe</span>
          <span className="text-xs text-muted-foreground">Citizen Scientist</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-2">
        <NavItem icon={<Home className="w-5 h-5" />} label="Dashboard" desc="Overview & statistics" />
        <NavItem icon={<FileText className="w-5 h-5" />} label="Citizen Reports" desc="Upload & manage reports" />
        <NavItem icon={<Brain className="w-5 h-5" />} label="AI Analysis" desc="Segmentation & insights" />
        <NavItem
          icon={<Wifi className="w-5 h-5" />}
          label="IoT Monitoring"
          desc="Real-time sensor data"
          badge={<Chip variant="flat" className="ml-auto">3</Chip>}
        />
        <NavItem icon={<Users className="w-5 h-5" />} label="Community" desc="Leaderboard & achievements" />
        <NavItem icon={<BookOpen className="w-5 h-5" />} label="Education" desc="Learn about blue carbon" />
      </nav>
    </aside>
  );
}

function NavItem({ icon, label, desc, badge }: { icon: React.ReactNode; label: string; desc: string; badge?: React.ReactNode }) {
  return (
    <button className="flex flex-col items-start w-full gap-1 p-3 text-left transition rounded-xl hover:bg-accent">
      <div className="flex items-center w-full gap-2">
        {icon}
        <span className="font-medium">{label}</span>
        {badge}
      </div>
      <span className="text-xs text-muted-foreground">{desc}</span>
    </button>
  );
}
