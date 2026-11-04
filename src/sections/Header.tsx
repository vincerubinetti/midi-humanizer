import type { ReactNode } from "react";
import logo from "@/logo.svg";

type Props = {
  children?: ReactNode;
};

export default function Header({ children }: Props) {
  return (
    <header className="flex items-center justify-center gap-8 bg-accent-light p-4 max-lg:flex-col">
      <h1 className="flex grow items-center gap-4 text-xl">
        <img src={logo} className="h-8" alt="" />
        MIDI Humanizer
      </h1>
      {children}
    </header>
  );
}
