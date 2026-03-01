import { useState, useCallback } from 'react';
import { adbManager } from '../lib/adb';
import { Adb } from '@yume-chan/adb';

export function useAdb() {
    const [adb, setAdb] = useState<Adb | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connect = useCallback(async () => {
        setConnecting(true);
        setError(null);
        try {
            const device = await adbManager.requestDevice();
            if (device) {
                const connectedAdb = await adbManager.connect(device);
                setAdb(connectedAdb);
            }
        } catch (err: any) {
            console.error('Connection error:', err);
            setError(err.message || 'Failed to connect to device');
        } finally {
            setConnecting(false);
        }
    }, []);

    const disconnect = useCallback(async () => {
        try {
            await adbManager.disconnect();
            setAdb(null);
        } catch (err: any) {
            console.error('Disconnect error:', err);
        }
    }, []);

    return {
        adb,
        connecting,
        error,
        connect,
        disconnect,
        isConnected: !!adb
    };
}
