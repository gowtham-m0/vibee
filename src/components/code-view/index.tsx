"use client";
import { useEffect } from "react";

import "./code-theme.css";

interface Props {
    code: string;
    lang: string;
}

export const CodeView = ({ code, lang }: Props) => {
    useEffect(() => {
        // Dynamically import Prism and language components only on the client
        let mounted = true;

        const loadPrism = async () => {
            try {
                const PrismModule = await import("prismjs");
                // Support both CJS interop shapes: module.default or module itself
                const Prism = (PrismModule && (PrismModule as any).default) ? (PrismModule as any).default : (PrismModule as any);

            // Some Prism language plugins expect a global Prism variable — ensure it's set
                if (typeof window !== "undefined") {
                    (window as any).Prism = Prism;
                }

                // Load dependencies in order (jsx depends on js, tsx depends on jsx and typescript)
                await import("prismjs/components/prism-javascript");
                await import("prismjs/components/prism-jsx");
                await import("prismjs/components/prism-typescript");
                await import("prismjs/components/prism-tsx");

                if (!mounted) return;

                if (Prism && typeof Prism.highlightAll === "function") {
                    Prism.highlightAll();
                } else {
                    console.warn("Prism loaded but highlightAll is not available", Prism);
                }
            } catch (err) {
                console.error("Failed to load Prism for CodeView:", err);
            }
        };

        loadPrism();

        return () => {
            mounted = false;
        };
    }, [code]);

    return (
        <pre className="p-2 bg-transparent border-none rounded-md m-0 text-xs ">
            <code className={`language-${lang}`}>{code}</code>
        </pre>
    );
};