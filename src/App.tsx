import "@fontsource-variable/outfit/wght.css";
import "./styles.css";
import Drift from "@/sections/Drift";
import Duration from "@/sections/Duration";
import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import Options from "@/sections/Options";
import PianoRoll from "@/sections/PianoRoll";
import Start from "@/sections/Start";
import Track from "@/sections/Track";
import Velocity from "@/sections/Velocity";

export default function App() {
  return (
    <>
      <Header />
      <main className="flex grow flex-col">
        <section className="flex flex-col gap-4 p-4">
          <PianoRoll />
        </section>
        <section className="grid grid-cols-5 gap-4 p-4 max-lg:grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1">
          <Track />
          <Start />
          <Drift />
          <Duration />
          <Velocity />
          <Options />
        </section>
      </main>
      <Footer />
    </>
  );
}
