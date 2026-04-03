import CreateEventSection from "../components/CreateEventSection.jsx";
import { EventGrid } from "../components/EventGrid";
import { Hero } from "../components/Hero.jsx";
import React from "react";

const Index = () => {
  return (
    <div>
      <Hero />
      <EventGrid />
      <CreateEventSection />
    </div>
  );
};

export default Index;
