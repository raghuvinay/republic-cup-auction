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
      soldlist: document.getElementById('soldlistView')
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
    auctionSync.on(SYNC_MESSAGES.UPDATE_BID, (data) => {
      this.updateBid(data.amount, data.history);
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
      }
    }
  }

  updateViewLabel(viewName) {
    const labels = {
      welcome: 'Welcome',
      teaser: 'Teaser',
      reveal: 'Reveal',
      auction: 'Auction',
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

    // Update teaser content
    this.elements.teaserFunFact.textContent = this.currentPlayer.funFact;
    this.elements.teaserCategory.textContent = this.config.categoryNames[this.currentPlayer.category];
    this.elements.teaserCategory.className = `teaser-category ${this.currentPlayer.category}`;

    // Show teaser view
    this.showView('teaser');
    this.auctionPhase = 'teaser';
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

  updateBid(amount, history = []) {
    this.currentBid = amount;
    if (history.length > 0) {
      this.bidHistory = history;
    }
    this.updateBidDisplay();
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
    // Update sold overlay content
    this.elements.soldPlayerName.textContent = player.name;
    this.elements.soldToTeam.textContent = `To ${manager.teamName}`;
    this.elements.soldToTeam.style.color = manager.primaryColor;
    this.elements.soldPrice.textContent = this.formatCurrency(price);

    // Show overlay
    this.elements.soldOverlay.classList.add('active');

    // Fire confetti
    if (this.config.animations.confettiEnabled) {
      confetti.celebrate();
    }

    // Hide after delay
    setTimeout(() => {
      this.elements.soldOverlay.classList.remove('active');
      confetti.stop();
    }, 4000);
  }

  // ===============================
  // CARD RENDERING
  // ===============================

  updatePlayerCard(player, prefix = 'reveal') {
    const isAuction = prefix === 'auction';
    const els = isAuction ? {
      overall: this.elements.auctionCardOverall,
      position: this.elements.auctionCardPosition,
      trait: this.elements.auctionCardTrait,
      photo: this.elements.auctionCardPhoto,
      photoPlaceholder: this.elements.auctionCardPhotoPlaceholder,
      name: this.elements.auctionCardName,
      pace: this.elements.auctionAttrPace,
      shooting: this.elements.auctionAttrShooting,
      passing: this.elements.auctionAttrPassing,
      dribbling: this.elements.auctionAttrDribbling,
      defense: this.elements.auctionAttrDefense,
      physical: this.elements.auctionAttrPhysical
    } : {
      overall: this.elements.cardOverall,
      position: this.elements.cardPosition,
      trait: this.elements.cardTrait,
      photo: this.elements.cardPhoto,
      photoPlaceholder: this.elements.cardPhotoPlaceholder,
      name: this.elements.cardName,
      pace: this.elements.attrPace,
      shooting: this.elements.attrShooting,
      passing: this.elements.attrPassing,
      dribbling: this.elements.attrDribbling,
      defense: this.elements.attrDefense,
      physical: this.elements.attrPhysical
    };

    // Calculate overall rating (average of all attributes)
    const attrs = player.attributes;
    const overall = Math.round(
      (attrs.pace + attrs.shooting + attrs.passing + attrs.dribbling + attrs.defense + attrs.physical) / 6
    );

    els.overall.textContent = overall;
    els.position.textContent = player.category;
    els.trait.textContent = player.oneWordTrait;
    els.name.textContent = player.name;

    // Attributes
    els.pace.textContent = attrs.pace;
    els.shooting.textContent = attrs.shooting;
    els.passing.textContent = attrs.passing;
    els.dribbling.textContent = attrs.dribbling;
    els.defense.textContent = attrs.defense;
    els.physical.textContent = attrs.physical;

    // Photo
    if (player.photo) {
      els.photo.src = player.photo;
      els.photo.classList.remove('hidden');
      els.photoPlaceholder.classList.add('hidden');

      // Handle photo load error
      els.photo.onerror = () => {
        els.photo.classList.add('hidden');
        els.photoPlaceholder.classList.remove('hidden');
        els.photoPlaceholder.textContent = player.name.charAt(0);
      };
    } else {
      els.photo.classList.add('hidden');
      els.photoPlaceholder.classList.remove('hidden');
      els.photoPlaceholder.textContent = player.name.charAt(0);
    }

    // Update base price (reveal view only)
    if (!isAuction) {
      this.elements.revealBasePrice.textContent = this.formatCurrency(player.basePrice);
    }
  }

  // ===============================
  // DASHBOARD VIEWS
  // ===============================

  generateMasterView() {
    const container = this.elements.masterView;
    container.innerHTML = this.managers.map(manager => {
      const managerPlayers = this.players.filter(p => p.soldTo === manager.id);

      return `
        <div class="master-team-card" style="border-left-color: ${manager.primaryColor}">
          <div class="master-team-header">
            <div class="master-team-info">
              ${manager.logo ?
                `<img src="${manager.logo}" class="master-team-logo" alt="${manager.teamName}" onerror="this.style.display='none'">` :
                `<div class="master-team-logo" style="background: ${manager.primaryColor}; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">${manager.teamName.charAt(0)}</div>`
              }
              <div>
                <div class="master-team-name" style="color: ${manager.primaryColor}">${manager.teamName}</div>
                <div class="text-secondary">${manager.name}</div>
              </div>
            </div>
            <div class="master-team-budget">${this.formatCurrency(manager.budget)}</div>
          </div>
          <div class="master-team-players">
            ${managerPlayers.map(player => `
              <div class="master-player-slot">
                ${player.photo ?
                  `<img src="${player.photo}" class="master-player-photo" alt="${player.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                   <div class="master-player-photo" style="display: none; background: var(--bg-tertiary); align-items: center; justify-content: center;">${player.name.charAt(0)}</div>` :
                  `<div class="master-player-photo" style="background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;">${player.name.charAt(0)}</div>`
                }
                <div class="master-player-name">${player.name}</div>
                <div class="master-player-price">${this.formatCurrency(player.soldPrice)}</div>
              </div>
            `).join('')}
            ${Array(Math.max(0, 6 - managerPlayers.length)).fill().map(() => `
              <div class="master-player-slot empty">
                <div class="master-player-photo" style="background: transparent; border: 2px dashed var(--text-muted);">?</div>
                <div class="master-player-name">Empty</div>
              </div>
            `).join('')}
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

      viewEl.innerHTML = `
        <div class="team-header">
          <div class="team-info">
            ${manager.logo ?
              `<img src="${manager.logo}" class="team-logo" alt="${manager.teamName}" onerror="this.style.display='none'">` :
              `<div class="team-logo-placeholder" style="background: ${manager.primaryColor}">${manager.teamName.charAt(0)}</div>`
            }
            <div>
              <div class="team-name" style="color: ${manager.primaryColor}">${manager.teamName}</div>
              <div class="team-manager">${manager.name}</div>
            </div>
          </div>
          <div class="team-budget">
            <div class="budget-label">Remaining Budget</div>
            <div class="budget-amount">${this.formatCurrency(manager.budget)}</div>
          </div>
        </div>
        <div class="formation-container">
          <div class="formation-pitch">
            <div class="pitch-lines">
              <div class="pitch-center-circle"></div>
              <div class="pitch-center-line"></div>
              <div class="pitch-goal-area top"></div>
              <div class="pitch-goal-area bottom"></div>
            </div>
            ${this.generateFormationSlots(managerPlayers, manager)}
          </div>
        </div>
      `;
    });
  }

  generateFormationSlots(players, manager) {
    // 1-2-2 formation positions (percentages)
    const positions = [
      { name: 'GK', top: 85, left: 50 },
      { name: 'DEF', top: 65, left: 25 },
      { name: 'DEF', top: 65, left: 75 },
      { name: 'MID', top: 40, left: 25 },
      { name: 'MID', top: 40, left: 75 },
      { name: 'ATT', top: 15, left: 50 }
    ];

    // Map players to positions based on their assigned positions or category
    const assignedPlayers = new Array(6).fill(null);

    // Check if manager has position assignments
    if (manager.players && manager.players.length > 0) {
      manager.players.forEach(mp => {
        const player = players.find(p => p.id === mp.id);
        if (player && mp.position !== null && mp.position >= 0 && mp.position < 6) {
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
          <div class="budget-player-count">${playerCount} / 6 Players</div>
        </div>
      `;
    }).join('');
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
    this.elements.welcomeTitle.textContent = this.config.tournamentName;

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
