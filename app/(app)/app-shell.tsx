"use client";

import { Avatar } from "@/components/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/components/dropdown";
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from "@/components/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from "@/components/sidebar";
import { SidebarLayout } from "@/components/sidebar-layout";
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/16/solid";
import {
  Cog6ToothIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
} from "@heroicons/react/20/solid";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function iconSlot(className?: string) {
  return { "data-slot": "icon" as const, className };
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const dashboardCurrent = pathname === "/dashboard";
  const decksCurrent = pathname.startsWith("/decks");
  const pricingCurrent = pathname === "/pricing";
  const contactCurrent = pathname === "/contact";

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem href="/decks" aria-label="Search decks">
              <MagnifyingGlassIcon {...iconSlot()} />
            </NavbarItem>
            <NavbarItem href="/dashboard" aria-label="Dashboard home">
              <HomeIcon {...iconSlot()} />
            </NavbarItem>
            <Dropdown>
              <DropdownButton as={NavbarItem} aria-label="Account menu">
                <Avatar initials="G" alt="Ginger" square className="size-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="bottom end">
                <DropdownItem href="/dashboard">
                  <UserIcon {...iconSlot()} />
                  <DropdownLabel>Dashboard</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/decks">
                  <Square2StackIcon {...iconSlot()} />
                  <DropdownLabel>Decks</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/pricing">
                  <TicketIcon {...iconSlot()} />
                  <DropdownLabel>Pricing</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/contact">
                  <MegaphoneIcon {...iconSlot()} />
                  <DropdownLabel>Contact</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/">
                  <ArrowRightStartOnRectangleIcon {...iconSlot()} />
                  <DropdownLabel>Back to marketing site</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem} className="lg:mb-2.5">
                <Avatar
                  initials="G"
                  alt="Ginger"
                  className="size-8 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                />
                <SidebarLabel>Ginger</SidebarLabel>
                <ChevronDownIcon {...iconSlot()} />
              </DropdownButton>
              <DropdownMenu className="min-w-80 lg:min-w-64" anchor="bottom start">
                <DropdownItem href="/dashboard">
                  <HomeIcon {...iconSlot()} />
                  <DropdownLabel>Dashboard</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/decks">
                  <Square2StackIcon {...iconSlot()} />
                  <DropdownLabel>Decks</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/decks">
                  <PlusIcon {...iconSlot()} />
                  <DropdownLabel>New deck (soon)</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/">
                  <SparklesIcon {...iconSlot()} />
                  <DropdownLabel>Marketing home</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <SidebarSection className="max-lg:hidden">
              <SidebarItem href="/decks" current={decksCurrent}>
                <MagnifyingGlassIcon {...iconSlot()} />
                <SidebarLabel>Search decks</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/contact" current={contactCurrent}>
                <InboxIcon {...iconSlot()} />
                <SidebarLabel>Contact</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/dashboard" current={dashboardCurrent}>
                <HomeIcon {...iconSlot()} />
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/decks" current={decksCurrent}>
                <Square2StackIcon {...iconSlot()} />
                <SidebarLabel>Decks</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/pricing" current={pricingCurrent}>
                <TicketIcon {...iconSlot()} />
                <SidebarLabel>Pricing</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/contact" current={contactCurrent}>
                <MegaphoneIcon {...iconSlot()} />
                <SidebarLabel>Contact</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/dashboard">
                <Cog6ToothIcon {...iconSlot()} />
                <SidebarLabel>Workspace</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
            <SidebarSpacer />
            <SidebarSection>
              <SidebarItem href="/contact">
                <QuestionMarkCircleIcon {...iconSlot()} />
                <SidebarLabel>{"Help & support"}</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/">
                <SparklesIcon {...iconSlot()} />
                <SidebarLabel>Marketing site</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar
                    initials="GU"
                    alt="Guest user"
                    square
                    className="size-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-medium text-zinc-950 dark:text-white">
                      Guest
                    </span>
                    <span className="block truncate text-xs/5 font-normal text-zinc-500 dark:text-zinc-400">
                      Sign-in coming soon
                    </span>
                  </span>
                </span>
                <ChevronUpIcon {...iconSlot()} />
              </DropdownButton>
              <DropdownMenu className="min-w-64" anchor="top start">
                <DropdownItem href="/dashboard">
                  <UserIcon {...iconSlot()} />
                  <DropdownLabel>Dashboard</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/dashboard">
                  <Cog8ToothIcon {...iconSlot()} />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/contact">
                  <ShieldCheckIcon {...iconSlot()} />
                  <DropdownLabel>{"Privacy & data"}</DropdownLabel>
                </DropdownItem>
                <DropdownItem href="/contact">
                  <LightBulbIcon {...iconSlot()} />
                  <DropdownLabel>Share feedback</DropdownLabel>
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem href="/">
                  <ArrowRightStartOnRectangleIcon {...iconSlot()} />
                  <DropdownLabel>Leave app</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
