import { useState } from "@/global/state";
import Drift from "@/sections/Drift";
import Duration from "@/sections/Duration";
import File from "@/sections/File";
import Header from "@/sections/Header";
import Options from "@/sections/Options";
import PianoRoll from "@/sections/PianoRoll";
import Start from "@/sections/Start";
import Velocity from "@/sections/Velocity";
import "./App.css";

const App = () => {
  const midi = useState((state) => state.midi);
  console.info(midi);

  return (
    <>
      <Header />
      <main>
        <File />
        <PianoRoll />
        <section>
          <Start />
          <Drift />
          <Duration />
          <Velocity />
          <Options />
        </section>
      </main>
    </>
  );
};

export default App;
