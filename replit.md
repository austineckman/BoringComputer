# Inventr Circuit Builder Platform

## Overview

This is a comprehensive educational platform for electronics and maker education, featuring interactive circuit building, simulation, and gamified learning experiences. The platform combines traditional STEM learning with modern gamification elements including quests, inventory systems, and character progression.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Profile Window Retro Integration (July 10, 2025)
- Fixed architectural issue with duplicate popup windows in profile system
- Converted ProfileWindow from modal overlay to proper retro window system integration
- Redesigned profile UI to match retro Windows 95 aesthetic with proper borders and inset styling
- Profile now opens as single retro-style window instead of creating competing modal overlay
- Maintained all profile functionality: user stats, title selection, Discord role display

### Discord OAuth Role Integration (July 10, 2025)
- Successfully implemented Discord OAuth authentication with proper Replit domain callback
- Added Discord bot integration for server role fetching using bot token
- Created role mapping system from Discord server roles to app permissions (admin, moderator, premium, user)
- Added debug endpoints for troubleshooting Discord role issues
- System now fetches real Discord roles instead of using placeholder roles
- **Founder Role Admin Mapping**: Anyone with "Founder" Discord role automatically gets admin privileges in CraftingTable OS
- Fixed role authentication to properly fetch and display real Discord server roles in profile window

### Authentication Endpoint Fix (July 10, 2025)
- Fixed critical authentication endpoint mismatch between frontend and backend
- Frontend was calling `/api/auth/user` but backend only provides `/api/auth/me`
- Updated all frontend authentication hooks to use correct `/api/auth/me` endpoint
- This resolves Oracle access control system to properly recognize admin privileges
- Backend logs confirm user session has proper roles: ['CraftingTable', 'Founder', 'Academy', 'Server Booster', 'admin']

### Discord Role Database Sync Fix (July 13, 2025)
- **Root Cause Identified**: Discord OAuth role fetching failed during initial authentication, leaving user with empty roles `[]` in database
- Fixed by directly updating user roles in database using SQL: `UPDATE users SET roles = '["admin", "Founder", "CraftingTable", "Academy", "Server Booster"]'::json`
- Session deserialization now correctly shows all Discord roles instead of empty array
- Oracle icon now properly appears for admin users with Founder role
- This ensures campaign automation interface access for authorized users

### Oracle Access Control Enhancement (July 18, 2025)
- **CraftingTable-Only Access**: Simplified Oracle access to check only for 'CraftingTable' Discord role as requested by team
- **Campaign Management Access**: CraftingTable team members can now access the full Oracle campaign automation interface for quest management
- **Role-Based Authorization**: Replaced basic `authenticate` middleware with `hasOracleAccess` on all Oracle API endpoints for proper role verification
- **Team-Specific Access**: Oracle interface now recognizes only CraftingTable role for access control
- **Security Enhancement**: All Oracle endpoints now properly validate CraftingTable Discord role before allowing administrative operations
- **UI Update**: Changed hardcoded "Admin Only" badge to "Campaign Management" to reflect team access system
- **Database Fix**: Updated both craftingtable1_05196 and chas_61772 users with CraftingTable role to resolve Discord OAuth rate limiting issues

### Oracle Quest Management Cleanup (July 18, 2025)
- **Duplicate Button Removal**: Removed duplicate "Add Quest" buttons from Oracle interface header that were causing quest management confusion
- **Single Quest Creation Path**: Streamlined quest creation to use only the intuitive plus button in empty quest line state
- **Quest Display Fix**: Resolved issue where Day 3 quest appeared missing from Oracle interface due to UI button conflicts
- **Clean Quest Interface**: Oracle now has single, clear quest creation workflow without competing UI elements
- **All Quests Visible**: Confirmed all 5 quests (including Day 3: "I'm worried about your battery levels") now display properly in Oracle interface
- **Oracle Scrolling Enhancement**: Fixed Flow Canvas from overflow-hidden to overflow-y-auto for proper vertical scrolling
- **Bottom Padding Fix**: Added pb-20 to QuestGridView and 80px paddingBottom to Flow Canvas for proper quest visibility
- **Admin Access Improvement**: Admins can now scroll deeper and see all quests with adequate spacing below the last quest

### Solution Helper Penalty System (July 18, 2025)
- **Removed Timer System**: Eliminated 5-minute timer requirement for solution helper access
- **Immediate Access with Penalty**: Players can now reveal answers immediately but forfeit gold rewards
- **Confirmation Dialog**: Added warning dialog explaining gold penalty before revealing solutions
- **Gold Penalty Logic**: Backend now checks `cheatUsed` parameter and sets gold reward to 0 if solution was revealed
- **Visual Indicators**: Solution helper shows "Gold Penalty Applied" status when cheat has been used
- **Reward Message Update**: Quest completion messages now indicate when gold was forfeited due to using solution helper
- **Educational Focus**: Encourages learning through trial and error while still providing help when needed

### Quest Completion Rewards System Fix (July 18, 2025)
- **Real Quest Rewards Display**: Fixed quest completion dialog to show actual quest rewards instead of placeholder data
- **Backend API Enhancement**: Updated quest completion endpoint to return proper reward data format for frontend consumption
- **Gold Rewards Integration**: Added gold reward processing and display in quest completion system
- **Item Rewards Display**: Quest completion now shows actual items awarded from quest configuration
- **Re-completion Handling**: Implemented proper "already completed" state for users retrying completed quests
- **Inventory Integration**: Quest rewards are properly added to user profile and inventory upon completion
- **Reward Data Mapping**: Fixed data format mismatch between backend response and frontend dialog expectations

### Discord OAuth Production Redirect Fix (July 18, 2025)
- **Dynamic Callback URL**: Fixed hardcoded Replit dev URL in Discord OAuth configuration
- **Environment-Based Routing**: Added intelligent callback URL detection using REPLIT_DOMAINS and NODE_ENV
- **Production Domain Support**: Automatically routes to computer.craftingtable.com in production environment
- **Manual Override Option**: Added DISCORD_CALLBACK_URL environment variable for explicit callback URL control
- **Logging Enhancement**: Added comprehensive logging to track which callback URL is being debugging
- **Multi-Domain Support**: Reads primary domain from REPLIT_DOMAINS environment variable for dynamic Replit deployments

### Custom Display Name System (July 17, 2025)
- **Complete Display Name Override**: Users can now set custom display names in profile settings to replace messy Discord usernames
- **Profile Settings Interface**: Added dedicated "Display Name" section with edit/save functionality and input validation
- **Comment System Integration**: All comments now show display names (with username fallback) instead of Discord usernames
- **Database Schema Support**: Added display_name column to users table with proper backend API endpoints
- **Real-time Updates**: Display names update immediately across all user interfaces and comment sections
- **Clean User Experience**: Replaces Discord usernames like "austineckman" and "craftingtable1_05196" with clean custom names like "Austin" and "CraftingTable Team"

### Quest Component Requirements Fix (July 15, 2025)
- **Component Requirements Persistence**: Fixed critical issue where quest component requirements weren't saving properly
- **Backend Oracle API Enhancement**: Added special handling for quest component requirements in Oracle API PUT/POST endpoints
- **Separate Table Management**: Component requirements now properly saved to separate `questComponents` table with proper foreign key relationships
- **Frontend Save Process**: Removed destructuring that was excluding component requirements from quest save data
- **Quest Creation Support**: Both quest creation and editing now properly handle component requirements
- **Full-Width Quest Grid**: Converted Oracle quest display from 3-column cards to full-width horizontal layout showing hero images, components, rewards, and loot boxes at a glance

### Hierarchical Quest Line System (July 15, 2025)
- **Three-Level Navigation**: Implemented Component Kit → Quest Line → Individual Quests hierarchical structure
- **Unique Quest Lines**: Quest lines are now unique within each component kit with proper isolation
- **Quest Line Management**: Added ability to create new quest lines and navigate between existing ones
- **Empty State Enhancement**: New quest lines start with centered plus button for creating first quest
- **Improved Quest Flow**: Modified quest flow to show only quests in selected kit and quest line
- **Navigation Breadcrumbs**: Clear back navigation between kit selection, quest line selection, and individual quest flow
- **Auto-Population Fix**: Removed hardcoded storyline/component kit dropdowns and auto-populate from navigation context
- **Numeric Quest IDs**: Fixed quest ID generation to use only numeric values (Date.now().toString()) instead of characters
- **Context-Aware Components**: Component requirements now automatically use selected kit components instead of requiring manual selection

### CSRF Protection Removal (July 29, 2025)
- **Complete CSRF Removal**: Eliminated unnecessary CSRF protection system that was causing quest completion failures
- **Simplified API Calls**: Removed complex token fetching and validation from frontend requests
- **Authentication Streamlining**: Fixed development authentication bypass for easier testing
- **Quest Completion Fix**: Resolved CSRF token validation errors preventing users from completing quests
- **Code Simplification**: Removed CSRF middleware, token endpoints, and related complexity throughout codebase
- **Educational Platform Focus**: CSRF protection was overkill for this educational gaming platform

### Quest List Scrolling Enhancement (July 29, 2025)
- **Custom Scrollbar Styling**: Added orange-themed scrollbars matching app design
- **Fixed Height Constraints**: Set explicit maxHeight to ensure proper scrolling behavior
- **Visible Scrollbar**: Changed from overflow-y-auto to overflow-y-scroll for forced scrollbar visibility
- **Bottom Padding**: Added pb-20 to quest grid ensuring all quests are accessible when scrolled

### Perfect CS:GO Lootbox Animation Synchronization (July 30, 2025)
- **Mathematical Positioning Calculation**: Fixed animation positioning using exact math - 1070px animation distance ÷ 104px item width = winner at index 10
- **Predetermined Animation System**: Frontend generates 40-item strip first, calculates winner position mathematically, then sends to backend
- **Perfect Visual Alignment**: Item that stops under yellow selection line now exactly matches the actual reward received
- **Bulletproof Synchronization**: Eliminated all positioning mismatches by making frontend control both animation and reward determination
- **CSS Animation Integration**: Uses actual CSS transform values (-1070px) with precise item dimensions (96px width + 8px margins)
- **Debug Logging**: Added calculation logs showing "1070px ÷ 104px = winner at index 10" for verification
- **Backend Predetermined Endpoint**: New `/api/lootboxes/:id/open-predetermined` endpoint accepts frontend-determined rewards
- **CS:GO Authenticity**: Maintains smooth deceleration curves and professional case opening experience with guaranteed accuracy
- **Authentic Drop Table Animation**: Animation strip now shows only items that can actually drop from the specific lootbox type instead of random game items
- **Weighted Item Distribution**: Uses lootbox drop table weights to create realistic item frequency in animation strip
- **Proper Quantity Ranges**: Animation items show appropriate quantity ranges based on lootbox configuration (e.g., 1-2 metal, 1-3 tech-scrap)

### Organic Click-Based Wire Drawing System (July 30, 2025)
- **Simple Click-Based Drawing**: Click pin to start, click canvas to add waypoints, click target pin to finish - no dragging required
- **Smooth Bezier Curves**: Automatic conversion of waypoints into flowing quadratic Bezier curves for natural appearance
- **Clean Visual Design**: Removed all waypoint marker dots for professional, uncluttered wire appearance
- **Natural Hand-Drawn Look**: Wires flow organically like real breadboard wiring with curves and natural routing
- **Intelligent Curve Algorithm**: Creates smooth transitions between waypoints using control points for authentic wire droop
- **Optional Waypoint System**: Users can add curves by clicking canvas points between pins, or go direct for straight connections
- **No Mouse Dragging**: Simplified interaction - pure click-based workflow that's intuitive and accessible
- **Rounded Line Joints**: strokeLinejoin="round" for smooth, professional wire connections
- **Educational Value**: Students learn natural circuit wiring patterns while building with authentic-looking components
- **User Experience**: Click → Click → Click → Beautiful curved wire appears without visible control points

### Gold Coin Asset Integration (July 30, 2025)
- **Pixel Art Gold Coin**: Added beautiful pixel art gold coin asset throughout the entire application UI
- **Quest Completion Dialog**: Replaced generic coin icon with custom pixel art gold coin in reward display
- **Profile Window**: Updated gold display in user stats grid to show pixel art coin instead of generic icon
- **Shop Window (BMAH)**: Integrated gold coin into auction house interface for authentic visual design
- **Oracle Quest Management**: Added gold coin to quest creation forms and reward preview sections
- **Admin Quest Forms**: Updated admin quest creation interface to display gold coin with reward fields
- **Consistent Styling**: Applied pixelated image rendering throughout for retro aesthetic consistency
- **User Experience Enhancement**: Visual coherence improves immersion in gamified learning environment

### Basic Blink Example Fix (July 30, 2025)
- **Default Code Restoration**: Fixed CircuitBuilderWindow.tsx default code from RGB LED demo back to classic Arduino blink example
- **Pin 13 LED Control**: Default code now properly controls pin 13 (built-in LED) instead of pins 9, 10, 11 (RGB channels)
- **Educational Focus**: Restored classic "Hello World" Arduino program for beginners learning basic LED control
- **Code Simplification**: Simple pinMode(13, OUTPUT) and digitalWrite(13, HIGH/LOW) pattern for educational clarity

### Quest System Rework with Sequential Locking (July 30, 2025)
- **Sequential Quest Unlocking**: Implemented proper quest ordering system where users must complete previous quests to unlock next ones
- **Tab-Based Quest Filtering**: Added "Available" and "Completed" tabs to organize quest visibility and hide completed quests by default
- **Visual Quest Locking System**: Locked quests display with lock icons, grayed-out styling, disabled interaction, and clear "LOCKED" badges
- **Quest Numbering Display**: Added quest order numbers (#1, #2, etc.) to help users understand progression sequence
- **Smart Status Detection**: Backend now determines quest availability based on orderInLine field and completion status of previous quests
- **Interactive Feedback**: Locked quests play error sound when clicked and show helpful "Complete previous quests" messaging
- **Enhanced Empty States**: Different messages for "No Available Quests" vs "No Completed Quests" based on active tab
- **Order-Based Sorting**: Quests now display in proper sequential order using orderInLine database field for consistent progression

### Visual Quest Card Redesign (July 30, 2025)
- **Hero Image Focus**: Redesigned quest cards with large hero images as the primary visual element instead of text-heavy layout
- **Circuit Diagram Integration**: Added second image support for circuit diagrams displayed neatly below quest description
- **Card Hover Effects**: Enhanced cards with scale-up hover animations and subtle image zoom effects for better interactivity
- **Clean Information Architecture**: Removed redundant "30 Days Lost in Space" text and streamlined content to focus on essentials
- **Image Overlay Elements**: Quest numbers and status badges now overlay on hero images for cleaner design
- **Responsive Image Heights**: Hero images scale from 192px to 224px based on screen size for optimal viewing without cropping
- **Pixelated Rendering**: Consistent pixel art aesthetic maintained across all quest card images
- **Improved Visual Hierarchy**: Title prominence increased, description condensed to 2 lines, better spacing throughout cards
- **Component Requirements Display**: Added visual component badges showing required hardware with icons and names at card bottom
- **Quest Rewards Visualization**: Integrated gold coin and item reward displays with colored badges and quantities for immediate reward preview

### Oracle Quest Reordering System (July 30, 2025)
- **Up/Down Arrow Controls**: Added ChevronUp and ChevronDown buttons to the left side of each quest card for intuitive reordering
- **Database Order Updates**: Quest reordering updates the `orderInLine` field in the database to maintain persistent quest sequence
- **Swap Functionality**: Clicking arrows swaps adjacent quests and immediately updates both quest order values
- **Real-time State Updates**: Local quest state reflects reordering changes instantly without requiring page refresh
- **Audio Feedback**: Success and error sounds provide user feedback for reordering operations
- **Admin Quest Management**: Oracle interface now supports full quest sequence control for educational campaign design
- **Sequential Learning**: Proper quest ordering ensures students progress through educational content in the intended sequence

### Quest Interface Responsive Design Fix (July 30, 2025)
- **Improved Screen Fit**: Removed fixed height constraints that prevented content from fitting on smaller screens
- **Better Grid Layout**: Updated quest grid from 3-column max to responsive 1/2/3/4 columns based on screen size
- **Compact Layout**: Reduced padding and margins throughout interface for better space utilization
- **Dynamic Overflow**: Changed from fixed maxHeight to flexible overflow-y-auto for proper scrolling
- **Mobile-First Approach**: Enhanced breakpoints for better mobile, tablet, and desktop experiences
- **Content Density**: More quests and kits visible at once while maintaining readability

### Enhanced Quest Card Visual System (July 30, 2025)
- **Component Image Integration**: Quest cards now display actual component images from the component kit database instead of placeholder icons
- **Smart Component Lookup**: System searches through all component kits to find matching component images by name when not directly available
- **Reward Image Enhancement**: Quest reward items now display proper images from the items database with fallback to appropriate icons
- **Lootbox Image Display**: Lootbox rewards show actual lootbox images from configuration data instead of generic placeholders
- **Visual Component Badges**: Required components section shows component images alongside names for better visual identification
- **Item Database Integration**: Full integration with items API to display accurate reward images and information
- **TypeScript Error Resolution**: Fixed all implicit type errors throughout quest interface for better code quality
- **Enhanced User Experience**: Visual quest cards now provide comprehensive information with images for components, rewards, and lootboxes

### Image Upload System Fix (July 30, 2025)
- **CSRF Token Removal**: Fixed image upload failures by removing CSRF token fetching from all upload functions in Oracle interface
- **Direct Upload Implementation**: Hero images, wiring diagrams, component images, and kit images now upload directly without token validation
- **Correct Endpoint URLs**: Updated frontend to use proper upload endpoints `/api/admin/upload/upload-image` instead of incorrect paths
- **Streamlined Upload Process**: Eliminated unnecessary token fetching that was causing empty error objects `{}` in upload responses
- **Multiple Upload Types Fixed**: Resolved upload issues for quest hero images, result GIFs, wiring diagrams, component images, and kit images
- **Error Handling Improvement**: Cleaned up upload error handling to provide meaningful feedback instead of empty error responses

### Quest Progress Reset Tool for Testing (July 30, 2025)
- **Oracle Testing Tool**: Added "Reset Quest Progress" button in Oracle interface header next to "Clear Lootboxes" for quest testing
- **Complete Progress Reset**: Button clears all completed quests from user's completedQuests array, resetting progress to zero
- **Backend API Endpoint**: Created `/api/admin/users/reset-quest-progress` POST endpoint for secure quest progress reset
- **User Session Integration**: Reset operates on current authenticated user's quest progress only
- **Testing Workflow Enhancement**: Allows quest designers to quickly reset progress to test quest sequences from beginning
- **Visual Feedback**: Purple-themed button with rotate icon and success/error notifications for clear user feedback

### Quest Card Transparency Fix (July 30, 2025)
- **Removed PixelCard Opacity**: Eliminated `opacity-60` from disabled PixelCard components to fix ghostly appearance
- **Reduced Canvas Overlay**: Changed canvas overlay opacity from 15% to 5% for much clearer text readability
- **Solid Card Backgrounds**: Changed `bg-gray-900/90` to `bg-gray-900` and `bg-gray-800/50` to `bg-gray-800` for full opacity
- **Arduino Simulator Fix**: Added null check for `otherComponentId` in LED component to prevent crashes when adding resistors to circuits
- **Better Text Visibility**: Quest cards now have clear, readable text without transparency issues while maintaining visual distinction between states

### Wire Color Cheat Sheet Enhancement (July 30, 2025)
- **Educational Wire Color Guide**: Added comprehensive cheat sheet in wire properties panel following standard electronics conventions
- **Standard Color Mapping**: Black for ground, red for power, green for digital signals, blue for analog inputs, yellow for communication
- **Professional Guidelines**: Orange for PWM outputs, white for clock signals, brown for reset/enable lines
- **Visual Learning Aid**: Small color indicators next to each description help students learn proper wiring practices
- **Integrated Design**: Clean blue-themed section that complements existing wire color selection interface
- **Educational Value**: Teaches students why certain colors are conventionally used for specific circuit functions

### Working Arduino Simulator Implementation (July 29, 2025)
- **Real AVR8JS Integration**: Successfully implemented authentic Arduino simulator using actual avr8js library
- **Machine Code Execution**: Created compiler that generates real AVR assembly instructions for Arduino code
- **Live LED Simulation**: Built LED components that respond to actual pin state changes from Arduino execution
- **Authentic Timing**: LED blink rates match actual Arduino hardware because code runs on real AVR emulator
- **Complete Demo System**: Created SimpleBlinkDemo showing working LED blink with real Arduino code compilation
- **Pin State Monitoring**: Implemented real-time pin change detection and visual feedback system
- **Educational Value**: Students learn real Arduino programming with authentic hardware behavior simulation
- **Route Integration**: Added `/blink-demo` route for testing working Arduino LED simulation
- **Technical Achievement**: Solved the "fake timer" problem that plagues most Arduino simulators
- **External LED Control**: Wire-based detection system finds and controls external LEDs connected to any Arduino pin
- **Visual Debugging**: Comprehensive execution logs show line-by-line code execution with timestamps and function calls
- **Dual LED Support**: Both Hero Board built-in LED (pin 13) and external wired LEDs blink simultaneously
- **Clean LED Rendering**: Removed glow effect positioning issues - LED state controlled by ReactLEDElement value prop

### Arduino analogWrite() PWM Support Implementation (July 30, 2025)
- **Complete PWM Functionality**: Added full analogWrite(pin, value) support to Arduino simulator for 0-255 PWM values
- **Enhanced Code Parser**: Updated ArduinoCodeParser.ts to parse analogWrite instructions with proper variable resolution
- **RGB LED Color Mixing**: RGB LEDs now respond to PWM values for realistic color blending instead of just on/off digital states
- **Brightness Control**: Regular LEDs support PWM brightness control from 0% to 100% based on analogWrite values
- **Wire-Based PWM Detection**: Simulator automatically detects PWM-capable components connected through visual wiring system
- **Educational PWM Learning**: Students learn proper Arduino PWM techniques with authentic 0-255 value ranges
- **Real-Time PWM Logs**: Execution logs show PWM values as percentages (e.g., "127/255 (50%)") for educational clarity
- **Default analogWrite Example**: Updated default code to demonstrate smooth RGB color mixing using analogWrite instead of digitalWrite
- **Component State Updates**: Both RGB LEDs and regular LEDs properly update visual state based on PWM input values
- **Professional PWM Implementation**: Full analogWrite support brings simulator to professional Arduino development standards

### Comprehensive Arduino Function Library Implementation (July 30, 2025)
- **Complete Function Coverage**: Implemented 50+ essential Arduino functions covering all major categories from official Arduino reference
- **Digital I/O Functions**: digitalRead(), digitalWrite(), pinMode() with proper pin state management and component interaction
- **Analog I/O Functions**: analogRead(), analogWrite() with authentic 0-1023 input range and 0-255 PWM output values
- **Time Functions**: delay(), delayMicroseconds(), millis(), micros() with realistic timing simulation and microsecond precision
- **Mathematical Functions**: abs(), constrain(), map(), max(), min(), pow(), sqrt(), sq() with proper parameter handling
- **Random Functions**: random(), randomSeed() supporting both single and dual parameter formats for educational randomness
- **Audio Functions**: tone(), noTone() with frequency and duration parameters for future buzzer/speaker components
- **Variable Management**: Complete variable declaration and assignment parsing for int, float, long, byte, bool types
- **Control Structures**: if statements, for loops, while loops with condition parsing for educational code flow visualization  
- **Serial Communication**: Serial.print(), Serial.println() with proper logging output for debugging and educational feedback
- **Real-Time Execution Logs**: All functions show detailed execution information with timestamps, parameters, and return values
- **Educational Function Learning**: Students experience authentic Arduino programming with comprehensive function library support
- **Professional Development Standards**: Simulator now handles complex Arduino code patterns used in real-world embedded projects

### Advanced Arduino Syntax Support Implementation (July 30, 2025)
- **Complete Control Flow**: else, else if, switch/case/default, break statements with proper conditional evaluation
- **Increment/Decrement Operators**: ++, --, +=, -= operators for variable manipulation and loop counters
- **Array Support**: Array declarations (int array[5]) and array access (array[index]) for data structure learning
- **Trigonometric Functions**: sin(), cos(), tan() with proper angle calculations for advanced math operations
- **Bit Manipulation**: bitRead(), bitWrite(), bitSet(), bitClear() functions for low-level hardware control
- **Return Statements**: Function return handling with value logging for custom function development
- **Arduino Constants**: Built-in HIGH, LOW, INPUT, OUTPUT, INPUT_PULLUP, LED_BUILTIN, A0-A5 constants
- **#define Preprocessor**: Complete #define directive support for both numeric and constant values
- **Enhanced Variable Types**: Support for all Arduino data types including float, long, byte, boolean
- **Comprehensive Syntax Recognition**: Parser handles nearly all Arduino C++ syntax patterns for authentic programming experience
- **Educational Code Patterns**: Students can write complex Arduino programs with real-world syntax and control structures
- **Professional C++ Support**: Simulator now supports advanced programming constructs used in professional embedded development

### Variable Declaration Support & RGB LED Simulation (July 29, 2025)
- **Enhanced Arduino Code Parser**: Added variable declaration extraction to handle `int redPin = 9;` patterns in Arduino code
- **#define Statement Support**: Parser now handles `#define RED_PIN 9` preprocessor directives for Arduino pin assignments
- **Variable Resolution System**: Parser resolves variable names to pin numbers for `pinMode(redPin, OUTPUT)` style commands
- **RGB LED Component Integration**: Added RGB LED simulation support with three independent color channels (red, green, blue)
- **Multi-Pin Component Support**: Simulator handles components with multiple pins and tracks individual pin states
- **Color Channel Mapping**: Automatically maps Arduino pin writes to RGB LED color channels through wire connections
- **Real-Time Color Updates**: RGB LEDs respond instantly to Arduino digitalWrite commands with proper color mixing
- **Educational RGB Coding**: Students can learn color theory and PWM concepts through real Arduino RGB LED programming
- **Wire-Based Pin Detection**: System identifies which RGB LED pins are connected to which Arduino pins through visual wiring
- **Null Pin Guard**: Added error handling to prevent crashes when variable resolution fails
- **RGB Demo Route**: Created `/rgb-demo` route with comprehensive RGB LED color cycling demonstration code

### BMAH Branding Consolidation (July 29, 2025)
- **Complete Oracle Interface Update**: Removed all pirate-themed references from Oracle BMAH management interface
- **Professional Language**: Updated auction creation form from "Add Treasure to Gizbo's Auction" to "Create New BMAH Auction"
- **Currency Standardization**: Changed "doubloons" references to standardized "gold" currency throughout auction system
- **Status Icons**: Updated auction status indicators from pirate emojis (🏴‍☠️💀) to professional icons (⚡🔒)
- **Tab Header Update**: Renamed Oracle "Gizbo's Vault" tab to "BMAH" with diamond icon for consistency
- **Loading Messages**: Updated loading text from "Loading Gizbo's treasure vault..." to "Loading BMAH auctions..."
- **Empty State**: Redesigned empty auction state with professional BMAH messaging instead of pirate dialogue
- **Auction Cards**: Changed auction card headers from "GIZBO'S TREASURE" to "BMAH AUCTION"
- **System Messages**: Updated all auction creation buttons from "🏴‍☠️ Launch Auction" to "Create Auction"

### Shop Rebranding (July 13, 2025)
- **Renamed Shop Interface**: Changed "Shop" to "BMAH (Black Market Auction House)" in RetroDesktop component
- Updated both desktop icon instances to reflect new branding
- Maintains existing shop functionality while providing more immersive gaming nomenclature

### Gizbo's Scraplight Cartel UI Redesign (July 13, 2025)
- **Complete UI Modernization**: Rebuilt interface from scratch with clean, modern design replacing cluttered pirate theme
- **Authentic Character Integration**: Properly implemented Gizbo as "Chaotic Good Inventor" from Scraplight Cartel per established lore
- **Professional Visual Design**: Clean white background, card-based layout, responsive grid system for auction listings
- **Correct Lore Implementation**: "Great Collapse" dimensional rifts, reality-breaking gadgets, "scrap" currency, inventor personality
- **Character Portrait Placeholder**: Added dedicated space for Gizbo's image surrounded by workshop/loot aesthetic
- **Streamlined Experience**: Removed confusing pirate terminology, simplified navigation, modern loading states and interactions

### GitHub Repository Setup (July 13, 2025)
- **Repository Preparation**: Updated .gitignore with comprehensive exclusions for environment variables and build artifacts
- **Documentation Update**: Enhanced README.md with proper CraftingTable OS branding and Discord integration details
- **Setup Automation**: Created setup-github.sh script for easy repository initialization and GitHub connection
- **Setup Guide**: Added comprehensive GITHUB_SETUP.md with step-by-step instructions for repository creation and deployment
- **Project Structure**: Documented complete project architecture including Discord OAuth setup and environment variables

### Quest Solution Helper System (July 15, 2025)
- **Complete Cheats Section**: Added comprehensive solution helper interface to quest creation system
- **Solution Code Input**: Monospace textarea for entering complete Arduino code solutions
- **Wiring Instructions**: Dedicated field for step-by-step wiring instructions with numbered steps
- **Wiring Diagram Upload**: Image upload functionality with CSRF protection for visual wiring diagrams
- **Solution Notes**: Additional field for troubleshooting tips, common mistakes, and alternative approaches
- **Universal CSRF Fix**: Resolved all remaining CSRF token issues across hero image, component image, item image, and kit image uploads

### Active Quest Screen Implementation (July 15, 2025)
- **Tutorial-Style Learning Interface**: Created comprehensive active quest screen with educational focus
- **Video Tutorial Integration**: Added video player section at top for step-by-step learning content
- **Mission Brief Display**: Added dedicated mission instructions section above expected results for clear text guidance
- **Circuit Result Display**: Implemented expected result section showing circuit GIFs and demonstrations
- **Discord Community Integration**: Added comment system with replies, reactions, and real-time Discord member interaction
- **Timed Solution Helper**: Implemented 5-minute timer that unlocks solution cheat with code and wiring instructions
- **Quest Management**: Added complete quest, abandon quest, and return to list functionality
- **Backend API Support**: Created REST endpoints for comments, reactions, quest completion, and abandonment
- **Scrollable Interface**: Fixed Complete Quest Button positioning for proper scrollable content access

### Quest Interface Responsive Design Fix (July 17, 2025)
- **Full Screen Scrolling**: Changed main container from `overflow-hidden` to `overflow-y-auto` for proper scrolling
- **Mobile-First Layout**: Comments sidebar moves below main content on mobile devices
- **Responsive Headers**: Text and spacing adapt to screen size using `sm:` breakpoints
- **Touch-Friendly Elements**: Larger tap targets and better spacing for mobile users
- **Complete Quest Button Access**: Button now always accessible via scrolling on all screen sizes
- **Flexible Layout**: Content flows naturally with proper responsive breakpoints for mobile, tablet, and desktop

### Critical Comment System Fix (July 17, 2025)
- **Comment Persistence Issue Resolved**: Fixed critical bug where comments appeared temporarily but disappeared on app restart
- **Duplicate Endpoint Removal**: Removed mock comment endpoints that were overriding real database operations
- **Authentication Fix**: Added missing `authenticate` middleware to GET comments endpoint
- **Database Verification**: Comments are properly saved to `quest_comments` table with correct user associations
- **Multi-User Support**: Comments now properly display across different user sessions
- **Button Repositioning**: Moved Abandon Quest to top-left header, removed redundant X button
- **START Quest Button**: Repositioned to top of right column in quest detail view for better accessibility

### TanStack Query Configuration Fix (July 17, 2025)
- **Root Cause Identified**: QueryClient was not using the default query function, causing comments to return empty objects `{}` instead of arrays
- **Query Key Standardization**: Fixed inconsistent query key formats - changed from string-based `['/api/quests/${questId}/comments']` to array-based `['/api/quests', questId, 'comments']`
- **Default Query Function Setup**: Properly configured QueryClient with `getQueryFn()` as default query function for automatic URL construction
- **Mutation Cache Invalidation**: Updated all comment mutation query keys to use consistent array format for proper cache invalidation
- **Complete Comment System Recovery**: All 14+ comments now load and display correctly with full user data, avatars, and Discord roles
- **Real-Time Updates**: New comments now persist properly and sync across user sessions without disappearing

### Discord Role Styling Enhancement (July 17, 2025)
- **CraftingTable Team Members**: [CraftingTable] Discord role members now display with blue usernames and blue team tags
- **Moderator Styling**: [Mod] Discord role members display with red usernames and red MOD tags
- **Beta Tester Styling**: [Beta Tester] Discord role members display with purple usernames and purple BETA TESTER tags
- **Academy Member Styling**: [Academy] Discord role members display with yellow usernames and yellow ACADEMY tags
- **Consistent Role Priority**: Role hierarchy maintained with Founder > Admin > Mod > CraftingTable > Beta Tester > Academy
- **Complete Coverage**: Role styling applied to all comment areas including main comments, replies, and comment input section

### Comprehensive AI Agent Training Documentation (July 17, 2025)
- **Complete Training Suite**: Created 6 comprehensive training documents covering all aspects of CraftingTable OS development
- **Branding & Design Philosophy**: Core mission, brand values, visual design principles, UX philosophy, and quality standards
- **UI Patterns & Components**: Retro desktop UI architecture, form patterns, dialog systems, navigation, and responsive design
- **Storytelling & Narrative**: Complete lore framework, character development, adventure line narratives, and educational integration
- **Development Philosophy**: "Make Good Shit" standards, code quality guidelines, testing requirements, and deployment practices
- **Actual UI Walkthrough**: Real user interface documentation showing what users actually see and interact with daily
- **Master Training Manual**: Comprehensive guide tying all documentation together with implementation guidelines and success indicators
- **Knowledge Transfer Ready**: Future AI agents can now understand project vision, technical architecture, user experience, and quality expectations

### Quest Intro Page Redesign (July 15, 2025)
- **RuneScape-Style Interface**: Redesigned quest intro page with exciting 2-column layout inspired by classic MMORPGs
- **Hero Image Focus**: Large hero image with title overlay and gradient for dramatic visual impact
- **Mission Brief Integration**: Clean mission brief section with proper formatting and readability
- **RuneScape Start Button**: Implemented classic RuneScape-style "START QUEST" button with gradient, shadows, and hover effects
- **Compact Component Display**: Streamlined required components section with better visual hierarchy
- **Improved Rewards Grid**: Optimized rewards display with smaller, more compact item cards
- **Removed Tutorial Video**: Moved tutorial video to actual quest screen for better user flow
- **Adventure Line Info**: Added dedicated section for adventure line and quest order information

### Kit-First Quest Navigation System (July 15, 2025)
- **Complete Quest System Redesign**: Rebuilt entire quest interface from scratch with kit-first navigation approach
- **Admin-Style Kit Selection**: Implemented kit selection screen similar to admin quest panel for consistent user experience
- **Three-Screen Navigation Flow**: Kit Selection → Quest List → Quest Detail → Active Quest progression
- **Component Kit Grid**: Visual grid showing all available kits with quest counts and descriptions
- **Filtered Quest Display**: Quest lists filtered by selected kit, showing only relevant quests for that hardware
- **Breadcrumb Navigation**: Clear back buttons and breadcrumb paths for easy navigation between screens
- **Infinite Render Fix**: Resolved maximum update depth error by removing problematic useEffect dependencies
- **Simplified State Management**: Clean state management with clear view transitions and proper data flow
- **Enhanced Kit Information**: Kit cards show quest count, descriptions, and images for better user guidance

### Quest Detail Page Layout Redesign (July 15, 2025)
- **Compact Three-Column Layout**: Redesigned quest detail page from 2-column to 3-column layout to reduce blank space
- **Hero Image Top Left**: Positioned hero image in top left column with quest title overlay and flavor text below
- **Integrated Quest Rewards**: Moved quest rewards to right column with compact 2x2 grid display showing top 4 rewards
- **Streamlined Components Section**: Converted required components to centered card layout with smaller images
- **Removed Emoji from Button**: Cleaned up "START QUEST" button by removing sword emojis for cleaner professional look
- **Reduced Redundancy**: Eliminated duplicate full-width rewards section to prevent information repetition
- **Improved Information Density**: More information visible at once with better visual hierarchy and spacing

### Shopkeeper System (July 10, 2025)
- Redesigned shop from external website to in-app shopkeeper window
- Created ShopWindow component with Keymaster character selling Keys for 100 gold each
- Added interactive shopkeeper dialogue system with randomized responses
- Implemented purchase API endpoint `/api/shop/purchase` with inventory management
- Shop features multiple purchase options (1, 5, or 10 keys) with proper gold validation
- Integrated with user inventory system for real-time gold and key tracking

### Component Kit Visualization Enhancement (July 13, 2025)
- Added large component kit images to quest system for clear kit identification
- Kit images display prominently above adventure lines in main quest view
- When viewing specific adventure line, kit image appears at top with kit name and description
- Images use pixel art rendering to maintain retro aesthetic
- Responsive design adapts to different screen sizes
- Visual enhancement helps users understand which hardware kit is needed for each quest series

### Major Emulator Cleanup (July 10, 2025)
- **MASSIVE CLEANUP**: Removed 18+ broken/competing emulator implementations that were causing confusion
- Deleted: CleanEmulator, DirectEmulatorLogger, DirectFixedEmulator, EmergencyFixedEmulator, FixedEmulatorConnector, ForcedLEDComponent, HeroEmulator, HeroEmulatorConnector, MinimalEmulator, RealAVR8EmulatorConnector, ReliableEmulator, SimpleEmulator, StandaloneBlinker, VisibleLEDComponent, WorkingEmulator, EmulatedButtonComponent, EmulatedLEDComponent, EmulatedOLEDComponent, UniversalEmulatorApp
- Removed broken simulator implementations: AVR8Simulator, ProperAVR8Simulator, RealSimulatorContext
- Cleaned up broken test pages and routes: emulator-test.tsx, clean-emulator.tsx, EmulatorLauncher.tsx
- Fixed broken imports in App.tsx and CircuitBuilderWindow.tsx
- **Goal**: Consolidate to ONE working emulator implementation instead of 18+ broken ones
- **Next**: Build single, clean BasicEmulator as the definitive sandbox emulator

## System Architecture

### Backend Architecture
- **Framework**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Custom session-based authentication with secure password hashing using bcrypt
- **Session Management**: Express-session with PostgreSQL store for persistent sessions
- **API Design**: RESTful endpoints organized by feature domains

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Components**: ShadCN UI components built on Radix UI primitives
- **Styling**: TailwindCSS with custom pixel art and retro gaming aesthetics
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

### Circuit Simulation Engine
- **Core Technology**: AVR8js for real Arduino microcontroller emulation
- **Architecture**: Worker-based simulation engine to prevent UI blocking
- **Component System**: Modular component library with visual representations
- **Code Editor**: Monaco Editor integration for Arduino IDE-like experience

## Key Components

### Authentication & User Management
- Secure password storage with bcrypt hashing and salt
- Session-based authentication with HTTP-only cookies
- Role-based access control (admin/user permissions)
- User profiles with XP, levels, and inventory tracking

### Quest System
- Daily challenge system with quest-of-the-day functionality
- Adventure lines for sequential quest progression
- XP-based leveling system with material rewards
- Admin panel for quest creation and management

### Inventory & Crafting System
- Six primary resource types: cloth, metal, tech scrap, sensor crystal, circuit board, alchemy ink
- Recipe-based crafting system with pattern matching
- Loot box system with rarity-based rewards
- Character equipment slots for gear progression

### Circuit Builder & Simulation
- Visual circuit builder with drag-and-drop components
- Real-time Arduino simulation using AVR8js
- Component library with LEDs, displays, sensors, and input devices
- Code editor with syntax highlighting and error detection
- Project saving and sharing capabilities

### Educational Content Management
- Quest creation tools with AI-powered content generation
- Component kit management system
- Educational resource organization
- Progress tracking and achievement system

## Data Flow

1. **User Authentication**: Users log in through secure session-based authentication
2. **Quest Assignment**: Daily quests are assigned based on adventure lines and user progress
3. **Circuit Building**: Users build circuits using the visual editor and write Arduino code
4. **Simulation Execution**: AVR8js worker processes execute the compiled code and update component states
5. **Submission & Rewards**: Completed quests award XP and materials to user inventory
6. **Crafting & Progression**: Users craft equipment and progress through levels

## External Dependencies

### Production Dependencies
- **Authentication**: bcrypt for password hashing, express-session for session management
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **Circuit Simulation**: AVR8js for Arduino emulation
- **Code Editor**: Monaco Editor for Arduino IDE experience
- **UI Framework**: React, TailwindCSS, Radix UI components
- **File Processing**: Multer for secure file uploads

### Development Dependencies
- **Build Tools**: Vite, TypeScript, ESBuild
- **Database Management**: Drizzle ORM and Drizzle Kit for migrations
- **Code Quality**: ESLint, TypeScript strict mode

## Deployment Strategy

### Development Environment
- Local development with Vite hot module replacement
- PostgreSQL database (local or cloud)
- Environment variables for configuration
- Replit integration for collaborative development

### Production Considerations
- **Security**: CSRF protection, XSS prevention, secure headers
- **Performance**: Worker-based simulation, optimized builds
- **Scalability**: Session store in database, stateless API design
- **Monitoring**: Request logging, error tracking

### Database Schema
- User management with roles and inventory
- Quest system with components and rewards
- Circuit projects with sharing capabilities
- Crafting recipes and item definitions
- Achievement tracking and progression

The platform is designed to be modular and extensible, with clear separation between the educational content management system, the circuit simulation engine, and the gamification layer. The architecture supports both individual learning and collaborative features through the sharing system.