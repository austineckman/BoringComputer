import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CodeCaravanWindowProps {
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
}

// Game state types
type GamePhase = 'intro' | 'characterSelect' | 'journey' | 'event' | 'checkpoint' | 'ending';
type CharacterRole = 'backend' | 'frontend' | 'security' | 'devops';
type Resource = 'energy' | 'coffee' | 'ram' | 'bugSpray';

interface Character {
  name: string;
  role: CharacterRole;
  specialSkill: string;
  energy: number;
}

interface GameResources {
  energy: number;  // Team average energy
  coffee: number;  // Cups remaining
  ram: number;     // GB remaining
  bugSpray: number; // Cans remaining
}

interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: EventChoice[];
  specialRoleBonus?: CharacterRole; // If a specific role gets a bonus here
}

interface EventChoice {
  id: string;
  text: string;
  consequences: {
    resource?: { type: Resource, amount: number }[]; // Resource changes
    specialEvent?: string; // Trigger special event
    nextEvent?: string; // Forces a specific next event
  };
  requiredResource?: { type: Resource, amount: number }; // Resource needed to select this option
}

interface GameState {
  phase: GamePhase;
  day: number;
  team: Character[];
  resources: GameResources;
  currentLocation: string;
  currentEvent?: GameEvent;
  eventHistory: string[];
  morale: number; // 0-100
  distanceTraveled: number; // 0-100 (completion percentage)
  gameOver: boolean;
  eventMessage?: string; // Message to display after an event choice
}

const CodeCaravanWindow = ({ onClose, onMinimize, isActive }: CodeCaravanWindowProps): React.ReactNode => {
  // Initial game state
  const initialState: GameState = {
    phase: 'intro',
    day: 1,
    team: [],
    resources: {
      energy: 100,
      coffee: 20,
      ram: 64,
      bugSpray: 10
    },
    currentLocation: 'Startup Hub',
    eventHistory: [],
    morale: 80,
    distanceTraveled: 0,
    gameOver: false
  };
  
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [teamName, setTeamName] = useState('');
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [userInput, setUserInput] = useState('');
  const [animatedText, setAnimatedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [textToAnimate, setTextToAnimate] = useState('');

  // Character options
  const characterOptions: Character[] = [
    { name: 'Alex', role: 'backend', specialSkill: 'Efficient Algorithms', energy: 100 },
    { name: 'Blair', role: 'frontend', specialSkill: 'UI Optimization', energy: 100 },
    { name: 'Casey', role: 'security', specialSkill: 'Firewall Bypass', energy: 100 },
    { name: 'Dana', role: 'devops', specialSkill: 'Resource Management', energy: 100 },
    { name: 'Evan', role: 'backend', specialSkill: 'Database Queries', energy: 100 },
    { name: 'Fiona', role: 'frontend', specialSkill: 'UX Problem Solving', energy: 100 },
    { name: 'Gabe', role: 'security', specialSkill: 'Encryption Breaking', energy: 100 },
    { name: 'Harper', role: 'devops', specialSkill: 'Server Whisperer', energy: 100 },
  ];

  // Events database
  const events: GameEvent[] = [
    {
      id: 'legacy_canyon',
      title: 'Legacy Code Canyon',
      description: 'Your team encounters a vast canyon of legacy code. The ancient functions and deprecated methods create a maze that must be navigated carefully.',
      choices: [
        {
          id: 'refactor',
          text: 'Spend time refactoring the old code',
          consequences: {
            resource: [
              { type: 'energy', amount: -15 },
              { type: 'coffee', amount: -3 }
            ]
          }
        },
        {
          id: 'workaround',
          text: 'Create a quick workaround to bypass the old code',
          consequences: {
            resource: [
              { type: 'energy', amount: -5 },
              { type: 'bugSpray', amount: -2 }
            ],
            specialEvent: 'workaround_bugs'
          }
        },
        {
          id: 'ask_elders',
          text: 'Consult the code elders who wrote the legacy system',
          consequences: {
            resource: [
              { type: 'coffee', amount: -5 }
            ]
          }
        }
      ],
      specialRoleBonus: 'backend'
    },
    {
      id: 'dependency_desert',
      title: 'Dependency Desert',
      description: 'Your team must cross a barren desert where packages are scarce. The package registry oasis seems to be a mirage that keeps moving further away.',
      choices: [
        {
          id: 'direct_route',
          text: 'Take the direct route across the desert',
          consequences: {
            resource: [
              { type: 'energy', amount: -20 },
              { type: 'coffee', amount: -4 },
              { type: 'ram', amount: -10 }
            ]
          }
        },
        {
          id: 'follow_index',
          text: 'Follow the Index Path with better package availability',
          consequences: {
            resource: [
              { type: 'energy', amount: -10 },
              { type: 'coffee', amount: -2 },
              { type: 'ram', amount: -5 }
            ]
          }
        },
        {
          id: 'scout_drone',
          text: 'Set up camp and send a scout drone',
          consequences: {
            resource: [
              { type: 'energy', amount: -5 },
              { type: 'ram', amount: -3 }
            ],
            specialEvent: 'found_oasis'
          },
          requiredResource: { type: 'ram', amount: 5 }
        }
      ],
      specialRoleBonus: 'devops'
    },
    {
      id: 'syntax_storm',
      title: 'Syntax Storm',
      description: 'Dark clouds form overhead as warnings and errors rain down on your team. A massive storm of syntax errors blocks your path forward.',
      choices: [
        {
          id: 'take_shelter',
          text: 'Take shelter and wait for the storm to pass',
          consequences: {
            resource: [
              { type: 'energy', amount: 5 },
              { type: 'coffee', amount: -1 }
            ],
            specialEvent: 'lost_time'
          }
        },
        {
          id: 'debug_through',
          text: 'Push through the storm with intensive debugging',
          consequences: {
            resource: [
              { type: 'energy', amount: -25 },
              { type: 'coffee', amount: -5 },
              { type: 'bugSpray', amount: -3 }
            ]
          }
        },
        {
          id: 'type_checking',
          text: 'Deploy type-checking shields',
          consequences: {
            resource: [
              { type: 'energy', amount: -10 },
              { type: 'ram', amount: -8 }
            ]
          },
          requiredResource: { type: 'ram', amount: 10 }
        }
      ],
      specialRoleBonus: 'frontend'
    },
    {
      id: 'security_checkpoint',
      title: 'Firewall Checkpoint',
      description: 'Your team arrives at a heavily guarded checkpoint. The security systems are scanning for any vulnerabilities or unauthorized access attempts.',
      choices: [
        {
          id: 'authentication',
          text: 'Present proper authentication credentials',
          consequences: {
            resource: [
              { type: 'ram', amount: -5 }
            ]
          }
        },
        {
          id: 'bypass',
          text: 'Attempt to bypass the firewall using security expertise',
          consequences: {
            resource: [
              { type: 'energy', amount: -15 },
              { type: 'bugSpray', amount: -2 }
            ],
            specialEvent: 'security_breach'
          }
        },
        {
          id: 'bribe',
          text: 'Offer some coffee to the security admin',
          consequences: {
            resource: [
              { type: 'coffee', amount: -8 }
            ]
          },
          requiredResource: { type: 'coffee', amount: 8 }
        }
      ],
      specialRoleBonus: 'security'
    }
  ];

  // Special event outcomes
  const specialEvents: Record<string, { message: string, effect: (state: GameState) => GameState }> = {
    workaround_bugs: {
      message: 'Your hasty workaround has introduced several new bugs that are now following your team.',
      effect: (state) => ({
        ...state,
        morale: state.morale - 10
      })
    },
    found_oasis: {
      message: "The scout drone discovered a hidden package repository oasis! You've replenished some supplies.",
      effect: (state) => ({
        ...state,
        resources: {
          ...state.resources,
          coffee: state.resources.coffee + 5,
          bugSpray: state.resources.bugSpray + 2
        },
        morale: state.morale + 10
      })
    },
    lost_time: {
      message: 'Waiting out the storm costs you valuable time. The deadline feels tighter now.',
      effect: (state) => ({
        ...state,
        day: state.day + 1
      })
    },
    security_breach: {
      message: 'Your bypass worked, but triggered silent alarms. Security bots might be tracking you now.',
      effect: (state) => ({
        ...state,
        eventHistory: [...state.eventHistory, 'security_alerted']
      })
    }
  };

  // Locations along the journey
  const locations = [
    'Startup Hub',
    'Framework Forest',
    'API Junction',
    'Database Desert',
    'Cloud Peak',
    'Bug Swamp',
    'Library Valley',
    'Encryption Ridge',
    'Memory Leak Marsh',
    'Silicon Valley'
  ];

  // Text animation effect
  useEffect(() => {
    if (textToAnimate && !isAnimating) {
      setIsAnimating(true);
      setAnimatedText('');
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < textToAnimate.length) {
          setAnimatedText(prev => prev + textToAnimate.charAt(index));
          index++;
        } else {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, 30); // Character display speed
      
      return () => clearInterval(interval);
    }
  }, [textToAnimate, isAnimating]);

  // Handle user choice selection
  const handleChoice = (choice: EventChoice) => {
    // Check if choice requires resources
    if (choice.requiredResource) {
      const { type, amount } = choice.requiredResource;
      if (gameState.resources[type] < amount) {
        setTextToAnimate(`You don't have enough ${type} to choose this option!`);
        return;
      }
    }

    // Apply resource consequences
    let updatedState = { ...gameState };
    if (choice.consequences.resource) {
      const updatedResources = { ...gameState.resources };
      
      choice.consequences.resource.forEach(resource => {
        updatedResources[resource.type] += resource.amount;
        // Ensure resources don't go below 0
        if (updatedResources[resource.type] < 0) {
          updatedResources[resource.type] = 0;
        }
      });
      
      updatedState = {
        ...updatedState,
        resources: updatedResources
      };
    }

    // Handle special events
    if (choice.consequences.specialEvent && specialEvents[choice.consequences.specialEvent]) {
      const specialEvent = specialEvents[choice.consequences.specialEvent];
      setTextToAnimate(specialEvent.message);
      updatedState = specialEvent.effect(updatedState);
    }

    // Progress the game
    updatedState = {
      ...updatedState,
      distanceTraveled: Math.min(100, updatedState.distanceTraveled + 10),
      eventHistory: [...updatedState.eventHistory, gameState.currentEvent?.id || ''],
      day: updatedState.day + 1,
      phase: 'journey'
    };

    // Check if game over conditions are met
    if (updatedState.resources.energy <= 0) {
      updatedState.gameOver = true;
      updatedState.phase = 'ending';
      setTextToAnimate('Your team has run out of energy and cannot continue the journey. Game Over!');
    } else if (updatedState.distanceTraveled >= 100) {
      updatedState.gameOver = true;
      updatedState.phase = 'ending';
      updatedState.currentLocation = 'Silicon Valley';
      setTextToAnimate('Congratulations! Your team has successfully reached Silicon Valley with the revolutionary programming language!');
    } else {
      // Set the next location if the journey continues
      const locationIndex = Math.floor(updatedState.distanceTraveled / 10);
      updatedState.currentLocation = locations[locationIndex];
    }

    setGameState(updatedState);
  };

  // Generate a random event
  const generateRandomEvent = () => {
    const randomIndex = Math.floor(Math.random() * events.length);
    const event = events[randomIndex];
    
    setGameState({
      ...gameState,
      currentEvent: event,
      phase: 'event'
    });
    
    setTextToAnimate(event.description);
  };

  // Start journey with selected team
  const startJourney = () => {
    if (selectedCharacters.length < 2) {
      setTextToAnimate('You need to select at least 2 team members to start the journey!');
      return;
    }
    
    if (!teamName.trim()) {
      setTextToAnimate('Please give your team a name!');
      return;
    }
    
    setGameState({
      ...gameState,
      team: selectedCharacters,
      phase: 'journey'
    });
    
    setTextToAnimate(`Team ${teamName} begins their epic journey along the Silicon Road. Your first stop is ${locations[0]}...`);
  }

  // Continue journey after event
  const continueJourney = () => {
    // 70% chance of random event, 30% chance of peaceful travel
    if (Math.random() < 0.7) {
      generateRandomEvent();
    } else {
      const peaceful = [
        'The team travels without incident, making good progress.',
        "A calm day of coding and progress. Everyone's spirits are high.",
        'The digital road stretches out peacefully before you.',
        'Your team finds a shortcut through some well-documented code.',
      ];
      
      const randomMessage = peaceful[Math.floor(Math.random() * peaceful.length)];
      
      setGameState({
        ...gameState,
        day: gameState.day + 1,
        distanceTraveled: Math.min(100, gameState.distanceTraveled + 5),
        resources: {
          ...gameState.resources,
          energy: Math.min(100, gameState.resources.energy + 5), // Rest a bit
          coffee: Math.max(0, gameState.resources.coffee - 1) // Use a little coffee
        }
      });
      
      setTextToAnimate(randomMessage);
      
      // Update current location
      const locationIndex = Math.floor((gameState.distanceTraveled + 5) / 10);
      if (locationIndex < locations.length && locations[locationIndex] !== gameState.currentLocation) {
        setGameState(prev => ({
          ...prev,
          currentLocation: locations[locationIndex]
        }));
      }
    }
  }

  // Toggle character selection
  const toggleCharacterSelection = (character: Character) => {
    if (selectedCharacters.some(c => c.name === character.name)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.name !== character.name));
    } else if (selectedCharacters.length < 4) { // Maximum 4 team members
      setSelectedCharacters([...selectedCharacters, character]);
    } else {
      setTextToAnimate('You can only select up to 4 team members!');
    }
  };

  // Reset the game
  const resetGame = () => {
    setGameState(initialState);
    setTeamName('');
    setSelectedCharacters([]);
    setTextToAnimate('');
    setAnimatedText('');
  };

  // Render functions based on game phase
  const renderIntro = () => (
    <div className="text-center p-4">
      <h2 className="text-2xl text-green-500 font-bold mb-4">Code Caravan: The Silicon Road</h2>
      <div className="mb-6 text-green-300">
        <p>The year is 2088. Your team has developed a revolutionary programming language that will change the future of coding forever.</p>
        <p className="mt-2">Your mission: Traverse the dangerous Silicon Road to deliver this language to Silicon Valley before your competitors.</p>
        <p className="mt-2">Manage your resources wisely, make smart decisions, and use your team's skills to overcome challenges.</p>
      </div>
      <button 
        className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
        onClick={() => setGameState({...gameState, phase: 'characterSelect'})}
      >
        Begin Adventure
      </button>
    </div>
  );

  const renderCharacterSelect = () => (
    <div className="p-4">
      <h2 className="text-xl text-green-500 font-bold mb-4">Assemble Your Team</h2>
      
      <div className="mb-4">
        <label className="block text-green-300 mb-1">Team Name:</label>
        <input 
          type="text" 
          value={teamName} 
          onChange={(e) => setTeamName(e.target.value)}
          className="bg-gray-800 text-green-300 border border-green-700 rounded px-3 py-2 w-full"
          placeholder="Enter team name..."
        />
      </div>
      
      <p className="text-green-300 mb-2">Select 2-4 team members:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {characterOptions.map(character => (
          <div 
            key={character.name}
            className={`border p-2 rounded cursor-pointer ${selectedCharacters.some(c => c.name === character.name) 
              ? 'bg-green-900 border-green-500' 
              : 'bg-gray-800 border-gray-700 hover:border-green-700'}`}
            onClick={() => toggleCharacterSelection(character)}
          >
            <h3 className="text-lg font-medium text-green-400">{character.name}</h3>
            <p className="text-green-300">Role: {character.role.charAt(0).toUpperCase() + character.role.slice(1)} Developer</p>
            <p className="text-sm text-green-400">Special: {character.specialSkill}</p>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <button 
          className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          onClick={startJourney}
        >
          Start Journey
        </button>
      </div>
    </div>
  );

  const renderJourney = () => (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-xl text-green-500 font-bold">Day {gameState.day}</h2>
          <p className="text-green-300">Location: {gameState.currentLocation}</p>
        </div>
        <div className="text-right">
          <p className="text-green-300">Team: {teamName}</p>
          <p className="text-green-300">Morale: {gameState.morale}%</p>
        </div>
      </div>
      
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md mb-4">
        <h3 className="text-lg text-green-400 mb-2">Resources</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-green-300">🔋 Energy: {gameState.resources.energy}%</p>
            <p className="text-green-300">☕ Coffee: {gameState.resources.coffee} cups</p>
          </div>
          <div>
            <p className="text-green-300">💾 RAM: {gameState.resources.ram} GB</p>
            <p className="text-green-300">🐛 Bug Spray: {gameState.resources.bugSpray} cans</p>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg text-green-400 mb-2">Progress</h3>
        <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-green-600 h-full" 
            style={{ width: `${gameState.distanceTraveled}%` }}
          ></div>
        </div>
        <p className="text-green-300 text-right mt-1">{gameState.distanceTraveled}% complete</p>
      </div>
      
      <div className="bg-gray-800 border border-gray-700 p-3 rounded-md mb-4 min-h-[100px]">
        <p className="text-green-300">{animatedText || "Ready to continue your journey..."}</p>
      </div>
      
      <div className="text-center">
        <button 
          className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
          onClick={continueJourney}
          disabled={isAnimating}
        >
          Continue Journey
        </button>
      </div>
    </div>
  );

  const renderEvent = () => {
    if (!gameState.currentEvent) return null;
    
    return (
      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div>
            <h2 className="text-xl text-yellow-500 font-bold">{gameState.currentEvent.title}</h2>
            <p className="text-green-300">Day {gameState.day} - {gameState.currentLocation}</p>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-md mb-4">
          <p className="text-green-300">{animatedText || gameState.currentEvent.description}</p>
        </div>
        
        <h3 className="text-lg text-green-400 mb-2">What will you do?</h3>
        
        <div className="space-y-3 mb-4">
          {gameState.currentEvent.choices.map(choice => {
            // Check if this choice requires resources the team doesn't have
            let disabled = false;
            let disabledReason = '';
            
            if (choice.requiredResource) {
              const { type, amount } = choice.requiredResource;
              if (gameState.resources[type] < amount) {
                disabled = true;
                disabledReason = `Requires ${amount} ${type}`;
              }
            }
            
            return (
              <button 
                key={choice.id}
                className={`w-full text-left p-3 rounded-md border transition-colors duration-200 ${disabled 
                  ? 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed' 
                  : 'bg-gray-800 border-gray-700 hover:border-green-500'}`}
                onClick={() => !disabled && handleChoice(choice)}
                disabled={disabled || isAnimating}
              >
                <p className="text-green-300">{choice.text}</p>
                {disabled && <p className="text-red-400 text-sm">{disabledReason}</p>}
                
                {/* Show resource changes */}
                {choice.consequences.resource && (
                  <div className="text-xs mt-1">
                    {choice.consequences.resource.map(resource => {
                      const isPositive = resource.amount > 0;
                      return (
                        <span 
                          key={resource.type} 
                          className={`mr-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {resource.type}: {isPositive ? '+' : ''}{resource.amount}
                        </span>
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-md">
          <h3 className="text-lg text-green-400 mb-2">Team Status</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-green-300">🔋 Energy: {gameState.resources.energy}%</p>
              <p className="text-green-300">☕ Coffee: {gameState.resources.coffee} cups</p>
            </div>
            <div>
              <p className="text-green-300">💾 RAM: {gameState.resources.ram} GB</p>
              <p className="text-green-300">🐛 Bug Spray: {gameState.resources.bugSpray} cans</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderEnding = () => (
    <div className="p-4 text-center">
      <h2 className="text-2xl text-green-500 font-bold mb-4">
        {gameState.distanceTraveled >= 100 ? 'Success!' : 'Game Over'}
      </h2>
      
      <div className="bg-gray-800 border border-gray-700 p-4 rounded-md mb-6">
        <p className="text-green-300">{animatedText}</p>
        
        <div className="mt-4">
          <h3 className="text-lg text-green-400 mb-2">Journey Stats</h3>
          <p className="text-green-300">Days on the road: {gameState.day}</p>
          <p className="text-green-300">Final location: {gameState.currentLocation}</p>
          <p className="text-green-300">Distance traveled: {gameState.distanceTraveled}%</p>
          <p className="text-green-300">Remaining coffee: {gameState.resources.coffee} cups</p>
          <p className="text-green-300">Team morale: {gameState.morale}%</p>
        </div>
      </div>
      
      <button 
        className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
        onClick={resetGame}
      >
        Play Again
      </button>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Window title bar */}
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
        <h2 className="font-medium">Code Caravan: The Silicon Road</h2>
        <div className="flex items-center space-x-2">
          <button
            className="p-1 hover:bg-gray-700 rounded"
            onClick={onMinimize}
          >
            <div className="w-3 h-0.5 bg-gray-300"></div>
          </button>
          <button
            className="p-1 hover:bg-gray-700 rounded"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game content */}
      <div className="flex-1 overflow-auto">
        {gameState.phase === 'intro' && renderIntro()}
        {gameState.phase === 'characterSelect' && renderCharacterSelect()}
        {gameState.phase === 'journey' && renderJourney()}
        {gameState.phase === 'event' && renderEvent()}
        {gameState.phase === 'ending' && renderEnding()}
      </div>

      {/* Command input area */}
      <div className="bg-gray-800 px-4 py-3 border-t border-gray-700">
        <div className="flex">
          <span className="text-green-400 mr-2">{'>'}</span>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="flex-1 bg-transparent text-green-300 focus:outline-none"
            placeholder="Type 'help' for commands..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userInput.trim()) {
                // Process commands
                if (userInput.toLowerCase() === 'help') {
                  setTextToAnimate('Available commands: status, team, resources, restart, help');
                } else if (userInput.toLowerCase() === 'status') {
                  setTextToAnimate(`Day ${gameState.day} | Location: ${gameState.currentLocation} | Progress: ${gameState.distanceTraveled}%`);
                } else if (userInput.toLowerCase() === 'team') {
                  setTextToAnimate(`Team ${teamName}: ${gameState.team.map(member => `${member.name} (${member.role})`).join(', ')}`);
                } else if (userInput.toLowerCase() === 'resources') {
                  setTextToAnimate(`Energy: ${gameState.resources.energy}% | Coffee: ${gameState.resources.coffee} cups | RAM: ${gameState.resources.ram} GB | Bug Spray: ${gameState.resources.bugSpray} cans`);
                } else if (userInput.toLowerCase() === 'restart') {
                  resetGame();
                  setTextToAnimate('Game has been reset. Good luck on your new journey!');
                } else {
                  setTextToAnimate('Unknown command. Try typing "help" for available commands.');
                }
                
                setUserInput('');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeCaravanWindow;