import { Link } from "wouter";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { FaDiscord, FaYoutube, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
  const { sounds } = useSoundEffects();

  const handleClick = () => {
    sounds.click?.();
  };

  const handleHover = () => {
    sounds.hover?.();
  };

  return (
    <footer className="bg-space-darkest border-t border-brand-orange/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <svg className="h-10 w-10 mr-3">
              <use href="#logo" />
            </svg>
            <div>
              <div className="text-brand-orange font-bold text-lg">CraftingTable</div>
              <div className="text-xs text-brand-light/70">Learning through creating</div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
            <Link 
              href="/"
              onClick={handleClick}
              onMouseEnter={handleHover}
              className="text-sm text-brand-light/70 hover:text-brand-orange transition"
            >
              Home
            </Link>
            <Link
              href="/quests"
              className="text-sm text-brand-light/70 hover:text-brand-orange transition"
              onClick={handleClick}
              onMouseEnter={handleHover}
            >
              Quests
            </Link>
            <Link
              href="/forge"
              className="text-sm text-brand-light/70 hover:text-brand-orange transition"
              onClick={handleClick}
              onMouseEnter={handleHover}
            >
              Forge
            </Link>
            <Link
              href="/inventory"
              className="text-sm text-brand-light/70 hover:text-brand-orange transition"
              onClick={handleClick}
              onMouseEnter={handleHover}
            >
              Inventory
            </Link>
            <Link
              href="/settings"
              className="text-sm text-brand-light/70 hover:text-brand-orange transition"
              onClick={handleClick}
              onMouseEnter={handleHover}
            >
              Settings
            </Link>
          </div>
          
          <div className="flex space-x-4">
            <a 
              href="#"
              className="text-brand-light/70 hover:text-brand-orange transition"
              onClick={handleClick}
              onMouseEnter={handleHover}
            >
              <FaDiscord className="text-xl" />
            </a>
            <a 
              href="#"
              className="text-brand-light/70 hover:text-brand-orange transition"
              onClick={handleClick}
              onMouseEnter={handleHover}
            >
              <FaYoutube className="text-xl" />
            </a>
            <a 
              href="#"
              className="text-brand-light/70 hover:text-brand-orange transition"
              onClick={handleClick}
              onMouseEnter={handleHover}
            >
              <FaInstagram className="text-xl" />
            </a>
            <a 
              href="#"
              className="text-brand-light/70 hover:text-brand-orange transition"
              onClick={handleClick}
              onMouseEnter={handleHover}
            >
              <FaTwitter className="text-xl" />
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-space-light/10 text-center text-xs text-brand-light/50">
          &copy; {new Date().getFullYear()} CraftingTable, Inc. All rights reserved. The Quest Giver is part of the CraftingTable Academy.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
