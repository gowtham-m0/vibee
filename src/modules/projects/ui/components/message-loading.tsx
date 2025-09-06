import Image from "next/image";
import { useEffect, useState } from "react";

const ShimmerMessage = ()=>{
    const messages = [
        "Thinking",
        "Loading",
        "Generating",
        "Analysing your request",
        "Building your website",
        "Crafting components",
        "Optimizing layouts",
        "Adding final touches",
        "Almost ready",
    ];

    const [currentmessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(()=>{
        const interval = setInterval(()=>{
            setCurrentMessageIndex((prev)=>(prev + 1) % messages.length);
    },2000);
    return ()=> clearInterval(interval);
    },[messages.length]);

    return (
        <div className="flex items-center gap-2">
            <span className="text-base text-muted-foreground animate-pulse">
                {messages[currentmessageIndex]}
            </span>
        </div>
    )
}

export const MessageLoading = () => {
return (
    <div className="flex flex-col group px-2 pb-4">
        <div className="flex items-center gap-2 pl-2 mb-2">
            <Image
                src="/logo.svg"
                alt="Vibe"
                width={18}
                height={18}
                className="shrink-0"
            />
            <span className="text-sm font-medium">Vibe</span>
        </div>
        <div className="pl-8.5 flex felx-col gap-y-4">
            <ShimmerMessage />
        </div>
    </div>
)

}