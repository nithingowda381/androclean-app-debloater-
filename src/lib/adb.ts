import {
    Adb,
    AdbDaemonTransport,
} from '@yume-chan/adb';
import {
    AdbDaemonWebUsbDeviceManager,
    AdbDaemonWebUsbDevice,
    AdbDaemonWebUsbConnection
} from '@yume-chan/adb-daemon-webusb';
import AdbWebCredentialStore from '@yume-chan/adb-credential-web';

export class WebAdbManager {
    private adb: Adb | null = null;
    private connection: AdbDaemonWebUsbConnection | null = null;
    private transport: AdbDaemonTransport | null = null;

    // Global credential store for the browser
    private static credentialStore = new AdbWebCredentialStore();

    /**
     * Request the user to select an Android device via WebUSB.
     */
    async requestDevice(): Promise<AdbDaemonWebUsbDevice | null> {
        const Manager = AdbDaemonWebUsbDeviceManager.BROWSER;
        if (!Manager) {
            throw new Error('WebUSB is not supported in this browser.');
        }

        const device = await Manager.requestDevice();
        if (!device) return null;
        return device as AdbDaemonWebUsbDevice;
    }

    /**
     * Connect and authenticate to the selected WebUSB device.
     */
    async connect(device: AdbDaemonWebUsbDevice): Promise<Adb> {
        try {
            this.connection = await device.connect();

            this.transport = await AdbDaemonTransport.authenticate({
                serial: device.serial,
                connection: this.connection,
                credentialStore: WebAdbManager.credentialStore,
            });

            this.adb = new Adb(this.transport);
            return this.adb;
        } catch (error) {
            console.error('Failed to connect to device:', error);
            throw error;
        }
    }

    /**
     * Disconnect the current ADB session.
     */
    async disconnect() {
        if (this.adb) {
            await this.adb.close();
            this.adb = null;
        }
        if (this.transport) {
            this.transport = null;
        }
        if (this.connection) {
            this.connection = null; // Transport close should handle connection close
        }
    }

    /**
     * Get the currently connected ADB instance
     */
    getAdb(): Adb | null {
        return this.adb;
    }

    /**
     * Run a shell command on the device and return the output as text
     */
    async shell(command: string): Promise<string> {
        if (!this.adb) throw new Error('Not connected to any device');

        try {
            const output = await this.adb.subprocess.noneProtocol.spawnWaitText(command);
            eventBus.emit({
                message: `> ${command}\n${output || 'Success'}`,
                type: output?.toLowerCase().includes('success') ? 'success' : 'info'
            });
            return output || '';
        } catch (error) {
            console.error(`Shell execution failed for command "${command}":`, error);
            eventBus.emit({
                message: `[ERROR] > ${command}`,
                type: 'error'
            });
            throw error;
        }
    }
}

export interface LogEvent {
    id: string;
    timestamp: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

class EventBus {
    private logs: LogEvent[] = [];
    private listeners: ((logs: LogEvent[]) => void)[] = [];

    emit(event: Omit<LogEvent, 'id' | 'timestamp'>) {
        const fullEvent: LogEvent = {
            ...event,
            id: Date.now().toString() + Math.random().toString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        this.logs.push(fullEvent);
        this.notify();
    }

    clear() {
        this.logs = [];
        this.notify();
    }

    getLogs() {
        return this.logs;
    }

    subscribe(listener: (logs: LogEvent[]) => void) {
        this.listeners.push(listener);
        listener(this.logs); // Initial call
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.logs));
    }
}

export const eventBus = new EventBus();
export const adbManager = new WebAdbManager();
