import React from "react";
import TerminalSimple from "./TerminalSimple";

interface TerminalWindowProps {
  startingDirectory?: string;
  onClose?: () => void;
}

const TerminalWindow: React.FC<TerminalWindowProps> = ({ startingDirectory, onClose }) => {
  return <TerminalSimple onClose={onClose} />;
};

export default TerminalWindow;