import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import { Leaf } from "lucide-react";

export const Navbar = () => {

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex items-center justify-start gap-1" href="/">
            <Leaf className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-bold text-foreground">BlueCarbon</h1>
              <p className="text-xs text-content3-foreground">Conservation Platform</p>
            </div>
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="pl-4 sm:hidden basis-1" justify="end">
       
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>
    </HeroUINavbar>
  );
};


{/* <nav className="sticky top-0 z-50 border-b bg-content1/80 backdrop-blur-md border-divider">
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
      </nav> */}