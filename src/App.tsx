import Drift from "@/sections/Drift";
import Duration from "@/sections/Duration";
import File from "@/sections/File";
import Options from "@/sections/Options";
import PianoRoll from "@/sections/PianoRoll";
import Start from "@/sections/Start";
import Velocity from "@/sections/Velocity";
import "./App.css";
import Footer from "@/sections/Footer";

const App = () => {
  return (
    <>
      <main>
        <PianoRoll />
        <section>
          <Start />
          <Drift />
          <Duration />
          <Velocity />
          <Options />
          <File />
        </section>
      </main>
      <Footer />
    </>
  );
};

export default App;
