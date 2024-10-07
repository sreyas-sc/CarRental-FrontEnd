import Contact from "./components/ContactUs/page";
import HowItWork from "./components/HowItWork/how-it-work";
import PopularDeals from "./components/PopularDeals/popular-deals";
import Banner from "./components/Welcome-banner/welcome-banner"
import WhyChooseUs from "./components/WhyChooseUs/why-choose-us";

export default function Home() {
  return (
    <main>
      <Banner/>
      <HowItWork/>
      <WhyChooseUs/>
      <PopularDeals/>
      <Contact/>
    </main>
  );
}