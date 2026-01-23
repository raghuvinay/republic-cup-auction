/**
 * Football Auction - Presentation View Application
 * Handles all display logic, animations, and keyboard shortcuts
 */

class AuctionPresentation {
  constructor() {
    // State
    this.config = null;
    this.players = [];
    this.managers = [];
    this.currentView = 'welcome';
    this.currentPlayer = null;
    this.currentBid = 0;
    this.bidHistory = [];
    this.auctionPhase = 'idle'; // idle, teaser, reveal, bidding, sold

    // DOM Elements cache
    this.views = {};
    this.elements = {};

    // Initialize
    this.init();
  }

  async init() {
    try {
      // Load data
      await this.loadData();

      // Cache DOM elements
      this.cacheElements();

      // Setup views
      this.setupViews();

      // Setup keyboard shortcuts
      this.setupKeyboardShortcuts();

      // Setup sync listeners
      this.setupSyncListeners();

      // Show initial view
      this.showView('welcome');

      // Update header
      this.updateHeader();

      console.log('Presentation initialized successfully');
    } catch (error) {
      console.error('Failed to initialize presentation:', error);
      this.showError('Failed to load auction data. Please check the console.');
    }
  }

  async loadData() {
    try {
      const [configRes, playersRes, managersRes] = await Promise.all([
        fetch('data/config.json'),
        fetch('data/players.json'),
        fetch('data/managers.json')
      ]);

      this.config = await configRes.json();
      const playersData = await playersRes.json();
      const managersData = await managersRes.json();

      this.players = playersData.players;
      this.managers = managersData.managers;

      // Load saved state if exists
      const savedState = auctionSync.loadState();
      if (savedState) {
        this.restoreState(savedState);
      }

      console.log('Data loaded:', {
        players: this.players.length,
        managers: this.managers.length
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      throw error;
    }
  }

  cacheElements() {
    // Views
    this.views = {
      welcome: document.getElementById('welcomeView'),
      teaser: document.getElementById('teaserView'),
      reveal: document.getElementById('revealView'),
      auction: document.getElementById('auctionView'),
      master: document.getElementById('masterView'),
      team1: document.getElementById('teamView1'),
      team2: document.getElementById('teamView2'),
      team3: document.getElementById('teamView3'),
      team4: document.getElementById('teamView4'),
      budget: document.getElementById('budgetView'),
      soldlist: document.getElementById('soldlistView'),
      transfer: document.getElementById('transferView')
    };

    // Header elements
    this.elements.tournamentName = document.getElementById('tournamentName');
    this.elements.welcomeTitle = document.getElementById('welcomeTitle');
    this.elements.playersSold = document.getElementById('playersSold');
    this.elements.currentViewLabel = document.getElementById('currentViewLabel');

    // Teaser elements
    this.elements.teaserFunFact = document.getElementById('teaserFunFact');
    this.elements.teaserCategory = document.getElementById('teaserCategory');

    // Reveal elements
    this.elements.revealCardWrapper = document.getElementById('revealCardWrapper');
    this.elements.revealInfo = document.getElementById('revealInfo');
    this.elements.revealBasePrice = document.getElementById('revealBasePrice');
    this.elements.playerCard = document.getElementById('playerCard');

    // Reveal card details
    this.elements.cardOverall = document.getElementById('cardOverall');
    this.elements.cardPosition = document.getElementById('cardPosition');
    this.elements.cardTrait = document.getElementById('cardTrait');
    this.elements.cardPhoto = document.getElementById('cardPhoto');
    this.elements.cardPhotoPlaceholder = document.getElementById('cardPhotoPlaceholder');
    this.elements.cardName = document.getElementById('cardName');
    this.elements.attrPace = document.getElementById('attrPace');
    this.elements.attrShooting = document.getElementById('attrShooting');
    this.elements.attrPassing = document.getElementById('attrPassing');
    this.elements.attrDribbling = document.getElementById('attrDribbling');
    this.elements.attrDefense = document.getElementById('attrDefense');
    this.elements.attrPhysical = document.getElementById('attrPhysical');

    // Auction view elements
    this.elements.currentBidDisplay = document.getElementById('currentBidDisplay');
    this.elements.bidHistoryItems = document.getElementById('bidHistoryItems');

    // Auction card details
    this.elements.auctionCardOverall = document.getElementById('auctionCardOverall');
    this.elements.auctionCardPosition = document.getElementById('auctionCardPosition');
    this.elements.auctionCardTrait = document.getElementById('auctionCardTrait');
    this.elements.auctionCardPhoto = document.getElementById('auctionCardPhoto');
    this.elements.auctionCardPhotoPlaceholder = document.getElementById('auctionCardPhotoPlaceholder');
    this.elements.auctionCardName = document.getElementById('auctionCardName');
    this.elements.auctionAttrPace = document.getElementById('auctionAttrPace');
    this.elements.auctionAttrShooting = document.getElementById('auctionAttrShooting');
    this.elements.auctionAttrPassing = document.getElementById('auctionAttrPassing');
    this.elements.auctionAttrDribbling = document.getElementById('auctionAttrDribbling');
    this.elements.auctionAttrDefense = document.getElementById('auctionAttrDefense');
    this.elements.auctionAttrPhysical = document.getElementById('auctionAttrPhysical');

    // Sold overlay elements
    this.elements.soldOverlay = document.getElementById('soldOverlay');
    this.elements.soldPlayerName = document.getElementById('soldPlayerName');
    this.elements.soldToTeam = document.getElementById('soldToTeam');
    this.elements.soldPrice = document.getElementById('soldPrice');

    // Dashboard elements
    this.elements.masterView = document.getElementById('masterView');
    this.elements.budgetCards = document.getElementById('budgetCards');
    this.elements.soldPlayersList = document.getElementById('soldPlayersList');
    this.elements.unsoldPlayersList = document.getElementById('unsoldPlayersList');
  }

  setupViews() {
    // Generate dynamic views
    this.generateMasterView();
    this.generateTeamViews();
    this.generateBudgetView();
    this.generateManagersPanel();
    this.updateSoldUnsoldLists();
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ': // Space - Next/Reveal
          e.preventDefault();
          this.handleSpacePress();
          break;
        case '1':
          this.showView('team1');
          break;
        case '2':
          this.showView('team2');
          break;
        case '3':
          this.showView('team3');
          break;
        case '4':
          this.showView('team4');
          break;
        case 'm':
        case 'M':
          this.showView('master');
          break;
        case 'b':
        case 'B':
          this.showView('budget');
          break;
        case 's':
        case 'S':
          this.showView('soldlist');
          break;
        case 't':
        case 'T':
          // Only show transfer if a sale was completed
          if (this.auctionPhase === 'sold' || this.players.some(p => p.status === 'sold')) {
            this.showView('transfer');
          }
          break;
        case 'Escape':
          this.showView('auction');
          break;
        case 'w':
        case 'W':
          this.showView('welcome');
          break;
      }
    });
  }

  setupSyncListeners() {
    // Listen for view changes
    auctionSync.on(SYNC_MESSAGES.CHANGE_VIEW, (data) => {
      this.showView(data.view);
    });

    // Listen for player selection
    auctionSync.on(SYNC_MESSAGES.SELECT_PLAYER, (data) => {
      this.selectPlayer(data.playerId);
    });

    // Listen for teaser
    auctionSync.on(SYNC_MESSAGES.SHOW_TEASER, (data) => {
      this.showTeaser();
    });

    // Listen for reveal
    auctionSync.on(SYNC_MESSAGES.REVEAL_PLAYER, (data) => {
      this.revealPlayer();
    });

    // Listen for bidding start
    auctionSync.on(SYNC_MESSAGES.START_BIDDING, (data) => {
      this.startBidding();
    });

    // Listen for bid updates
// Listen for bid updates
    auctionSync.on(SYNC_MESSAGES.UPDATE_BID, (data) => {
      this.updateBid(data.amount, data.history, data.managerId, data.budgetInfo);
    });
    // Listen for sold
    auctionSync.on(SYNC_MESSAGES.PLAYER_SOLD, (data) => {
      this.markSold(data.managerId, data.price);
    });

    // Listen for unsold
    auctionSync.on(SYNC_MESSAGES.PLAYER_UNSOLD, (data) => {
      this.markUnsold();
    });

    // Listen for state sync
    auctionSync.on(SYNC_MESSAGES.SYNC_STATE, (data) => {
      this.restoreState(data);
      this.setupViews();
    });

    // Listen for manager updates
    auctionSync.on(SYNC_MESSAGES.UPDATE_MANAGERS, (data) => {
      this.managers = data.managers;
      this.generateMasterView();
      this.generateTeamViews();
      this.generateBudgetView();
    });

    // Listen for player updates
    auctionSync.on(SYNC_MESSAGES.UPDATE_PLAYERS, (data) => {
      this.players = data.players;
      this.updateSoldUnsoldLists();
    });

    // Listen for lineup updates
    auctionSync.on(SYNC_MESSAGES.UPDATE_LINEUP, (data) => {
      const manager = this.managers.find(m => m.id === data.managerId);
      if (manager) {
        manager.players = data.players;
        this.generateTeamViews();
        this.generateMasterView();
      }
    });

    // Respond to state requests
    auctionSync.on(SYNC_MESSAGES.REQUEST_STATE, () => {
      auctionSync.send(SYNC_MESSAGES.SYNC_STATE, this.getState());
    });
  }

  // ===============================
  // VIEW MANAGEMENT
  // ===============================

  showView(viewName) {
    // If auction view is requested but we just completed a sale, show transfer instead
    if (viewName === 'auction' && this.auctionPhase === 'sold') {
      viewName = 'transfer';
    }

    // Hide all views
    Object.values(this.views).forEach(view => {
      if (view) {
        view.classList.remove('active');
      }
    });

    // Show requested view
    const view = this.views[viewName];
    if (view) {
      view.classList.add('active');
      this.currentView = viewName;
      this.updateViewLabel(viewName);

      // Refresh dynamic views
      if (viewName === 'master') {
        this.generateMasterView();
      } else if (viewName.startsWith('team')) {
        this.generateTeamViews();
      } else if (viewName === 'budget') {
        this.generateBudgetView();
      } else if (viewName === 'soldlist') {
        this.updateSoldUnsoldLists();
      } else if (viewName === 'auction') {
        this.generateManagersPanel();
      }
    }
  }

  updateViewLabel(viewName) {
    const labels = {
      welcome: 'Welcome',
      teaser: 'Teaser',
      reveal: 'Reveal',
      auction: 'Auction',
      transfer: 'Transfer Complete',
      master: 'All Teams',
      team1: 'Team 1',
      team2: 'Team 2',
      team3: 'Team 3',
      team4: 'Team 4',
      budget: 'Budget',
      soldlist: 'Sold/Unsold'
    };
    this.elements.currentViewLabel.textContent = labels[viewName] || viewName;
  }

  // ===============================
  // AUCTION FLOW
  // ===============================

  handleSpacePress() {
    switch (this.auctionPhase) {
      case 'teaser':
        this.revealPlayer();
        break;
      case 'reveal':
        this.startBidding();
        break;
      default:
        // Do nothing - wait for control panel
        break;
    }
  }

  selectPlayer(playerId) {
    this.currentPlayer = this.players.find(p => p.id === playerId);
    if (!this.currentPlayer) {
      console.error('Player not found:', playerId);
      return;
    }

    this.currentBid = this.currentPlayer.basePrice;
    this.bidHistory = [];
    this.auctionPhase = 'selected';

    console.log('Selected player:', this.currentPlayer.name);
  }

  showTeaser() {
    if (!this.currentPlayer) {
      console.error('No player selected for teaser');
      return;
    }

    const player = this.currentPlayer;
    const category = player.category;
    const teaserView = this.views.teaser;

    // Set position-based color theme
    teaserView.classList.remove('pos-GK', 'pos-DEF', 'pos-MID', 'pos-ATT');
    teaserView.classList.add(`pos-${category}`);

    // Update fun fact (THE STAR)
    const funFactEl = document.getElementById('teaserFunFact');
    if (funFactEl) funFactEl.textContent = player.funFact;

    // Update position badge and label
    const categoryEl = document.getElementById('teaserCategory');
    if (categoryEl) categoryEl.textContent = category;

    const posNameEl = document.getElementById('teaserPositionName');
    if (posNameEl) posNameEl.textContent = this.config.categoryNames[category] || category;

    // Update position icon
    const posIcons = { 'GK': '🧤', 'DEF': '🛡️', 'MID': '⚙️', 'ATT': '⚔️' };
    const posIconEl = document.getElementById('teaserPositionIcon');
    if (posIconEl) posIconEl.textContent = posIcons[category] || '⚽';

    // Update base price
    const basePriceEl = document.getElementById('teaserBasePrice');
    if (basePriceEl) basePriceEl.textContent = this.formatCurrency(player.basePrice);

    // Update stat hints (blurred preview of player abilities)
    const attrs = player.attributes;
    this.updateStatHint('hintPaceFill', attrs.pace);
    this.updateStatHint('hintPowerFill', (attrs.physical + attrs.defense) / 2);
    this.updateStatHint('hintSkillFill', (attrs.dribbling + attrs.passing) / 2);

    // Show teaser view
    this.showView('teaser');
    this.auctionPhase = 'teaser';
  }

  updateStatHint(elementId, value) {
    const el = document.getElementById(elementId);
    if (el) {
      // Slightly randomize to keep it mysterious (±10)
      const displayValue = Math.min(100, Math.max(20, value + (Math.random() * 20 - 10)));
      el.style.width = `${displayValue}%`;
    }
  }

  revealPlayer() {
    if (!this.currentPlayer) {
      console.error('No player selected for reveal');
      return;
    }

    // Update card content
    this.updatePlayerCard(this.currentPlayer, 'reveal');

    // Reset card state
    this.elements.revealCardWrapper.classList.remove('revealed');
    this.elements.revealInfo.classList.remove('visible');
    this.elements.playerCard.classList.remove('flipped');

    // Show reveal view
    this.showView('reveal');

    // Animate reveal
    setTimeout(() => {
      this.elements.revealCardWrapper.classList.add('revealed');
    }, 100);

    setTimeout(() => {
      this.elements.playerCard.classList.add('flipped');
    }, 600);

    setTimeout(() => {
      this.elements.revealInfo.classList.add('visible');
    }, 1200);

    this.auctionPhase = 'reveal';
  }

  startBidding() {
    if (!this.currentPlayer) {
      console.error('No player selected for bidding');
      return;
    }

    // Update auction view card
    this.updatePlayerCard(this.currentPlayer, 'auction');

    // Update bid display
    this.updateBidDisplay();

    // Show auction view
    this.showView('auction');
    this.auctionPhase = 'bidding';
  }

updateBid(amount, history = [], managerId = null, budgetInfo = null) {
    this.currentBid = amount;
    if (history.length > 0) {
      this.bidHistory = history;
    }
    this.updateBidDisplay();

    // Update managers panel with active bidder highlighted
    this.generateManagersPanel(managerId);

    // TRIGGER ANIMATION
    if (managerId) {
        this.triggerBidAnimation(managerId, amount);
    }
  }

  updateBidderPurse(managerId, bidAmount, budgetInfo = null) {
    const purseDisplay = document.getElementById('bidderPurseDisplay');

    if (!managerId) {
      purseDisplay.style.display = 'none';
      return;
    }

    const manager = this.managers.find(m => m.id === managerId);
    if (!manager) {
      purseDisplay.style.display = 'none';
      return;
    }

    // Show the purse display
    purseDisplay.style.display = 'flex';

    // Update bidder info
    document.getElementById('bidderPhoto').src = manager.photo || '';
    document.getElementById('bidderName').textContent = manager.name;
    document.getElementById('bidderTeam').textContent = manager.teamName;

    // Update squad status
    const playersOwned = budgetInfo ? budgetInfo.playersOwned : (manager.players ? manager.players.length : 0);
    const playersPerTeam = this.config.playersPerTeam || 7;
    document.getElementById('bidderSquadStatus').textContent = `${playersOwned}/${playersPerTeam} Players`;

    // Update purse amounts
    const currentPurse = budgetInfo ? budgetInfo.totalBudget : manager.budget;
    const maxSpendable = budgetInfo ? budgetInfo.maxSpendable : currentPurse;
    const purseAfterBid = currentPurse - bidAmount;

    document.getElementById('purseAmount').textContent = this.formatCurrency(currentPurse);
    document.getElementById('purseMax').textContent = this.formatCurrency(maxSpendable);

    const purseAfterEl = document.getElementById('purseAfter');
    purseAfterEl.textContent = this.formatCurrency(purseAfterBid);

    // Add warning class if purse will be low after bid or near max
    const isNearMax = bidAmount >= maxSpendable * 0.9;
    if (purseAfterBid < 10000000 || isNearMax) {
      purseAfterEl.classList.add('low');
    } else {
      purseAfterEl.classList.remove('low');
    }

    // Update border color to match team
    purseDisplay.style.borderColor = manager.primaryColor || 'var(--accent-secondary)';
  }

  triggerBidAnimation(managerId, amount) {
      const manager = this.managers.find(m => m.id === managerId);
      if (!manager) return;

      const overlay = document.getElementById('bidAnimation');
      const photo = document.getElementById('bidAnimPhoto');
      const amountEl = document.getElementById('bidAnimAmount');
      const nameEl = document.getElementById('bidAnimName');

      // Set Content
      photo.src = manager.photo || `assets/teams/team${manager.id}.png`;
      amountEl.textContent = this.formatCurrency(amount);
      nameEl.textContent = manager.name;
      
      // Play Animation
      overlay.classList.remove('hidden');
      // Force reflow
      void overlay.offsetWidth; 
      overlay.classList.add('active');

      // Hide after 1.5 seconds
      if (this.bidAnimTimeout) clearTimeout(this.bidAnimTimeout);
      this.bidAnimTimeout = setTimeout(() => {
          overlay.classList.remove('active');
          setTimeout(() => overlay.classList.add('hidden'), 300);
      }, 1500);
  }

  updateBidDisplay() {
    this.elements.currentBidDisplay.textContent = this.formatCurrency(this.currentBid);

    // Update bid history
    this.elements.bidHistoryItems.innerHTML = this.bidHistory
      .slice(-5)
      .reverse()
      .map(bid => `
        <div class="bid-history-item">
          <span>${bid.manager || 'Bid'}</span>
          <span>${this.formatCurrency(bid.amount)}</span>
        </div>
      `).join('');
  }

  markSold(managerId, price) {
    if (!this.currentPlayer) return;

    const manager = this.managers.find(m => m.id === managerId);
    if (!manager) {
      console.error('Manager not found:', managerId);
      return;
    }

    // Update player
    this.currentPlayer.status = 'sold';
    this.currentPlayer.soldTo = managerId;
    this.currentPlayer.soldPrice = price;

    // Update manager
    manager.budget -= price;
    if (!manager.players) manager.players = [];
    manager.players.push({
      id: this.currentPlayer.id,
      position: null
    });

    // Show sold overlay
    this.showSoldAnimation(this.currentPlayer, manager, price);

    // Update views
    this.generateMasterView();
    this.generateTeamViews();
    this.generateBudgetView();
    this.generateManagersPanel();
    this.updateSoldUnsoldLists();
    this.updateHeader();

    this.auctionPhase = 'sold';
  }

  markUnsold() {
    if (!this.currentPlayer) return;

    this.currentPlayer.status = 'unsold';
    this.updateSoldUnsoldLists();
    this.updateHeader();

    this.auctionPhase = 'idle';
    this.currentPlayer = null;
  }

showSoldAnimation(player, manager, price) {
    // 1. Set Manager Details (Left side)
    document.getElementById('transferManagerPhoto').src = manager.photo;
    document.getElementById('transferManagerName').textContent = manager.name;

    // 2. Set Player Details (Right side)
    document.getElementById('transferPlayerPhoto').src = player.photo;
    document.getElementById('transferPlayerName').textContent = player.name;

    // 3. Set Price (Center)
    document.getElementById('transferPrice').textContent = this.formatCurrency(price);

    // 4. Set The Headline: "PLAYER IS NOW A TEAM" (Bottom)
    const teamNameElement = document.getElementById('transferTeamName');

    // Construct the sentence with mixed colors
    teamNameElement.innerHTML = `
      <span style="color: #fff; opacity: 0.8;">${player.name.toUpperCase()} IS NOW A</span>
      <span style="color: ${manager.primaryColor}; text-shadow: 0 0 20px ${manager.primaryColor}; margin-left: 15px;">${manager.teamName.toUpperCase()}</span>
    `;

    // Adjust font size slightly so the longer sentence fits on one line
    teamNameElement.style.fontSize = "3.5rem";

    // 5. Dynamic Background Color based on the winning team
    document.getElementById('transferBg').style.background = `linear-gradient(135deg, ${manager.primaryColor}, ${manager.secondaryColor})`;

    // 6. Set phase to sold and clear current player
    this.auctionPhase = 'sold';
    this.currentPlayer = null;
    this.currentBid = 0;
    this.bidHistory = [];

    // 7. Switch View to the Transfer Screen
    this.showView('transfer');

    // 8. Fire Confetti
    if (this.config.animations.confettiEnabled) {
      confetti.celebrate();
    }
  }

  // ===============================
  // CARD RENDERING
  // ===============================

  updatePlayerCard(player, prefix = 'reveal') {
    const isAuction = prefix === 'auction';
    const idPrefix = isAuction ? 'auctionCard' : 'card';
    const attrPrefix = isAuction ? 'auctionAttr' : 'attr';

    const els = {
      overall: document.getElementById(`${idPrefix}Overall`),
      position: document.getElementById(`${idPrefix}Position`),
      trait: document.getElementById(`${idPrefix}Trait`),
      photo: document.getElementById(`${idPrefix}Photo`),
      photoPlaceholder: document.getElementById(`${idPrefix}PhotoPlaceholder`),
      name: document.getElementById(`${idPrefix}Name`),
      funFact: document.getElementById(isAuction ? 'auctionCardFunFact' : 'cardFunFact'),
      pace: document.getElementById(`${attrPrefix}Pace`),
      shooting: document.getElementById(`${attrPrefix}Shooting`),
      passing: document.getElementById(`${attrPrefix}Passing`),
      dribbling: document.getElementById(`${attrPrefix}Dribbling`),
      defense: document.getElementById(`${attrPrefix}Defense`),
      physical: document.getElementById(`${attrPrefix}Physical`)
    };

    // Calculate Rating
    const attrs = player.attributes;
    const overall = Math.round((attrs.pace + attrs.shooting + attrs.passing + attrs.dribbling + attrs.defense + attrs.physical) / 6);

    // Update Text
    if (els.overall) els.overall.textContent = overall;
    if (els.position) els.position.textContent = player.category;
    if (els.trait) els.trait.textContent = player.oneWordTrait || "Star";
    if (els.name) els.name.textContent = player.name;
    if (els.funFact) els.funFact.textContent = player.funFact || "Ready to play!";

    // Update Stats
    if (els.pace) els.pace.textContent = attrs.pace;
    if (els.shooting) els.shooting.textContent = attrs.shooting;
    if (els.passing) els.passing.textContent = attrs.passing;
    if (els.dribbling) els.dribbling.textContent = attrs.dribbling;
    if (els.defense) els.defense.textContent = attrs.defense;
    if (els.physical) els.physical.textContent = attrs.physical;

    // Update Photo
    if (player.photo && els.photo) {
      els.photo.src = player.photo;
      els.photo.classList.remove('hidden');
      if (els.photoPlaceholder) els.photoPlaceholder.classList.add('hidden');
      
      els.photo.onerror = () => {
        els.photo.classList.add('hidden');
        if (els.photoPlaceholder) {
            els.photoPlaceholder.classList.remove('hidden');
            els.photoPlaceholder.textContent = player.name.charAt(0);
        }
      };
    }

    // Update Base Price (Only for Reveal View)
    if (!isAuction && this.elements.revealBasePrice) {
      this.elements.revealBasePrice.textContent = this.formatCurrency(player.basePrice);
    }
    
    // Dynamic Card Color
    const cardBack = isAuction ? 
        document.querySelector('#auctionPlayerCard .player-card-back') : 
        document.querySelector('#playerCard .player-card-back');
        
    if(cardBack) {
        cardBack.classList.remove('cat-ATT', 'cat-MID', 'cat-DEF', 'cat-GK');
        cardBack.classList.add(`cat-${player.category}`);
    }
  }
  // ===============================
  // DASHBOARD VIEWS
  // ===============================

generateMasterView() {
    const container = this.elements.masterView;
    if (!container) return;

    // Position slots for 7-a-side: GK, DEF, DEF, MID, MID, ATT, ATT
    const positionSlots = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'];

    container.innerHTML = this.managers.map(manager => {
      const managerPlayers = this.players.filter(p => p.soldTo === manager.id);
      const totalSpent = this.config.totalBudget - manager.budget;

      // Map players to positions
      const slotPlayers = new Array(7).fill(null);
      if (manager.players) {
        manager.players.forEach(mp => {
          if (mp.position !== null && mp.position >= 0 && mp.position < 7) {
            const player = managerPlayers.find(p => p.id === mp.id);
            if (player) slotPlayers[mp.position] = player;
          }
        });
      }
      // Fill unassigned players into empty slots
      managerPlayers.forEach(player => {
        if (!slotPlayers.includes(player)) {
          const emptyIdx = slotPlayers.findIndex(p => p === null);
          if (emptyIdx !== -1) slotPlayers[emptyIdx] = player;
        }
      });

      return `
        <div class="master-team-card" style="border-color: ${manager.primaryColor}40;">
          <!-- Manager Header -->
          <div class="master-team-header" style="border-bottom-color: ${manager.primaryColor};">
             <img src="${manager.photo}" class="master-manager-photo"
                  style="border-color: ${manager.secondaryColor};"
                  onerror="this.src='${manager.logo}'">

             <div class="master-team-info">
                <div class="master-team-name" style="color: ${manager.primaryColor};">
                   ${manager.teamName}
                </div>
                <div class="master-manager-name">${manager.name}</div>
             </div>

             <div class="master-budget-box">
                <div class="master-budget-label">Budget</div>
                <div class="master-budget-amount" style="color: ${manager.secondaryColor};">
                   ${this.formatCurrency(manager.budget)}
                </div>
             </div>
          </div>

          <!-- Players Grid -->
          <div class="master-team-players">
            ${positionSlots.map((pos, idx) => {
              const player = slotPlayers[idx];

              if (player) {
                const initials = player.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                return `
                <div class="master-player-slot" style="border-left-color: ${manager.secondaryColor};">
                  <div class="master-position-badge pos-${player.category}">${player.category}</div>

                  <div class="master-player-visual">
                    <img src="${player.photo}" class="master-player-img"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                    <div class="master-player-initials" style="display:none; background: ${manager.primaryColor};">
                        ${initials}
                    </div>
                  </div>

                  <div class="master-player-info">
                    <div class="master-player-name">${player.name}</div>
                  </div>

                  <div class="master-player-price" style="color: ${manager.secondaryColor};">
                     ${this.formatCurrency(player.soldPrice)}
                  </div>
                </div>
              `} else {
                return `
                <div class="master-player-slot empty">
                  <div class="master-position-badge pos-empty">${pos}</div>
                  <div class="master-player-visual">
                    <div class="master-player-initials" style="background: transparent; border-style: dashed;">
                        ${idx + 1}
                    </div>
                  </div>
                  <div class="master-player-info">
                    <div class="master-player-name" style="color: rgba(255,255,255,0.3);">Empty Slot</div>
                  </div>
                </div>
              `}
            }).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

generateTeamViews() {
    this.managers.forEach((manager, index) => {
      const viewEl = this.views[`team${index + 1}`];
      if (!viewEl) return;

      const managerPlayers = this.players.filter(p => p.soldTo === manager.id);

      // Force Layout
      viewEl.style.display = 'flex';
      viewEl.style.flexDirection = 'row';
      viewEl.style.gap = '30px';
      viewEl.style.height = '100%';
      viewEl.style.padding = '30px';
      viewEl.style.boxSizing = 'border-box';

      viewEl.innerHTML = `
          <div style="flex: 0 0 350px; background: var(--bg-secondary); padding: 25px; border-radius: 16px; border-left: 6px solid ${manager.primaryColor}; display: flex; flex-direction: column; gap: 20px; box-shadow: var(--shadow-lg); height: 100%; overflow-y: auto;">
             
             <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${manager.photo}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid ${manager.secondaryColor}; flex-shrink: 0;" onerror="this.src='${manager.logo}'">
                <div>
                   <div style="font-family: var(--font-display); font-size: 2.2rem; line-height: 1; color: ${manager.primaryColor}; word-break: break-word;">${manager.teamName}</div>
                   <div style="font-size: 1.2rem; color: #fff; opacity: 0.9;">${manager.name}</div>
                </div>
             </div>
             
             <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 1px; margin-bottom: 5px;">Philosophy</div>
                <div style="font-style: italic; color: var(--accent-color); font-size: 1.1rem;">"${manager.philosophy || 'No philosophy'}"</div>
             </div>

             <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: var(--bg-tertiary); padding: 10px; border-radius: 8px; text-align: center;">
                   <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary);">Mentality</div>
                   <div style="font-weight: bold; font-size: 1rem;">${manager.mentality || '-'}</div>
                </div>
                <div style="background: var(--bg-tertiary); padding: 10px; border-radius: 8px; text-align: center;">
                   <div style="font-size: 0.7rem; text-transform: uppercase; color: var(--text-secondary);">Net Worth</div>
                   <div style="font-weight: bold; font-size: 1rem; color: ${manager.secondaryColor};">${manager.netWorth || '-'}</div>
                </div>
             </div>

             <div>
                <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 5px;">Track Record</div>
                <div style="font-size: 0.9rem; color: #fff;">${manager.trackRecord || 'Unknown'}</div>
             </div>
          </div>

          <div class="formation-container" style="flex: 1; display: flex; justify-content: center; align-items: center; position: relative; background: transparent; height: 100%;">
            <div class="formation-pitch" style="width: 100%; height: 100%; max-width: none; aspect-ratio: auto; position: relative; border-radius: 16px; overflow: hidden; background: linear-gradient(180deg, #2d8a4e 0%, #1e6b3a 100%); box-shadow: var(--shadow-lg);">
              
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; opacity: 0.6;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 150px; height: 150px; border: 3px solid rgba(255,255,255,0.4); border-radius: 50%;"></div>
                <div style="position: absolute; top: 0; left: 50%; width: 3px; height: 100%; background: rgba(255,255,255,0.4);"></div>
                <div style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 250px; height: 80px; border: 3px solid rgba(255,255,255,0.4); border-top: none;"></div>
                <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 250px; height: 80px; border: 3px solid rgba(255,255,255,0.4); border-bottom: none;"></div>
              </div>

              <!-- Top Right: Logo and Budget -->
              <div style="position: absolute; top: 20px; right: 20px; display: flex; align-items: flex-start; gap: 15px; z-index: 20;">
                 <div style="background: rgba(0,0,0,0.8); padding: 15px 25px; border-radius: 12px; border: 2px solid ${manager.primaryColor}; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
                    <div style="font-size: 0.8rem; text-transform: uppercase; color: #bbb; letter-spacing: 1px; margin-bottom: 5px;">Budget Remaining</div>
                    <div style="font-family: var(--font-display); font-size: 2.5rem; color: ${manager.secondaryColor}; line-height: 1; text-shadow: 0 0 10px ${manager.secondaryColor}40;">
                       ${this.formatCurrency(manager.budget)}
                    </div>
                 </div>
                 <img src="assets/logo.png" alt="Tournament Logo" style="height: 80px; width: auto; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));" onerror="this.style.display='none'">
              </div>
              
              ${this.generateFormationSlots(managerPlayers, manager)}
            </div>
          </div>
      `;
    });
  }

 generateFormationSlots(players, manager) {
    // 7 POSITIONS: 1 GK, 2 DEF, 2 MID, 2 ATT
    const positions = [
      { name: 'GK', top: 88, left: 50 },
      { name: 'DEF', top: 68, left: 30 },
      { name: 'DEF', top: 68, left: 70 },
      { name: 'MID', top: 45, left: 30 },
      { name: 'MID', top: 45, left: 70 },
      { name: 'ATT', top: 20, left: 35 },
      { name: 'ATT', top: 20, left: 65 }
    ];

    // Map players to positions based on their assigned positions or category
    const assignedPlayers = new Array(7).fill(null); // Correctly sized for 7 players

    // Check if manager has position assignments
    if (manager.players && manager.players.length > 0) {
      manager.players.forEach(mp => {
        const player = players.find(p => p.id === mp.id);
        
        // FIX: Changed '< 6' to '< 7' so the 7th player can be assigned
        if (player && mp.position !== null && mp.position >= 0 && mp.position < 7) {
          assignedPlayers[mp.position] = player;
        }
      });
    }

    // Fill remaining slots with unassigned players
    players.forEach(player => {
      if (!assignedPlayers.includes(player)) {
        const emptyIndex = assignedPlayers.findIndex(p => p === null);
        if (emptyIndex !== -1) {
          assignedPlayers[emptyIndex] = player;
        }
      }
    });

    return positions.map((pos, index) => {
      const player = assignedPlayers[index];

      if (player) {
        return `
          <div class="formation-slot" style="top: ${pos.top}%; left: ${pos.left}%;">
            ${player.photo ?
              `<img src="${player.photo}" class="slot-photo" alt="${player.name}" onerror="this.outerHTML='<div class=\\'slot-photo-empty\\'>${player.name.charAt(0)}</div>'">` :
              `<div class="slot-photo-empty">${player.name.charAt(0)}</div>`
            }
            <div class="slot-name">${player.name}</div>
            <div class="slot-position">${player.category}</div>
          </div>
        `;
      } else {
        return `
          <div class="formation-slot empty" style="top: ${pos.top}%; left: ${pos.left}%;">
            <div class="slot-photo-empty">?</div>
            <div class="slot-name">Empty</div>
            <div class="slot-position">${pos.name}</div>
          </div>
        `;
      }
    }).join('');
  }

  generateBudgetView() {
    const container = this.elements.budgetCards;
    const initialBudget = this.config.totalBudget;

    container.innerHTML = this.managers.map(manager => {
      const spent = initialBudget - manager.budget;
      const percentage = (manager.budget / initialBudget) * 100;
      const playerCount = this.players.filter(p => p.soldTo === manager.id).length;

      return `
        <div class="budget-card" style="border-left-color: ${manager.primaryColor}">
          <div class="budget-team-name" style="color: ${manager.primaryColor}">${manager.teamName}</div>
          <div class="budget-remaining">${this.formatCurrency(manager.budget)}</div>
          <div class="budget-spent">Spent: ${this.formatCurrency(spent)}</div>
          <div class="budget-bar">
            <div class="budget-bar-fill" style="width: ${percentage}%; background: linear-gradient(90deg, ${manager.primaryColor}, ${manager.secondaryColor})"></div>
          </div>
          <div class="budget-player-count">${playerCount} / 7 Players</div>
        </div>
      `;
    }).join('');
  }

  generateManagersPanel(activeBidderId = null) {
    const container = document.getElementById('managersPanelList');
    if (!container) return;

    const playersPerTeam = this.config.playersPerTeam || 7;
    const basePrice = this.config.defaultBasePrice || 5000000;

    container.innerHTML = this.managers.map(manager => {
      const playersOwned = manager.players ? manager.players.length : 0;
      const playersNeeded = playersPerTeam - playersOwned;
      const reservedForOthers = Math.max(0, playersNeeded - 1) * basePrice;
      const maxSpendable = Math.min(
        manager.budget - reservedForOthers,
        this.config.maxBidPerPlayer || 70000000
      );
      const isActiveBidder = activeBidderId === manager.id;

      // Determine stat colors
      const purseClass = manager.budget < 20000000 ? 'danger' : (manager.budget < 40000000 ? 'warning' : '');
      const maxClass = maxSpendable < 10000000 ? 'danger' : (maxSpendable < 20000000 ? 'warning' : '');

      return `
        <div class="manager-panel-card ${isActiveBidder ? 'active-bidder' : ''}"
             style="border-left-color: ${manager.primaryColor};"
             data-manager-id="${manager.id}">
          <div class="manager-panel-header">
            <img src="${manager.photo || ''}" class="manager-panel-photo" alt="${manager.name}" onerror="this.src='${manager.logo || ''}'">
            <div class="manager-panel-info">
              <div class="manager-panel-name">${manager.name}</div>
              <div class="manager-panel-team" style="color: ${manager.primaryColor}">${manager.teamName}</div>
            </div>
            <span class="manager-panel-bidding-tag">BIDDING</span>
          </div>
          <div class="manager-panel-stats">
            <div class="manager-stat">
              <div class="manager-stat-label">Purse</div>
              <div class="manager-stat-value ${purseClass}">${this.formatCurrency(manager.budget)}</div>
            </div>
            <div class="manager-stat">
              <div class="manager-stat-label">Max Bid</div>
              <div class="manager-stat-value ${maxClass}">${this.formatCurrency(Math.max(0, maxSpendable))}</div>
            </div>
            <div class="manager-stat">
              <div class="manager-stat-label">Squad</div>
              <div class="manager-stat-value">${playersOwned}/${playersPerTeam}</div>
            </div>
            <div class="manager-stat">
              <div class="manager-stat-label">Need</div>
              <div class="manager-stat-value">${playersNeeded}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  updateManagersPanelHighlight(activeBidderId) {
    const cards = document.querySelectorAll('.manager-panel-card');
    cards.forEach(card => {
      const managerId = parseInt(card.dataset.managerId);
      if (managerId === activeBidderId) {
        card.classList.add('active-bidder');
      } else {
        card.classList.remove('active-bidder');
      }
    });
  }

  updateSoldUnsoldLists() {
    const soldPlayers = this.players.filter(p => p.status === 'sold');
    const unsoldPlayers = this.players.filter(p => p.status === 'unsold' || !p.status);

    this.elements.soldPlayersList.innerHTML = soldPlayers.map(player => {
      const manager = this.managers.find(m => m.id === player.soldTo);
      return `
        <div class="soldlist-item">
          ${player.photo ?
            `<img src="${player.photo}" class="soldlist-item-photo" alt="${player.name}" onerror="this.style.display='none'">` :
            `<div class="soldlist-item-photo" style="background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;">${player.name.charAt(0)}</div>`
          }
          <div class="soldlist-item-info">
            <div class="soldlist-item-name">${player.name}</div>
            <div class="soldlist-item-category">${this.config.categoryNames[player.category]}</div>
          </div>
          <div style="text-align: right;">
            <div class="soldlist-item-price">${this.formatCurrency(player.soldPrice)}</div>
            <div class="soldlist-item-team" style="color: ${manager?.primaryColor || 'inherit'}">${manager?.teamName || 'Unknown'}</div>
          </div>
        </div>
      `;
    }).join('') || '<p class="text-secondary">No players sold yet</p>';

    this.elements.unsoldPlayersList.innerHTML = unsoldPlayers.map(player => `
      <div class="soldlist-item">
        ${player.photo ?
          `<img src="${player.photo}" class="soldlist-item-photo" alt="${player.name}" onerror="this.style.display='none'">` :
          `<div class="soldlist-item-photo" style="background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;">${player.name.charAt(0)}</div>`
        }
        <div class="soldlist-item-info">
          <div class="soldlist-item-name">${player.name}</div>
          <div class="soldlist-item-category">${this.config.categoryNames[player.category]}</div>
        </div>
        <div style="text-align: right;">
          <div class="soldlist-item-price">${this.formatCurrency(player.basePrice)}</div>
          <div class="text-secondary">Base Price</div>
        </div>
      </div>
    `).join('') || '<p class="text-secondary">All players sold!</p>';
  }

  // ===============================
  // UTILITIES
  // ===============================

  updateHeader() {
    this.elements.tournamentName.textContent = this.config.tournamentName;
    if (this.elements.welcomeTitle) {
      this.elements.welcomeTitle.textContent = this.config.tournamentName;
    }

    const soldCount = this.players.filter(p => p.status === 'sold').length;
    this.elements.playersSold.textContent = `${soldCount}/${this.players.length}`;
  }

  formatCurrency(amount) {
    if (amount >= 1000000) {
      return `${this.config.currencySymbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${this.config.currencySymbol}${(amount / 1000).toFixed(0)}K`;
    }
    return `${this.config.currencySymbol}${amount}`;
  }

  showError(message) {
    const container = document.querySelector('.main-content');
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 20px;">
        <h1 style="color: var(--error-color);">Error</h1>
        <p>${message}</p>
      </div>
    `;
  }

  // ===============================
  // STATE MANAGEMENT
  // ===============================

  getState() {
    return {
      players: this.players,
      managers: this.managers,
      currentView: this.currentView,
      currentPlayerId: this.currentPlayer?.id || null,
      currentBid: this.currentBid,
      bidHistory: this.bidHistory,
      auctionPhase: this.auctionPhase
    };
  }

  restoreState(state) {
    if (state.players) this.players = state.players;
    if (state.managers) this.managers = state.managers;
    if (state.currentPlayerId) {
      this.currentPlayer = this.players.find(p => p.id === state.currentPlayerId);
    }
    if (state.currentBid) this.currentBid = state.currentBid;
    if (state.bidHistory) this.bidHistory = state.bidHistory;
    if (state.auctionPhase) this.auctionPhase = state.auctionPhase;

    console.log('State restored');
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.auctionPresentation = new AuctionPresentation();
});
