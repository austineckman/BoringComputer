
import LED from "../LED.jsx";
import HeroBoard from "../HeroBoard.jsx";
import Buzzer from "../Buzzer.jsx";
import Photoresistor from "../Photoresistor.jsx";
import RotaryEncoder from "../RotaryEncoder.jsx";
import RGBLED from "../RGBLED.jsx";
import DipSwitch3 from "../DipSwitch3.jsx";
import OLEDDisplay from "../OLEDDisplay.jsx";
import Resistor from "../Resistor.jsx";
import CustomKeypad from "../CustomKeypad.jsx";
import BreadboardMini from "../BreadboardMini.jsx";
import SegmentedDisplay from "../SegmentedDisplay.jsx";
export const componentMap = {
    'oled-display': OLEDDisplay,
    'resistor': Resistor ,
    'photoresistor': Photoresistor,
    'hero-board': HeroBoard,
    'led': LED,
    'rgb-led': RGBLED,
    'buzzer': Buzzer,
    'rotary-encoder': RotaryEncoder,
    'dip-switch-3': DipSwitch3,
    'custom-keypad': CustomKeypad,
    'breadboard-mini': BreadboardMini,
    'segmented-display': SegmentedDisplay
};
