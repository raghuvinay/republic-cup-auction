/**
 * Sync Module - Handles real-time communication between Presentation and Control Panel
 * Uses BroadcastChannel API for same-device sync and localStorage for fallback
 */

class AuctionSync {
  constructor() {
    this.channel = null;
    this.listeners = new Map();
    this.isConnected = false;
    this.storageKey = 'auction_sync_state';
    this.messageKey = 'auction_sync_message';

    this.init();
  }

  init() {
    // Try BroadcastChannel first (modern browsers, same device)
    if ('BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('football_auction');
        this.channel.onmessage = (event) => this.handleMessage(event.data);
        this.isConnected = true;
        console.log('Sync: Using BroadcastChannel');
      } catch (e) {
        console.warn('BroadcastChannel failed, using localStorage fallback');
        this.setupLocalStorageFallback();
      }
    } else {
      this.setupLocalStorageFallback();
    }

    // Also listen to storage events for cross-tab sync
    window.addEventListener('storage', (event) => {
      if (event.key === this.messageKey && event.newValue) {
        try {
          const message = JSON.parse(event.newValue);
          this.handleMessage(message);
        } catch (e) {
          console.error('Failed to parse storage message:', e);
        }
      }
    });

    // Announce connection
    this.send('connected', { timestamp: Date.now() });
  }

  setupLocalStorageFallback() {
    this.isConnected = true;
    console.log('Sync: Using localStorage fallback');
  }

  /**
   * Send a message to all connected views
   * @param {string} type - Message type
   * @param {object} data - Message data
   */
  send(type, data = {}) {
    const message = {
      type,
      data,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };

    // Send via BroadcastChannel if available
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {
        console.error('BroadcastChannel send failed:', e);
      }
    }

    // Also store in localStorage for fallback
    try {
      localStorage.setItem(this.messageKey, JSON.stringify(message));
    } catch (e) {
      console.error('localStorage send failed:', e);
    }
  }

  /**
   * Handle incoming messages
   * @param {object} message - The message object
   */
  handleMessage(message) {
    if (!message || !message.type) return;

    const handlers = this.listeners.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (e) {
          console.error(`Error in handler for ${message.type}:`, e);
        }
      });
    }

    // Also notify 'all' listeners
    const allHandlers = this.listeners.get('*');
    if (allHandlers) {
      allHandlers.forEach(handler => {
        try {
          handler(message.type, message.data);
        } catch (e) {
          console.error('Error in wildcard handler:', e);
        }
      });
    }
  }

  /**
   * Subscribe to a message type
   * @param {string} type - Message type to listen for ('*' for all)
   * @param {function} handler - Handler function
   * @returns {function} Unsubscribe function
   */
  on(type, handler) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(handler);

    return () => {
      const handlers = this.listeners.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  /**
   * Save complete auction state to localStorage
   * @param {object} state - Complete auction state
   */
  saveState(state) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        ...state,
        savedAt: Date.now()
      }));
      console.log('State saved successfully');
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }

  /**
   * Load auction state from localStorage
   * @returns {object|null} Saved state or null
   */
  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load state:', e);
    }
    return null;
  }

  /**
   * Clear saved state
   */
  clearState() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('State cleared');
    } catch (e) {
      console.error('Failed to clear state:', e);
    }
  }

  /**
   * Get connection status
   * @returns {boolean}
   */
  getStatus() {
    return this.isConnected;
  }

  /**
   * Close the connection
   */
  close() {
    if (this.channel) {
      this.channel.close();
    }
    this.listeners.clear();
    this.isConnected = false;
  }
}

// Message Types Constants
const SYNC_MESSAGES = {
  // View control
  CHANGE_VIEW: 'change_view',

  // Auction flow
  SELECT_PLAYER: 'select_player',
  SHOW_TEASER: 'show_teaser',
  REVEAL_PLAYER: 'reveal_player',
  START_BIDDING: 'start_bidding',
  UPDATE_BID: 'update_bid',
  PLAYER_SOLD: 'player_sold',
  PLAYER_UNSOLD: 'player_unsold',

  // Data updates
  UPDATE_MANAGERS: 'update_managers',
  UPDATE_PLAYERS: 'update_players',
  UPDATE_LINEUP: 'update_lineup',

  // State sync
  REQUEST_STATE: 'request_state',
  SYNC_STATE: 'sync_state',

  // Connection
  CONNECTED: 'connected',
  PING: 'ping',
  PONG: 'pong'
};

// Create global sync instance
const auctionSync = new AuctionSync();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AuctionSync, SYNC_MESSAGES, auctionSync };
}
