import { EncryptedPayload } from './crypto';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface RealtimeMessage {
  type: string;
  [key: string]: any;
}

export class RealtimeSyncManager {
  private ws: WebSocket | null = null;
  private syncId: string = '';
  private deviceId: string = '';
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private isExplicitlyClosed: boolean = false;
  private reconnectAttempts: number = 0;

  public status: ConnectionStatus = 'disconnected';
  public connectedDevices: number = 1;

  public onRemoteMutationCallback?: (
    payload: EncryptedPayload,
    fromDeviceId: string,
    updatedAt: string
  ) => void;
  public onPresenceChangeCallback?: (deviceCount: number) => void;
  public onStatusChangeCallback?: (status: ConnectionStatus) => void;

  constructor(syncId: string, deviceId: string) {
    this.syncId = syncId;
    this.deviceId = deviceId;
  }

  public updateCredentials(syncId: string, deviceId: string) {
    const changed = this.syncId !== syncId;
    this.syncId = syncId;
    this.deviceId = deviceId;
    if (changed && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.joinRoom();
    }
  }

  public connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.setStatus('connecting');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.setStatus('connected');
        this.startHeartbeat();
        this.joinRoom();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      this.ws.onclose = () => {
        this.stopHeartbeat();
        this.setStatus('disconnected');
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        console.warn('Real-time WebSocket warning/error:', err);
      };
    } catch (e) {
      console.error('WebSocket connection error:', e);
      this.setStatus('disconnected');
      this.scheduleReconnect();
    }
  }

  public disconnect() {
    this.isExplicitlyClosed = true;
    this.stopHeartbeat();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  private joinRoom() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.syncId) return;

    this.ws.send(
      JSON.stringify({
        type: 'JOIN_ROOM',
        syncId: this.syncId,
        deviceId: this.deviceId,
      })
    );
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }));
      }
    }, 25000);
  }

  private stopHeartbeat() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 15000);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.isExplicitlyClosed) {
        this.connect();
      }
    }, delay);
  }

  private setStatus(status: ConnectionStatus) {
    if (this.status !== status) {
      this.status = status;
      this.onStatusChangeCallback?.(status);
    }
  }

  private handleServerMessage(msg: RealtimeMessage) {
    switch (msg.type) {
      case 'ROOM_JOINED': {
        this.connectedDevices = msg.deviceCount || 1;
        this.onPresenceChangeCallback?.(this.connectedDevices);

        // If there's an existing record on server when we joined, notify if newer
        if (msg.latestRecord) {
          const payload: EncryptedPayload = {
            ciphertext: msg.latestRecord.ciphertext,
            iv: msg.latestRecord.iv,
            salt: msg.latestRecord.salt,
            version: msg.latestRecord.version,
          };
          this.onRemoteMutationCallback?.(
            payload,
            msg.latestRecord.lastModifiedBy || 'cloud',
            msg.latestRecord.updatedAt
          );
        }
        break;
      }

      case 'PRESENCE_UPDATE': {
        this.connectedDevices = msg.deviceCount || 1;
        this.onPresenceChangeCallback?.(this.connectedDevices);
        break;
      }

      case 'REMOTE_SYNC_MUTATION': {
        const payload: EncryptedPayload = {
          ciphertext: msg.ciphertext,
          iv: msg.iv,
          salt: msg.salt,
          version: msg.version,
        };
        this.onRemoteMutationCallback?.(payload, msg.clientDeviceId, msg.updatedAt);
        break;
      }

      case 'PONG':
        break;
    }
  }

  /**
   * Broadcast an encrypted mutation to all other devices in the room
   */
  public pushMutation(
    payload: EncryptedPayload,
    updatedAt: string
  ): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false; // not sent via WS, fallback to HTTP REST
    }

    try {
      this.ws.send(
        JSON.stringify({
          type: 'PUSH_MUTATION',
          syncId: this.syncId,
          ciphertext: payload.ciphertext,
          iv: payload.iv,
          salt: payload.salt,
          version: payload.version,
          updatedAt,
          clientDeviceId: this.deviceId,
        })
      );
      return true;
    } catch (e) {
      console.warn('Failed to send mutation via WebSocket:', e);
      return false;
    }
  }
}
