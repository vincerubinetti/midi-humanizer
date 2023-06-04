import Drift from "@/sections/Drift";
import Duration from "@/sections/Duration";
import File from "@/sections/File";
import Footer from "@/sections/Footer";
import Header from "@/sections/Header";
import Meta from "@/sections/Meta";
import Options from "@/sections/Options";
import PianoRoll from "@/sections/PianoRoll";
import Start from "@/sections/Start";
import Velocity from "@/sections/Velocity";
import "./App.css";

const App = () => {
  return (
    <>
      <Header />
      <main>
        <section>
          <File />
          <Meta />
        </section>
        <PianoRoll />
        <section>
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
};

export default App;
