interface LoadingSpinnerProps {
    label?: string;
    className?: string;
}

export function LoadingSpinner({
    className = "",
}: LoadingSpinnerProps) {
    return (
        <div className={`flex min-h-[220px] w-full items-center justify-center ${className}`.trim()}>
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#E7EAF0] border-t-[#4E525D]" />
        </div>
    );
}
