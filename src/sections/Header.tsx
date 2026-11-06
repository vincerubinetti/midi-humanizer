import logo from "@/assets/logo.svg?url";
import File from "@/sections/File";

export default function Header() {
  return (
    <header className="flex items-center justify-between gap-8 bg-accent-light p-4 max-md:flex-col max-md:justify-center">
      <h1 className="flex items-center gap-4 text-xl">
        <img src={logo} className="h-8 scale-125" alt="" />
        MIDI Humanizer
      </h1>
      <File className="justify-center max-lg:justify-end max-md:justify-center" />
    </header>
  );
}
