/**
 * Football Auction - Control Panel Application
 * Handles all auction control logic and sync with presentation view
 */

class AuctionControl {
  constructor() {
    // State
    this.config = null;
    this.players = [];
    this.managers = [];
    this.currentPlayer = null;
    this.currentBid = 0;
    this.bidHistory = [];
    this.selectedManagerId = null;
    this.auctionHistory = [];
    this.currentView = 'welcome';

    // Initialize
    this.init();
  }

  async init() {
    try {
      // Load data
      await this.loadData();

      // Setup UI
      this.setupUI();

      // Setup event listeners
      this.setupEventListeners();

      // Setup sync listeners
      this.setupSyncListeners();

      // Update connection status
      this.updateConnectionStatus();

      // Update statistics
      this.updateStatistics();

      console.log('Control panel initialized successfully');
    } catch (error) {
      console.error('Failed to initialize control panel:', error);
      alert('Failed to load auction data. Please check the console.');
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

  setupUI() {
    this.renderPlayerList();
    this.renderManagerButtons();
    this.renderLineupTeamSelect();
    this.updateCurrentPlayerDisplay();
    this.updateAuctionHistory();
  }

  setupEventListeners() {
    // Auction phase buttons
    document.getElementById('btnTeaser').addEventListener('click', () => this.showTeaser());
    document.getElementById('btnReveal').addEventListener('click', () => this.revealPlayer());
    document.getElementById('btnStartBid').addEventListener('click', () => this.startBidding());

    // Bid controls
    document.getElementById('btnUpdateBid').addEventListener('click', () => this.updateBidFromInput());
    document.getElementById('bidInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.updateBidFromInput();
    });

    // Bid increment buttons
    document.querySelectorAll('[data-increment]').forEach(btn => {
      btn.addEventListener('click', () => {
        const increment = parseInt(btn.dataset.increment);
        this.incrementBid(increment);
      });
    });

    // Sold/Unsold buttons
    document.getElementById('btnSold').addEventListener('click', () => this.markSold());
    document.getElementById('btnUnsold').addEventListener('click', () => this.markUnsold());
    document.getElementById('btnReset').addEventListener('click', () => this.resetCurrentAuction());

    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.changeView(view);
        this.updateViewButtons(view);
      });
    });

    // Export buttons
    document.getElementById('btnExportJSON').addEventListener('click', () => this.exportJSON());
    document.getElementById('btnExportCSV').addEventListener('click', () => this.exportCSV());
    document.getElementById('btnSaveState').addEventListener('click', () => this.saveState());
    document.getElementById('btnLoadState').addEventListener('click', () => this.loadSavedState());
    document.getElementById('btnResetAll').addEventListener('click', () => this.resetAllData());
    document.getElementById('btnImportState').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', (e) => this.importState(e));

    // Lineup management
    document.getElementById('lineupTeamSelect').addEventListener('change', (e) => {
      this.renderLineupManagement(parseInt(e.target.value));
    });

    // Global keyboard shortcuts for faster auction control
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        // But allow Enter in bid input to confirm
        if (e.key === 'Enter' && e.target.id === 'bidInput') {
          this.updateBidFromInput();
        }
        return;
      }

      // IMPORTANT: Ignore shortcuts when modifier keys are pressed (Ctrl, Alt, Meta/Cmd)
      // This prevents Ctrl+Shift+R (hard refresh) from triggering manager selection
      if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
      }

      switch (e.key.toLowerCase()) {
        // Manager selection: Q, W, E, R
        case 'q':
          e.preventDefault();
          this.quickSelectManager(1);
          break;
        case 'w':
          e.preventDefault();
          this.quickSelectManager(2);
          break;
        case 'e':
          e.preventDefault();
          this.quickSelectManager(3);
          break;
        case 'r':
          e.preventDefault();
          this.quickSelectManager(4);
          break;

        // Confirm sale with Enter
        case 'enter':
          e.preventDefault();
          if (this.currentPlayer && this.selectedManagerId) {
            this.markSold();
          }
          break;

        // Bid adjustments with arrow keys
        case 'arrowup':
          e.preventDefault();
          this.incrementBid(500000); // +500K
          break;
        case 'arrowdown':
          e.preventDefault();
          this.incrementBid(-500000); // -500K
          break;

        // Quick view shortcuts
        case 'm':
          e.preventDefault();
          this.changeView('master');
          break;
        case 'a':
          e.preventDefault();
          this.changeView('auction');
          break;
        case 't':
          e.preventDefault();
          // Only show transfer if there's a completed sale in history
          if (this.auctionHistory.length > 0) {
            this.changeView('transfer');
          } else {
            console.log('No completed sales to show in transfer view');
          }
          break;
        case 'b':
          e.preventDefault();
          this.changeView('budget');
          break;
        case 's':
          e.preventDefault();
          this.changeView('soldlist');
          break;

        // Number keys for team views
        case '1':
          e.preventDefault();
          this.changeView('team1');
          break;
        case '2':
          e.preventDefault();
          this.changeView('team2');
          break;
        case '3':
          e.preventDefault();
          this.changeView('team3');
          break;
        case '4':
          e.preventDefault();
          this.changeView('team4');
          break;

        // Escape to go back to auction
        case 'escape':
          e.preventDefault();
          this.changeView('auction');
          break;
      }
    });
  }

  setupSyncListeners() {
    // Listen for state requests
    auctionSync.on(SYNC_MESSAGES.REQUEST_STATE, () => {
      auctionSync.send(SYNC_MESSAGES.SYNC_STATE, this.getState());
    });

    // Listen for connection
    auctionSync.on(SYNC_MESSAGES.CONNECTED, () => {
      this.updateConnectionStatus();
      // Send current state to new connection
      setTimeout(() => {
        auctionSync.send(SYNC_MESSAGES.SYNC_STATE, this.getState());
      }, 100);
    });

    // Ping/Pong for connection status
    setInterval(() => {
      auctionSync.send(SYNC_MESSAGES.PING, { timestamp: Date.now() });
    }, 5000);
  }

  // ===============================
  // UI RENDERING
  // ===============================

  renderPlayerList() {
    const container = document.getElementById('playerSelectList');

    // Group players by category
    const categories = ['GK', 'DEF', 'MID', 'ATT'];

    container.innerHTML = categories.map(cat => {
      const catPlayers = this.players.filter(p => p.category === cat);

      return `
        <div class="mb-md">
          <div class="section-title" style="font-size: 1rem; margin-bottom: 8px;">
            ${this.config.categoryNames[cat]} (${catPlayers.length})
          </div>
          ${catPlayers.map(player => `
            <div class="player-select-item ${player.status === 'sold' ? 'sold' : ''} ${this.currentPlayer?.id === player.id ? 'selected' : ''}"
                 data-player-id="${player.id}"
                 onclick="auctionControl.selectPlayer(${player.id})">
              ${player.photo ?
                `<img src="${player.photo}" class="player-select-photo" alt="${player.name}" onerror="this.style.display='none'">` :
                `<div class="player-select-photo" style="background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center;">${player.name.charAt(0)}</div>`
              }
              <div class="player-select-info">
                <div class="player-select-name">${player.name}</div>
                <span class="player-select-category ${player.category}">${player.category}</span>
                ${player.status === 'sold' ? `<span style="color: var(--success-color); margin-left: 8px;">SOLD</span>` : ''}
              </div>
              <div class="player-select-price">${this.formatCurrency(player.basePrice)}</div>
            </div>
          `).join('')}
        </div>
      `;
    }).join('');
  }

  renderManagerButtons() {
    const container = document.getElementById('managerButtons');

    container.innerHTML = this.managers.map(manager => `
      <div class="manager-btn ${this.selectedManagerId === manager.id ? 'selected' : ''}"
           data-manager-id="${manager.id}"
           onclick="auctionControl.selectManager(${manager.id})"
           style="border-color: ${this.selectedManagerId === manager.id ? manager.primaryColor : 'transparent'}">
        <div class="manager-btn-name">${manager.name}</div>
        <div class="manager-btn-team" style="color: ${manager.primaryColor}">${manager.teamName}</div>
        <div class="manager-btn-budget">${this.formatCurrency(manager.budget)}</div>
      </div>
    `).join('');

    // Also update quick action bar manager names
    this.managers.forEach((manager, index) => {
      const quickEl = document.getElementById(`quickManager${index + 1}`);
      if (quickEl) {
        quickEl.textContent = `${manager.name} (${this.formatCurrency(manager.budget)})`;
      }
    });

    // Update selection state on quick buttons
    this.updateQuickManagerButtons();
  }

  renderLineupTeamSelect() {
    const select = document.getElementById('lineupTeamSelect');
    select.innerHTML = `
      <option value="">-- Select Team --</option>
      ${this.managers.map(m => `<option value="${m.id}">${m.teamName}</option>`).join('')}
    `;
  }

  renderLineupManagement(managerId) {
    const container = document.getElementById('lineupManagement');
    const slotsContainer = document.getElementById('lineupSlots');

    if (!managerId) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';

    const manager = this.managers.find(m => m.id === managerId);
    const teamPlayers = this.players.filter(p => p.soldTo === managerId);

const positions = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'ATT', 'ATT'];

    // Get current assignments
    const assignments = new Array(7).fill(null);
    if (manager.players) {
      manager.players.forEach(mp => {
        if (mp.position !== null && mp.position >= 0 && mp.position < 7) {
          const player = teamPlayers.find(p => p.id === mp.id);
          if (player) assignments[mp.position] = player;
        }
      });
    }

    slotsContainer.innerHTML = positions.map((pos, index) => {
      const assignedPlayer = assignments[index];
      const availablePlayers = teamPlayers.filter(p =>
        !assignments.includes(p) || assignments.indexOf(p) === index
      );

      return `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; padding: 8px; background: var(--bg-tertiary); border-radius: 8px;">
          <div style="width: 60px; font-weight: 600;">${pos} ${index + 1}</div>
          <select class="bid-input" style="flex: 1; font-size: 0.9rem; padding: 8px;"
                  onchange="auctionControl.assignPlayerToPosition(${managerId}, ${index}, this.value)">
            <option value="">-- Empty --</option>
            ${availablePlayers.map(p => `
              <option value="${p.id}" ${assignedPlayer?.id === p.id ? 'selected' : ''}>
                ${p.name} (${p.category})
              </option>
            `).join('')}
          </select>
        </div>
      `;
    }).join('');
  }

  updateCurrentPlayerDisplay() {
    const nameEl = document.getElementById('controlCurrentPlayer');
    const catEl = document.getElementById('controlCurrentCategory');
    const bidInput = document.getElementById('bidInput');

    if (this.currentPlayer) {
      nameEl.textContent = this.currentPlayer.name;
      catEl.textContent = `${this.config.categoryNames[this.currentPlayer.category]} - Base: ${this.formatCurrency(this.currentPlayer.basePrice)}`;
      bidInput.value = this.currentBid / 1000000;

      // Enable buttons
      document.getElementById('btnTeaser').disabled = false;
      document.getElementById('btnReveal').disabled = false;
      document.getElementById('btnStartBid').disabled = false;
      document.getElementById('btnSold').disabled = this.selectedManagerId === null;
      document.getElementById('btnUnsold').disabled = false;
    } else {
      nameEl.textContent = 'No player selected';
      catEl.textContent = 'Select a player to start';
      bidInput.value = '0';

      // Disable buttons
      document.getElementById('btnTeaser').disabled = true;
      document.getElementById('btnReveal').disabled = true;
      document.getElementById('btnStartBid').disabled = true;
      document.getElementById('btnSold').disabled = true;
      document.getElementById('btnUnsold').disabled = true;
    }
  }

  updateViewButtons(activeView) {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === activeView);
    });
  }

  updateAuctionHistory() {
    const container = document.getElementById('auctionHistory');

    if (this.auctionHistory.length === 0) {
      container.innerHTML = '<p class="text-secondary">No auctions completed yet</p>';
      return;
    }

    container.innerHTML = this.auctionHistory.slice().reverse().map(auction => {
      const manager = this.managers.find(m => m.id === auction.managerId);
      return `
        <div class="history-item">
          <div>
            <strong>${auction.playerName}</strong>
            <span class="text-secondary"> to ${manager?.teamName || 'Unknown'}</span>
          </div>
          <div style="color: var(--accent-color)">${this.formatCurrency(auction.price)}</div>
        </div>
      `;
    }).join('');
  }

  updateConnectionStatus() {
    const statusDot = document.getElementById('syncStatus');
    const statusText = document.getElementById('syncStatusText');

    if (auctionSync.getStatus()) {
      statusDot.classList.add('connected');
      statusText.textContent = 'Connected';
    } else {
      statusDot.classList.remove('connected');
      statusText.textContent = 'Disconnected';
    }
  }

  updateStatistics() {
    const soldPlayers = this.players.filter(p => p.status === 'sold');

    // Most expensive
    if (soldPlayers.length > 0) {
      const mostExpensive = soldPlayers.reduce((max, p) =>
        p.soldPrice > max.soldPrice ? p : max
      );
      document.getElementById('statMostExpensive').textContent = mostExpensive.name;
      document.getElementById('statMostExpensivePrice').textContent = this.formatCurrency(mostExpensive.soldPrice);

      // Biggest bargain (largest difference from base price, where sold < base)
      const bargains = soldPlayers.filter(p => p.soldPrice < p.basePrice);
      if (bargains.length > 0) {
        const biggestBargain = bargains.reduce((max, p) => {
          const saving = p.basePrice - p.soldPrice;
          const maxSaving = max.basePrice - max.soldPrice;
          return saving > maxSaving ? p : max;
        });
        document.getElementById('statBiggestBargain').textContent = biggestBargain.name;
        document.getElementById('statBiggestBargainSaving').textContent =
          `Saved ${this.formatCurrency(biggestBargain.basePrice - biggestBargain.soldPrice)}`;
      } else {
        document.getElementById('statBiggestBargain').textContent = '-';
        document.getElementById('statBiggestBargainSaving').textContent = 'No bargains yet';
      }

      // Total spent
      const totalSpent = soldPlayers.reduce((sum, p) => sum + p.soldPrice, 0);
      document.getElementById('statTotalSpent').textContent = this.formatCurrency(totalSpent);

      // Average price
      const avgPrice = totalSpent / soldPlayers.length;
      document.getElementById('statAveragePrice').textContent = this.formatCurrency(Math.round(avgPrice));
    } else {
      document.getElementById('statMostExpensive').textContent = '-';
      document.getElementById('statMostExpensivePrice').textContent = '-';
      document.getElementById('statBiggestBargain').textContent = '-';
      document.getElementById('statBiggestBargainSaving').textContent = '-';
      document.getElementById('statTotalSpent').textContent = '€0';
      document.getElementById('statAveragePrice').textContent = '€0';
    }
  }

  // ===============================
  // AUCTION ACTIONS
  // ===============================

  selectPlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.status === 'sold') return;

    this.currentPlayer = player;
    this.currentBid = player.basePrice;
    this.bidHistory = [];
    this.selectedManagerId = null;

    this.renderPlayerList();
    this.renderManagerButtons();
    this.updateCurrentPlayerDisplay();

    // Sync with presentation
    auctionSync.send(SYNC_MESSAGES.SELECT_PLAYER, { playerId });
  }

  selectManager(managerId) {
    // Validate: If current bid exceeds this manager's max spendable, cap it
    if (this.currentPlayer && managerId) {
      const manager = this.managers.find(m => m.id === managerId);
      const maxSpendable = this.getMaxSpendableForManager(managerId);
      const budgetInfo = this.getManagerBudgetInfo(managerId);

      if (this.currentBid > maxSpendable) {
        this.currentBid = maxSpendable;
        document.getElementById('bidInput').value = this.currentBid / 1000000;
        if (budgetInfo.playersNeeded > 1) {
          this.showValidationMessage(
            `Bid capped to ${this.formatCurrency(maxSpendable)} (reserving for ${budgetInfo.playersNeeded - 1} more players)`
          );
        } else {
          this.showValidationMessage(`Bid capped to ${manager.name}'s max: ${this.formatCurrency(maxSpendable)}`);
        }
        this.sendBidUpdate();
      }
    }

    this.selectedManagerId = managerId;
    this.renderManagerButtons();
    this.updateQuickManagerButtons();

    // Enable sold button if player is selected
    document.getElementById('btnSold').disabled = !this.currentPlayer;
  }

  /**
   * Quick select manager via keyboard shortcut and auto-send bid update
   */
  quickSelectManager(managerId) {
    if (!this.currentPlayer) {
      console.log('No player selected');
      return;
    }

    const manager = this.managers.find(m => m.id === managerId);
    if (!manager) return;

    const basePrice = this.currentPlayer.basePrice;
    const maxSpendable = this.getMaxSpendableForManager(managerId);
    const budgetInfo = this.getManagerBudgetInfo(managerId);

    // Validate: Manager must have enough spendable budget for at least base price
    if (maxSpendable < basePrice) {
      this.showValidationMessage(
        `${manager.name} cannot bid - max spendable is ${this.formatCurrency(maxSpendable)} (need to reserve for ${budgetInfo.playersNeeded - 1} more players)`
      );
      return;
    }

    this.selectedManagerId = managerId;

    // Validate: If current bid exceeds manager's max spendable, cap it
    if (this.currentBid > maxSpendable) {
      this.currentBid = maxSpendable;
      document.getElementById('bidInput').value = this.currentBid / 1000000;
      this.showValidationMessage(
        `Bid capped to ${this.formatCurrency(maxSpendable)} (reserving for ${budgetInfo.playersNeeded - 1} more players)`
      );
    }

    this.renderManagerButtons();
    this.updateQuickManagerButtons();

    // Enable sold button
    document.getElementById('btnSold').disabled = false;

    // Auto-send bid update with manager info
    this.sendBidUpdate();

    // Visual feedback
    console.log(`Quick selected manager ${managerId}`);
  }

  /**
   * Update quick action bar manager buttons
   */
  updateQuickManagerButtons() {
    // Update selection state
    document.querySelectorAll('.quick-manager-btn').forEach(btn => {
      const id = parseInt(btn.dataset.managerId);
      btn.classList.toggle('selected', id === this.selectedManagerId);
    });
  }

  showTeaser() {
    if (!this.currentPlayer) return;

    auctionSync.send(SYNC_MESSAGES.SHOW_TEASER, {});
    this.changeView('teaser');
  }

  revealPlayer() {
    if (!this.currentPlayer) return;

    auctionSync.send(SYNC_MESSAGES.REVEAL_PLAYER, {});
    this.changeView('reveal');
  }

  startBidding() {
    if (!this.currentPlayer) return;

    auctionSync.send(SYNC_MESSAGES.START_BIDDING, {});
    this.changeView('auction');
  }

  incrementBid(amount) {
    if (!this.currentPlayer) return;

    const newBid = this.currentBid + amount;
    const basePrice = this.currentPlayer.basePrice;

    // Validate: Cannot go below base price
    if (newBid < basePrice) {
      this.currentBid = basePrice;
      this.showValidationMessage(`Cannot bid below base price (${this.formatCurrency(basePrice)})`);
    }
    // Validate against selected manager's smart budget limit
    else if (this.selectedManagerId) {
      const manager = this.managers.find(m => m.id === this.selectedManagerId);
      const maxSpendable = this.getMaxSpendableForManager(this.selectedManagerId);
      const budgetInfo = this.getManagerBudgetInfo(this.selectedManagerId);

      if (newBid > maxSpendable) {
        this.currentBid = maxSpendable;
        if (budgetInfo.playersNeeded > 1) {
          this.showValidationMessage(
            `${manager.name} max: ${this.formatCurrency(maxSpendable)} (reserving ${this.formatCurrency(budgetInfo.reservedForOthers)} for ${budgetInfo.playersNeeded - 1} more players)`
          );
        } else {
          this.showValidationMessage(`${manager.name} max spendable: ${this.formatCurrency(maxSpendable)}`);
        }
      } else {
        this.currentBid = newBid;
      }
    } else {
      // No manager selected - just apply max bid per player limit
      const maxBid = this.config.maxBidPerPlayer || 70000000;
      if (newBid > maxBid) {
        this.currentBid = maxBid;
        this.showValidationMessage(`Max bid per player is ${this.formatCurrency(maxBid)}`);
      } else {
        this.currentBid = newBid;
      }
    }

    document.getElementById('bidInput').value = this.currentBid / 1000000;
    this.sendBidUpdate();
  }

  showValidationMessage(message) {
    // Show a temporary message near the bid input
    const existingMsg = document.querySelector('.bid-validation-msg');
    if (existingMsg) existingMsg.remove();

    const msg = document.createElement('div');
    msg.className = 'bid-validation-msg';
    msg.style.cssText = 'color: var(--error-color); font-size: 0.85rem; margin-top: 8px; animation: fadeIn 0.2s;';
    msg.textContent = message;

    const bidInput = document.getElementById('bidInput');
    bidInput.parentNode.appendChild(msg);

    setTimeout(() => msg.remove(), 3000);
  }

  updateBidFromInput() {
    if (!this.currentPlayer) return;

    const input = document.getElementById('bidInput');
    let value = this.parseBidInput(input.value);
    const basePrice = this.currentPlayer.basePrice;

    // Validate: Cannot go below base price
    if (value < basePrice) {
      value = basePrice;
      this.showValidationMessage(`Cannot bid below base price (${this.formatCurrency(basePrice)})`);
    }

    // Validate against selected manager's smart budget limit
    if (this.selectedManagerId) {
      const manager = this.managers.find(m => m.id === this.selectedManagerId);
      const maxSpendable = this.getMaxSpendableForManager(this.selectedManagerId);
      const budgetInfo = this.getManagerBudgetInfo(this.selectedManagerId);

      if (value > maxSpendable) {
        value = maxSpendable;
        if (budgetInfo.playersNeeded > 1) {
          this.showValidationMessage(
            `${manager.name} max: ${this.formatCurrency(maxSpendable)} (reserving ${this.formatCurrency(budgetInfo.reservedForOthers)} for ${budgetInfo.playersNeeded - 1} more players)`
          );
        } else {
          this.showValidationMessage(`${manager.name} max spendable: ${this.formatCurrency(maxSpendable)}`);
        }
      }
    } else {
      // No manager selected - just apply max bid per player limit
      const maxBid = this.config.maxBidPerPlayer || 70000000;
      if (value > maxBid) {
        value = maxBid;
        this.showValidationMessage(`Max bid per player is ${this.formatCurrency(maxBid)}`);
      }
    }

    if (value > 0) {
      this.currentBid = value;
      input.value = this.currentBid;
      this.sendBidUpdate();
    }
  }

  parseBidInput(value) {
    // Remove currency symbols and spaces
    let cleaned = value.replace(/[€$£\s,]/g, '');

    // Input is always in millions, so multiply by 1,000,000
    return (parseFloat(cleaned) || 0) * 1000000;
  }

sendBidUpdate() {
    // Add to history
    const manager = this.selectedManagerId ?
      this.managers.find(m => m.id === this.selectedManagerId) : null;

    this.bidHistory.push({
      amount: this.currentBid,
      manager: manager?.teamName || null,
      timestamp: Date.now()
    });

    // Get budget info for the selected manager
    const budgetInfo = this.selectedManagerId ?
      this.getManagerBudgetInfo(this.selectedManagerId) : null;

    auctionSync.send(SYNC_MESSAGES.UPDATE_BID, {
      amount: this.currentBid,
      history: this.bidHistory,
      managerId: this.selectedManagerId,
      budgetInfo: budgetInfo // Include smart budget info
    });
  }

  markSold() {
    if (!this.currentPlayer || !this.selectedManagerId) {
      alert('Please select a player and a manager first');
      return;
    }

    const manager = this.managers.find(m => m.id === this.selectedManagerId);

    if (this.currentBid > manager.budget) {
      alert(`${manager.teamName} doesn't have enough budget! Remaining: ${this.formatCurrency(manager.budget)}`);
      return;
    }

    // Update player
    this.currentPlayer.status = 'sold';
    this.currentPlayer.soldTo = this.selectedManagerId;
    this.currentPlayer.soldPrice = this.currentBid;

    // Update manager
    manager.budget -= this.currentBid;
    if (!manager.players) manager.players = [];
    manager.players.push({
      id: this.currentPlayer.id,
      position: null
    });

    // Add to history
    this.auctionHistory.push({
      playerId: this.currentPlayer.id,
      playerName: this.currentPlayer.name,
      managerId: this.selectedManagerId,
      price: this.currentBid,
      timestamp: Date.now()
    });

    // Sync with presentation
    auctionSync.send(SYNC_MESSAGES.PLAYER_SOLD, {
      managerId: this.selectedManagerId,
      price: this.currentBid
    });

    // Save state
    this.saveStateQuiet();

    // Reset current auction
    this.currentPlayer = null;
    this.selectedManagerId = null;
    this.currentBid = 0;
    this.bidHistory = [];

    // Update UI
    this.renderPlayerList();
    this.renderManagerButtons();
    this.updateCurrentPlayerDisplay();
    this.updateAuctionHistory();
    this.updateStatistics();
  }

  markUnsold() {
    if (!this.currentPlayer) return;

    this.currentPlayer.status = 'unsold';

    // Sync with presentation
    auctionSync.send(SYNC_MESSAGES.PLAYER_UNSOLD, {});

    // Save state
    this.saveStateQuiet();

    // Reset
    this.currentPlayer = null;
    this.selectedManagerId = null;
    this.currentBid = 0;
    this.bidHistory = [];

    // Update UI
    this.renderPlayerList();
    this.updateCurrentPlayerDisplay();
  }

  resetCurrentAuction() {
    if (!confirm('Reset current auction? This will not affect sold/unsold status.')) return;

    this.currentPlayer = null;
    this.selectedManagerId = null;
    this.currentBid = 0;
    this.bidHistory = [];

    this.renderPlayerList();
    this.renderManagerButtons();
    this.updateCurrentPlayerDisplay();

    this.changeView('welcome');
  }

  // ===============================
  // LINEUP MANAGEMENT
  // ===============================

  assignPlayerToPosition(managerId, position, playerIdStr) {
    const manager = this.managers.find(m => m.id === managerId);
    if (!manager) return;

    const playerId = playerIdStr ? parseInt(playerIdStr) : null;

    // Initialize players array if needed
    if (!manager.players) manager.players = [];

    // Remove player from any current position
    if (playerId) {
      manager.players = manager.players.map(mp => {
        if (mp.id === playerId) {
          return { ...mp, position: position };
        }
        return mp;
      });

      // If player wasn't in the list, add them
      if (!manager.players.find(mp => mp.id === playerId)) {
        manager.players.push({ id: playerId, position: position });
      }
    }

    // Clear any other player from this position
    manager.players = manager.players.map(mp => {
      if (mp.position === position && mp.id !== playerId) {
        return { ...mp, position: null };
      }
      return mp;
    });

    // Sync with presentation
    auctionSync.send(SYNC_MESSAGES.UPDATE_LINEUP, {
      managerId,
      players: manager.players
    });

    // Refresh lineup UI
    this.renderLineupManagement(managerId);

    // Save state
    this.saveStateQuiet();
  }

  // ===============================
  // VIEW CONTROL
  // ===============================

  changeView(view) {
    this.currentView = view;
    auctionSync.send(SYNC_MESSAGES.CHANGE_VIEW, { view });
    this.updateViewButtons(view);
  }

  // ===============================
  // EXPORT/IMPORT
  // ===============================

  exportJSON() {
    const data = {
      config: this.config,
      players: this.players,
      managers: this.managers,
      auctionHistory: this.auctionHistory,
      exportedAt: new Date().toISOString()
    };

    this.downloadFile(
      JSON.stringify(data, null, 2),
      `auction-results-${this.getDateString()}.json`,
      'application/json'
    );
  }

  exportCSV() {
    const soldPlayers = this.players.filter(p => p.status === 'sold');

    const headers = ['Player Name', 'Category', 'Team', 'Manager', 'Base Price', 'Sold Price', 'Difference'];
    const rows = soldPlayers.map(player => {
      const manager = this.managers.find(m => m.id === player.soldTo);
      return [
        player.name,
        this.config.categoryNames[player.category],
        manager?.teamName || 'Unknown',
        manager?.name || 'Unknown',
        player.basePrice,
        player.soldPrice,
        player.soldPrice - player.basePrice
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    this.downloadFile(csv, `auction-results-${this.getDateString()}.csv`, 'text/csv');
  }

  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  saveState() {
    this.saveStateQuiet();
    alert('State saved successfully!');
  }

  saveStateQuiet() {
    auctionSync.saveState(this.getState());
  }

  loadSavedState() {
    const state = auctionSync.loadState();
    if (state) {
      this.restoreState(state);
      this.setupUI();
      this.updateStatistics();

      // Sync with presentation
      auctionSync.send(SYNC_MESSAGES.SYNC_STATE, state);

      alert('State loaded successfully!');
    } else {
      alert('No saved state found');
    }
  }

  importState(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (data.players && data.managers) {
          this.players = data.players;
          this.managers = data.managers;
          if (data.auctionHistory) this.auctionHistory = data.auctionHistory;

          this.setupUI();
          this.updateStatistics();

          // Sync with presentation
          auctionSync.send(SYNC_MESSAGES.SYNC_STATE, this.getState());

          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (err) {
        alert('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  }

  resetAllData() {
    if (!confirm('Are you sure you want to reset ALL auction data? This cannot be undone!')) return;
    if (!confirm('This will reset all players to unsold and restore all budgets. Continue?')) return;

    // Reset players
    this.players.forEach(player => {
      player.status = 'unsold';
      player.soldTo = null;
      player.soldPrice = null;
    });

    // Reset managers
    this.managers.forEach(manager => {
      manager.budget = this.config.totalBudget;
      manager.players = [];
    });

    // Reset state
    this.currentPlayer = null;
    this.selectedManagerId = null;
    this.currentBid = 0;
    this.bidHistory = [];
    this.auctionHistory = [];

    // Clear saved state
    auctionSync.clearState();

    // Sync with presentation
    auctionSync.send(SYNC_MESSAGES.SYNC_STATE, this.getState());

    // Update UI
    this.setupUI();
    this.updateStatistics();

    alert('All data has been reset');
  }

  // ===============================
  // STATE MANAGEMENT
  // ===============================

  getState() {
    return {
      players: this.players,
      managers: this.managers,
      currentPlayerId: this.currentPlayer?.id || null,
      currentBid: this.currentBid,
      bidHistory: this.bidHistory,
      selectedManagerId: this.selectedManagerId,
      auctionHistory: this.auctionHistory,
      currentView: this.currentView
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
    if (state.selectedManagerId) this.selectedManagerId = state.selectedManagerId;
    if (state.auctionHistory) this.auctionHistory = state.auctionHistory;
    if (state.currentView) this.currentView = state.currentView;

    console.log('State restored from saved data');
  }

  // ===============================
  // UTILITIES
  // ===============================

  formatCurrency(amount) {
    if (amount >= 1000000) {
      return `${this.config.currencySymbol}${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${this.config.currencySymbol}${(amount / 1000).toFixed(0)}K`;
    }
    return `${this.config.currencySymbol}${amount}`;
  }

  getDateString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  /**
   * Calculate the maximum amount a manager can spend on current player
   * while reserving enough budget for remaining players at base price
   *
   * Formula:
   * - playersStillNeeded = playersPerTeam - playersOwned
   * - playersToReserveFor = playersStillNeeded - 1 (excluding current player)
   * - reservedBudget = playersToReserveFor × basePrice
   * - maxSpendable = min(budget - reservedBudget, maxBidPerPlayer)
   */
  getMaxSpendableForManager(managerId) {
    const manager = this.managers.find(m => m.id === managerId);
    if (!manager) return 0;

    const playersPerTeam = this.config.playersPerTeam || 7;
    const basePrice = this.config.defaultBasePrice || 5000000;
    const maxBidPerPlayer = this.config.maxBidPerPlayer || 70000000;

    // Count players already owned by this manager
    const playersOwned = manager.players ? manager.players.length : 0;

    // Calculate how many more players they need (including current one)
    const playersStillNeeded = playersPerTeam - playersOwned;

    // If they have all players, they can't bid
    if (playersStillNeeded <= 0) return 0;

    // Reserve budget for remaining players AFTER this one
    const playersToReserveFor = playersStillNeeded - 1;
    const reservedBudget = playersToReserveFor * basePrice;

    // Max they can spend = budget minus reserved, capped at maxBidPerPlayer
    const maxFromBudget = manager.budget - reservedBudget;
    const maxSpendable = Math.min(maxFromBudget, maxBidPerPlayer);

    return Math.max(0, maxSpendable); // Never negative
  }

  /**
   * Get budget info for a manager (for display purposes)
   */
  getManagerBudgetInfo(managerId) {
    const manager = this.managers.find(m => m.id === managerId);
    if (!manager) return null;

    const playersPerTeam = this.config.playersPerTeam || 7;
    const basePrice = this.config.defaultBasePrice || 5000000;
    const playersOwned = manager.players ? manager.players.length : 0;
    const playersStillNeeded = playersPerTeam - playersOwned;
    const playersToReserveFor = Math.max(0, playersStillNeeded - 1);
    const reservedBudget = playersToReserveFor * basePrice;

    return {
      totalBudget: manager.budget,
      playersOwned: playersOwned,
      playersNeeded: playersStillNeeded,
      reservedForOthers: reservedBudget,
      maxSpendable: this.getMaxSpendableForManager(managerId)
    };
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.auctionControl = new AuctionControl();
});
