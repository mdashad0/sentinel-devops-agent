'use client';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
    shortcuts: { key: string; description: string }[];
}

export function KeyboardShortcutsModal({
    isOpen,
    onClose,
    shortcuts
}: KeyboardShortcutsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">⌨️ Keyboard Shortcuts</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="M6 6 18 18" /></svg>
                    </button>
                </div>

                <div className="space-y-2">
                    {shortcuts.map(({ key, description }) => (
                        <div
                            key={key}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                        >
                            <span className="text-muted-foreground">{description}</span>
                            <kbd className="px-2 py-1 bg-muted rounded text-sm font-mono text-foreground border border-border shadow-sm">
                                {key.replace('+', ' + ').toUpperCase()}
                            </kbd>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-sm text-muted-foreground">
                    <p>
                        Press <kbd className="px-1 bg-muted rounded border border-border">?</kbd> to show help
                    </p>
                    <p>
                        Press <kbd className="px-1 bg-muted rounded border border-border">Esc</kbd> to close
                    </p>
                </div>
            </div>
        </div>
    );
}
