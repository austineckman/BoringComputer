# CraftingTable OS - UI Patterns & Component Guide

## Retro Desktop UI Architecture

### Window System Patterns

#### Standard Window Structure
```typescript
interface RetroWindow {
  // Title bar with icon, title text, and window controls
  titleBar: {
    icon: string;           // 16x16 pixel art icon
    title: string;          // Application or document name
    controls: {
      minimize: boolean;    // Standard minimize button
      maximize: boolean;    // Maximize/restore button
      close: boolean;       // X close button
    };
  };
  
  // Optional menu bar for complex applications
  menuBar?: {
    menus: MenuItem[];      // File, Edit, View, etc.
  };
  
  // Optional toolbar for common actions
  toolbar?: {
    buttons: ToolbarButton[];
    separator?: boolean;
  };
  
  // Main content area
  content: ReactNode;
  
  // Optional status bar
  statusBar?: {
    text: string;
    progressBar?: number;   // 0-100 percentage
  };
}
```

#### Window Behavior Standards
- **Focus**: Active window has blue title bar, inactive windows are gray
- **Z-Index Management**: Focused windows automatically come to front
- **Resize Behavior**: 8-point resize handles (corners + sides)
- **Minimize Animation**: Slides down to taskbar position
- **Maximize Behavior**: Toggles between windowed and full-screen
- **Modal Dialogs**: Disable parent window, center on screen

### Desktop Environment Components

#### Taskbar Design Pattern
```jsx
<Taskbar className="fixed bottom-0 w-full h-10 bg-retro-gray border-t-2 border-retro-light">
  <StartButton />
  <QuickLaunch apps={['circuit-builder', 'quest-giver']} />
  <WindowButtons windows={activeWindows} />
  <SystemTray>
    <VolumeControl />
    <NetworkStatus />
    <Clock />
  </SystemTray>
</Taskbar>
```

#### Start Menu Architecture
```jsx
<StartMenu>
  <UserProfile>
    <Avatar src={user.avatar} />
    <DisplayName>{user.displayName}</DisplayName>
    <Level>Level {user.level}</Level>
  </UserProfile>
  
  <MenuSection title="Programs">
    <MenuItem icon="circuit-builder" onClick={() => openApp('circuit-builder')}>
      Circuit Builder Pro
    </MenuItem>
    <MenuItem icon="quest-giver" onClick={() => openApp('quest-giver')}>
      Quest Missions
    </MenuItem>
    <MenuItem icon="gizbo-forge" onClick={() => openApp('gizbo-forge')}>
      Gizbo's Forge
    </MenuItem>
  </MenuSection>
  
  <MenuSection title="System">
    <MenuItem icon="settings" onClick={() => openApp('settings')}>
      Settings
    </MenuItem>
    <MenuItem icon="help" onClick={() => openApp('help')}>
      Help & Support
    </MenuItem>
  </MenuSection>
  
  <PowerButtons>
    <MenuItem icon="logout" onClick={handleLogout}>Log Out</MenuItem>
  </PowerButtons>
</StartMenu>
```

### Form Design Patterns

#### Standard Input Components
```jsx
// Text Input with Retro Styling
<div className="form-group">
  <label className="form-label">Component Name</label>
  <input 
    type="text"
    className="retro-input"
    placeholder="Enter component name..."
  />
  <div className="form-help">Choose a descriptive name for your component</div>
</div>

// Dropdown Selection
<div className="form-group">
  <label className="form-label">Adventure Line</label>
  <select className="retro-select">
    <option value="">Select adventure line...</option>
    <option value="space">30 Days Lost in Space</option>
    <option value="academy">Cogsworth Academy</option>
    <option value="neon">Neon Realm</option>
  </select>
</div>

// Checkbox Group
<fieldset className="checkbox-group">
  <legend>Required Components</legend>
  <label className="checkbox-item">
    <input type="checkbox" value="led" />
    <span>LED (5mm Red)</span>
  </label>
  <label className="checkbox-item">
    <input type="checkbox" value="resistor" />
    <span>220Ω Resistor</span>
  </label>
</fieldset>
```

#### Form Validation Patterns
```jsx
// Error State
<div className="form-group has-error">
  <label className="form-label">Email Address</label>
  <input 
    type="email"
    className="retro-input error"
    value={email}
    onChange={handleEmailChange}
  />
  <div className="error-message">
    <Icon name="warning" />
    Please enter a valid email address
  </div>
</div>

// Success State
<div className="form-group has-success">
  <label className="form-label">Username</label>
  <input 
    type="text"
    className="retro-input success"
    value={username}
  />
  <div className="success-message">
    <Icon name="check" />
    Username is available
  </div>
</div>
```

### Button Design System

#### Primary Action Buttons
```jsx
// Main Call-to-Action
<button className="btn btn-primary">
  Start Quest
</button>

// Secondary Actions
<button className="btn btn-secondary">
  Save Draft
</button>

// Danger Actions
<button className="btn btn-danger">
  Delete Project
</button>

// Icon Buttons
<button className="btn btn-icon">
  <Icon name="save" />
  Save
</button>

// Toolbar Buttons
<button className="btn btn-toolbar">
  <Icon name="copy" />
</button>
```

#### Button State Management
```jsx
// Loading State
<button className="btn btn-primary" disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner size="sm" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</button>

// Toggle Button
<button 
  className={`btn btn-toggle ${isActive ? 'active' : ''}`}
  onClick={handleToggle}
>
  <Icon name={isActive ? 'volume-on' : 'volume-off'} />
  {isActive ? 'Mute' : 'Unmute'}
</button>
```

### Dialog and Modal Patterns

#### Standard Dialog Structure
```jsx
<Dialog open={isOpen} onClose={handleClose}>
  <DialogTitle icon="warning">
    Confirm Deletion
  </DialogTitle>
  
  <DialogContent>
    <p>Are you sure you want to delete this circuit project?</p>
    <p><strong>This action cannot be undone.</strong></p>
  </DialogContent>
  
  <DialogActions>
    <button className="btn btn-secondary" onClick={handleClose}>
      Cancel
    </button>
    <button className="btn btn-danger" onClick={handleConfirm}>
      Delete Project
    </button>
  </DialogActions>
</Dialog>
```

#### Wizard Dialog Pattern
```jsx
<WizardDialog steps={wizardSteps} currentStep={currentStep}>
  <WizardHeader>
    <ProgressBar value={currentStep} max={wizardSteps.length} />
    <Title>New Quest Creation</Title>
  </WizardHeader>
  
  <WizardContent>
    {currentStep === 1 && <BasicInfoStep />}
    {currentStep === 2 && <ObjectivesStep />}
    {currentStep === 3 && <RewardsStep />}
    {currentStep === 4 && <ReviewStep />}
  </WizardContent>
  
  <WizardActions>
    <button 
      className="btn btn-secondary" 
      onClick={handlePrevious}
      disabled={currentStep === 1}
    >
      Previous
    </button>
    <button 
      className="btn btn-primary" 
      onClick={currentStep === wizardSteps.length ? handleFinish : handleNext}
    >
      {currentStep === wizardSteps.length ? 'Create Quest' : 'Next'}
    </button>
  </WizardActions>
</WizardDialog>
```

### Data Display Patterns

#### Table Design
```jsx
<Table className="retro-table">
  <TableHeader>
    <TableRow>
      <TableHead sortable onClick={() => handleSort('name')}>
        Component Name
        <SortIcon direction={sortOrder.name} />
      </TableHead>
      <TableHead>Type</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  
  <TableBody>
    {components.map(component => (
      <TableRow key={component.id}>
        <TableCell>
          <div className="flex items-center">
            <Icon name={component.icon} />
            {component.name}
          </div>
        </TableCell>
        <TableCell>{component.type}</TableCell>
        <TableCell>
          <StatusBadge status={component.status} />
        </TableCell>
        <TableCell>
          <ActionMenu>
            <MenuItem onClick={() => handleEdit(component.id)}>Edit</MenuItem>
            <MenuItem onClick={() => handleDuplicate(component.id)}>Duplicate</MenuItem>
            <MenuItem onClick={() => handleDelete(component.id)} danger>Delete</MenuItem>
          </ActionMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Card Layout Patterns
```jsx
// Information Card
<Card className="info-card">
  <CardHeader>
    <Icon name="quest" />
    <Title>Daily Quest</Title>
    <Badge variant="new">New</Badge>
  </CardHeader>
  
  <CardContent>
    <Description>
      Build a LED brightness controller using a potentiometer and PWM.
    </Description>
    <MetaInfo>
      <span>Difficulty: ⭐⭐⭐</span>
      <span>XP Reward: 300</span>
      <span>Estimated Time: 45 min</span>
    </MetaInfo>
  </CardContent>
  
  <CardActions>
    <button className="btn btn-primary">Start Quest</button>
    <button className="btn btn-secondary">Learn More</button>
  </CardActions>
</Card>

// Stats Card
<Card className="stats-card">
  <CardHeader>
    <Icon name="trophy" />
    <Title>Your Progress</Title>
  </CardHeader>
  
  <CardContent>
    <StatItem label="Level" value={user.level} />
    <StatItem label="XP" value={`${user.xp} / ${user.xpToNextLevel}`} />
    <StatItem label="Quests Completed" value={user.completedQuests.length} />
    <ProgressBar 
      value={user.xp} 
      max={user.xpToNextLevel} 
      label="Progress to Next Level"
    />
  </CardContent>
</Card>
```

### Navigation Patterns

#### Sidebar Navigation
```jsx
<Sidebar>
  <SidebarHeader>
    <Logo />
    <UserMenu />
  </SidebarHeader>
  
  <SidebarContent>
    <NavSection title="Learning">
      <NavItem icon="quest" active href="/quests">
        Quest Missions
      </NavItem>
      <NavItem icon="circuit" href="/circuit-builder">
        Circuit Builder
      </NavItem>
      <NavItem icon="inventory" href="/inventory">
        Inventory
      </NavItem>
    </NavSection>
    
    <NavSection title="Community">
      <NavItem icon="auction" href="/auction">
        Gizbo's Auction
      </NavItem>
      <NavItem icon="chat" href="/discord">
        Discord Chat
      </NavItem>
    </NavSection>
  </SidebarContent>
</Sidebar>
```

#### Breadcrumb Navigation
```jsx
<Breadcrumbs>
  <BreadcrumbItem href="/quests">
    <Icon name="quest" />
    Quests
  </BreadcrumbItem>
  <BreadcrumbItem href="/quests/space">
    30 Days Lost in Space
  </BreadcrumbItem>
  <BreadcrumbItem current>
    Emergency Power Systems
  </BreadcrumbItem>
</Breadcrumbs>
```

### Loading and Empty State Patterns

#### Loading States
```jsx
// Skeleton Loading
<SkeletonLoader>
  <SkeletonText lines={3} />
  <SkeletonCard />
  <SkeletonButton />
</SkeletonLoader>

// Spinner Loading
<LoadingSpinner size="lg" message="Loading quest data..." />

// Progressive Loading
<ProgressLoader 
  steps={['Loading components', 'Initializing simulator', 'Ready!']}
  currentStep={2}
/>
```

#### Empty States
```jsx
// No Content Empty State
<EmptyState>
  <Icon name="quest" size="xl" />
  <Title>No Quests Available</Title>
  <Description>
    Check back later for new quest missions, or create your own!
  </Description>
  <Actions>
    <button className="btn btn-primary">Create Custom Quest</button>
    <button className="btn btn-secondary">Browse Tutorial</button>
  </Actions>
</EmptyState>

// Search Results Empty State
<EmptyState>
  <Icon name="search" size="xl" />
  <Title>No Results Found</Title>
  <Description>
    Try adjusting your search terms or browse all components.
  </Description>
  <Actions>
    <button className="btn btn-secondary" onClick={clearSearch}>
      Clear Search
    </button>
  </Actions>
</EmptyState>
```

### Interactive Component Patterns

#### Drag and Drop
```jsx
<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="component-list">
    {(provided) => (
      <div ref={provided.innerRef} {...provided.droppableProps}>
        {components.map((component, index) => (
          <Draggable key={component.id} draggableId={component.id} index={index}>
            {(provided, snapshot) => (
              <ComponentCard
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                isDragging={snapshot.isDragging}
                component={component}
              />
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

#### Resizable Panels
```jsx
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={30}>
    <ComponentLibrary />
  </ResizablePanel>
  
  <ResizableHandle />
  
  <ResizablePanel defaultSize={50}>
    <CircuitCanvas />
  </ResizablePanel>
  
  <ResizableHandle />
  
  <ResizablePanel defaultSize={20}>
    <PropertiesPanel />
  </ResizablePanel>
</ResizablePanelGroup>
```

### Animation Patterns

#### Micro-Interactions
```css
/* Button hover animation */
.btn {
  transition: all 0.2s ease;
  transform: translateY(0);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Loading pulse animation */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
```

#### Page Transitions
```jsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
  >
    {currentView === 'quests' && <QuestList />}
    {currentView === 'circuit' && <CircuitBuilder />}
    {currentView === 'inventory' && <Inventory />}
  </motion.div>
</AnimatePresence>
```

### Responsive Design Patterns

#### Mobile-First Breakpoints
```css
/* Mobile (default) */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop */
@media (min-width: 1280px) {
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

#### Responsive Window Management
```jsx
// Mobile: Fullscreen windows
// Tablet: Floating windows with constraints
// Desktop: Full window management

const WindowManager = ({ isMobile, isTablet }) => {
  if (isMobile) {
    return <FullscreenWindowManager />;
  }
  
  if (isTablet) {
    return <ConstrainedWindowManager />;
  }
  
  return <DesktopWindowManager />;
};
```

---

This component guide ensures consistent, high-quality UI patterns throughout CraftingTable OS, maintaining the authentic retro computing feel while providing modern usability and accessibility.