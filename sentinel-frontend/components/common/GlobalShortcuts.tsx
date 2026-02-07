'use client';

import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

export function GlobalShortcuts() {
    const { showHelp, setShowHelp, shortcuts } = useKeyboardShortcuts();

    return (
        <KeyboardShortcutsModal
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            shortcuts={shortcuts}
        />
    );
}
