"use client";

import {
  Box,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  SquareTerminal,
  Users,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";

// This is sample data.
const data = {
  teams: [
    {
      name: "طلاسیس",
      logo: GalleryVerticalEnd,
      plan: "ادمین",
    },
    // {
    //   name: "Acme Corp.",
    //   logo: AudioWaveform,
    //   plan: "Startup",
    // },
    // {
    //   name: "Evil Corp.",
    //   logo: Command,
    //   plan: "Free",
    // },
  ],
  navMain: [
    // {
    //   title: "لینک ها",
    //   url: "/dashboard",
    //   icon: Home,
    //   isActive: true,
    //   items: [
    //      // {
    //     //   title: "لیست",
    //     //   url: "/dashboard/products",
    //     // },
    //   ]
    // },
    {
      title: "محصول",
      url: "#",
      icon: Box,
      isActive: true,
      items: [
        // {
        //   title: "لیست",
        //   url: "/dashboard/products",
        // },
        // {
        //   title: "ایجاد",
        //   url: "/dashboard/products/create",
        // },
      ],
    },
    {
      title: "مجموعه‌ها",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "لیست",
          url: "/dashboard/bucket",
        },
        // {
        //   title: "ایجاد",
        //   url: "/dashboard/bucket/create",
        // }
      ],
    },
    {
      title: "تامیین کنندگان",
      url: "#",
      icon: Users,
      isActive: true,
      items: [
        // {
        //   title: "لیست",
        //   url: "/dashboard/product/create",
        // },
        // {
        //   title: "ایجاد",
        //   url: "/dashboard/product/create",
        // },
      ],
    },
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: Bot,
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const userData = {
    name: user?.name || "کاربر",
    email: user?.email || "user@example.com",
    avatar: "/avatars/default.jpg",
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
